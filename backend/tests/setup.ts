/// <reference types="node" />
// Use in-memory SQLite so tests never touch the real vocab.db
process.env.DB_PATH = ':memory:'
