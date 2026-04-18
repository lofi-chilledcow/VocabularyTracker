import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH || './data/vocab.db'
const dir = path.dirname(path.resolve(DB_PATH))

fs.mkdirSync(dir, { recursive: true })

const db = new Database(path.resolve(DB_PATH))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Migrate: rename acronym → antonym if the old column still exists
const cols = (db.prepare(`PRAGMA table_info(words)`).all() as { name: string }[]).map(c => c.name)
if (cols.includes('acronym')) {
  db.exec(`ALTER TABLE words RENAME COLUMN acronym TO antonym`)
}

db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id          TEXT PRIMARY KEY,
    word        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    meaning     TEXT NOT NULL,
    sentence    TEXT,
    category    TEXT,
    antonym     TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now','localtime')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS synonyms (
    id       TEXT PRIMARY KEY,
    word_id  TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    synonym  TEXT NOT NULL,
    UNIQUE(word_id, synonym)
  );
`)

const count = (db.prepare('SELECT COUNT(*) as count FROM words').get() as any).count
if (count === 0) {
  const insertWord = db.prepare(`
    INSERT INTO words (id, word, meaning, sentence, category, antonym)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertSyn = db.prepare(`
    INSERT OR IGNORE INTO synonyms (id, word_id, synonym)
    VALUES (?, ?, ?)
  `)

  const seed = db.transaction(() => {
    const id1 = uuidv4()
    insertWord.run(id1, 'Ephemeral', 'Lasting for a very short time',
      'Social media trends are ephemeral.', 'Adjective', null)
    insertSyn.run(uuidv4(), id1, 'fleeting')
    insertSyn.run(uuidv4(), id1, 'transient')

    const id2 = uuidv4()
    insertWord.run(id2, 'Serendipity', 'Finding something good without looking for it',
      'It was pure serendipity that we met.', 'Noun', null)
    insertSyn.run(uuidv4(), id2, 'luck')
    insertSyn.run(uuidv4(), id2, 'chance')

    const id3 = uuidv4()
    insertWord.run(id3, 'Eloquent', 'Fluent and persuasive in speaking or writing',
      'She gave an eloquent speech.', 'Adjective', null)
    insertSyn.run(uuidv4(), id3, 'articulate')
    insertSyn.run(uuidv4(), id3, 'expressive')
  })

  seed()
}

export default db
