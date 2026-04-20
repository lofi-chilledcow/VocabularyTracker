import { Router, Request, Response, NextFunction } from 'express'
import db from '../db/database'
import { Stats } from '../types'

const router = Router()

// GET /api/stats
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalWords = (
      db.prepare('SELECT COUNT(*) as count FROM words').get() as any
    ).count as number

    const totalCategories = (
      db.prepare(`
        SELECT COUNT(DISTINCT category) as count
        FROM words
        WHERE category IS NOT NULL AND category != ''
      `).get() as any
    ).count as number

    const wordsToday = (
      db.prepare(`
        SELECT COUNT(*) as count FROM words
        WHERE strftime('%Y-%m-%d', created_at, 'localtime') = strftime('%Y-%m-%d', 'now', 'localtime')
      `).get() as any
    ).count as number

    const wordsThisWeek = (
      db.prepare(`
        SELECT COUNT(*) as count FROM words
        WHERE strftime('%Y-%m-%d', created_at, 'localtime') >= strftime('%Y-%m-%d', 'now', '-7 days', 'localtime')
      `).get() as any
    ).count as number

    // Streak: consecutive days (including today) that have at least one word
    const days = db.prepare(`
      SELECT DISTINCT strftime('%Y-%m-%d', created_at, 'localtime') AS date
      FROM words
      ORDER BY date DESC
    `).all() as { date: string }[]

    let streakDays = 0
    const now = new Date()

    for (let i = 0; i < days.length; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const expectedStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      if (days[i].date === expectedStr) {
        streakDays++
      } else {
        break
      }
    }

    const stats: Stats = {
      totalWords,
      totalCategories,
      wordsToday,
      wordsThisWeek,
      streakDays
    }

    res.json(stats)
  } catch (err) {
    next(err)
  }
})

export default router
