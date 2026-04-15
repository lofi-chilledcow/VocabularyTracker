import { Router, Request, Response, NextFunction } from 'express'
import db from '../db/database'
import { DailyGroup } from '../types'

const router = Router()

const WORD_SELECT = `
  SELECT
    w.id, w.word, w.meaning, w.sentence,
    w.category, w.acronym,
    w.created_at, w.updated_at,
    GROUP_CONCAT(s.synonym, '||') AS synonyms
  FROM words w
  LEFT JOIN synonyms s ON s.word_id = w.id
`

function parseWord(row: any) {
  return {
    ...row,
    synonyms: row.synonyms ? row.synonyms.split('||').filter(Boolean) : []
  }
}

// GET /api/daily?date=YYYY-MM-DD  → words for that specific day
// GET /api/daily                  → last 30 days grouped by date
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query

    if (date) {
      const rows = db.prepare(`
        ${WORD_SELECT}
        WHERE strftime('%Y-%m-%d', w.created_at) = ?
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `).all(date)

      return res.json(rows.map(parseWord))
    }

    // Last 30 days grouped by date
    const dates = db.prepare(`
      SELECT DISTINCT strftime('%Y-%m-%d', created_at) AS date
      FROM words
      WHERE created_at >= strftime('%Y-%m-%d %H:%M:%S', 'now', '-30 days', 'localtime')
      ORDER BY date DESC
    `).all() as { date: string }[]

    const groups: DailyGroup[] = dates.map(({ date }) => {
      const words = db.prepare(`
        ${WORD_SELECT}
        WHERE strftime('%Y-%m-%d', w.created_at) = ?
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `).all(date).map(parseWord)

      return { date, count: words.length, words }
    })

    res.json(groups)
  } catch (err) {
    next(err)
  }
})

export default router
