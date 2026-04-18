import { Router, Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database'
import { WordFormData } from '../types'

const router = Router()

const WORD_SELECT = `
  SELECT
    w.id, w.word, w.meaning, w.sentence,
    w.category, w.antonym,
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

// GET /api/words
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sort = 'date', q, category } = req.query

    const conditions: string[] = []
    const params: any[] = []

    if (q) {
      conditions.push('(w.word LIKE ? OR w.meaning LIKE ? OR w.sentence LIKE ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    if (category) {
      conditions.push('w.category = ?')
      params.push(category)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderBy =
      sort === 'alpha'    ? 'w.word COLLATE NOCASE ASC' :
      sort === 'category' ? 'w.category COLLATE NOCASE ASC, w.word COLLATE NOCASE ASC' :
                            'w.created_at DESC'

    const rows = db.prepare(`
      ${WORD_SELECT}
      ${where}
      GROUP BY w.id
      ORDER BY ${orderBy}
    `).all(...params)

    res.json(rows.map(parseWord))
  } catch (err) {
    next(err)
  }
})

// POST /api/words
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: WordFormData = req.body

    if (!body.word?.trim())    return res.status(400).json({ error: 'Word is required' })
    if (!body.meaning?.trim()) return res.status(400).json({ error: 'Meaning is required' })

    const create = db.transaction(() => {
      const id = uuidv4()

      db.prepare(`
        INSERT INTO words (id, word, meaning, sentence, category, antonym)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        body.word.trim(),
        body.meaning.trim(),
        body.sentence?.trim() || null,
        body.category?.trim() || null,
        body.antonym?.trim()  || null
      )

      if (body.synonyms?.length) {
        const insertSyn = db.prepare(
          'INSERT OR IGNORE INTO synonyms (id, word_id, synonym) VALUES (?, ?, ?)'
        )
        for (const syn of body.synonyms) {
          if (syn.trim()) insertSyn.run(uuidv4(), id, syn.trim())
        }
      }

      return id
    })

    const id = create()
    const word = parseWord(
      db.prepare(`${WORD_SELECT} WHERE w.id = ? GROUP BY w.id`).get(id)
    )

    res.status(201).json(word)
  } catch (err: any) {
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Word already exists' })
    }
    next(err)
  }
})

// GET /api/words/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = db.prepare(
      `${WORD_SELECT} WHERE w.id = ? GROUP BY w.id`
    ).get(req.params.id)

    if (!row) return res.status(404).json({ error: 'Word not found' })

    res.json(parseWord(row))
  } catch (err) {
    next(err)
  }
})

// PUT /api/words/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: WordFormData = req.body
    const { id } = req.params

    const existing = db.prepare('SELECT id FROM words WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Word not found' })

    if (!body.word?.trim())    return res.status(400).json({ error: 'Word is required' })
    if (!body.meaning?.trim()) return res.status(400).json({ error: 'Meaning is required' })

    const update = db.transaction(() => {
      db.prepare(`
        UPDATE words
        SET word = ?, meaning = ?, sentence = ?, category = ?, antonym = ?,
            updated_at = strftime('%Y-%m-%d %H:%M:%S','now','localtime')
        WHERE id = ?
      `).run(
        body.word.trim(),
        body.meaning.trim(),
        body.sentence?.trim() || null,
        body.category?.trim() || null,
        body.antonym?.trim()  || null,
        id
      )

      db.prepare('DELETE FROM synonyms WHERE word_id = ?').run(id)

      if (body.synonyms?.length) {
        const insertSyn = db.prepare(
          'INSERT OR IGNORE INTO synonyms (id, word_id, synonym) VALUES (?, ?, ?)'
        )
        for (const syn of body.synonyms) {
          if (syn.trim()) insertSyn.run(uuidv4(), id, syn.trim())
        }
      }
    })

    update()

    const word = parseWord(
      db.prepare(`${WORD_SELECT} WHERE w.id = ? GROUP BY w.id`).get(id)
    )

    res.json(word)
  } catch (err: any) {
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Word already exists' })
    }
    next(err)
  }
})

// DELETE /api/words/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const existing = db.prepare('SELECT id FROM words WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Word not found' })

    db.prepare('DELETE FROM words WHERE id = ?').run(id)

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
