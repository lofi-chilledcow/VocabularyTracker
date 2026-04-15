import { Router, Request, Response, NextFunction } from 'express'
import db from '../db/database'

const router = Router()

// GET /api/categories
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM words
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY category COLLATE NOCASE ASC
    `).all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
