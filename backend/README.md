# VocabularyTracker — Backend

Node.js + Express REST API backed by a SQLite database.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Architecture Notes](#architecture-notes)
- [Testing](#testing)
- [Docker](#docker)

---

## Tech Stack

| Tool              | Version  | Purpose                          |
|-------------------|----------|----------------------------------|
| Node.js           | 20       | Runtime                          |
| Express           | 5.2.1    | HTTP framework                   |
| better-sqlite3    | 12.9.0   | SQLite driver (synchronous)      |
| TypeScript        | 6.0.2    | Type safety                      |
| uuid              | 13.0.0   | Primary key generation           |
| dotenv            | 16.x     | Environment variable loading     |
| Jest + ts-jest    | —        | Unit testing                     |
| nodemon           | —        | Hot reload in development        |

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point — starts HTTP server
│   ├── app.ts                # Express app setup, middleware, routes
│   ├── db/
│   │   └── database.ts       # SQLite connection, schema init, migrations
│   ├── routes/
│   │   ├── words.ts          # CRUD for /api/words
│   │   ├── categories.ts     # GET /api/categories
│   │   ├── daily.ts          # GET /api/daily
│   │   └── stats.ts          # GET /api/stats
│   ├── middleware/
│   │   └── errorHandler.ts   # Global Express error handler
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── tests/
│   ├── setup.ts
│   ├── words.test.ts
│   ├── categories.test.ts
│   ├── daily.test.ts
│   └── stats.test.ts
├── __mocks__/
│   └── uuid.js               # Deterministic UUID for tests
├── data/                     # SQLite DB file lives here (gitignored)
├── .env.example
├── nodemon.json
├── tsconfig.json
├── Dockerfile
└── package.json
```

---

## Getting Started

```bash
cd backend
cp .env.example .env
npm install
npm run dev       # nodemon + ts-node, auto-restarts on changes
```

The server starts at `http://localhost:5000`.

Available scripts:

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Development with hot reload        |
| `npm run build` | Compile TypeScript to `dist/`      |
| `npm start`     | Run compiled `dist/index.js`       |
| `npm test`      | Run Jest test suite                |

---

## Environment Variables

```env
PORT=5000                          # HTTP server port
DB_PATH=./data/vocab.db            # Path to SQLite file
FRONTEND_URL=http://localhost:5173 # CORS allowed origin
```

---

## API Reference

### Base URL

```
http://localhost:5000
```

### Health

| Method | Path      | Description        |
|--------|-----------|--------------------|
| GET    | /health   | Returns `{ ok: true }` |

---

### Words

#### `GET /api/words`

List all words. Supports filtering and sorting via query parameters.

| Query Param | Type                       | Description                     |
|-------------|----------------------------|---------------------------------|
| `q`         | string                     | Search keyword (word or meaning)|
| `sort`      | `date` \| `alpha` \| `category` | Sort order (default: `date`) |
| `category`  | string                     | Filter by category              |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "word": "Ephemeral",
    "meaning": "Lasting for a very short time",
    "sentence": "The ephemeral beauty of cherry blossoms...",
    "category": "Adjective",
    "antonym": "permanent",
    "synonyms": ["transient", "fleeting"],
    "created_at": "2026-04-19T10:00:00.000Z",
    "updated_at": "2026-04-19T10:00:00.000Z"
  }
]
```

---

#### `POST /api/words`

Create a new word.

**Request body:**
```json
{
  "word": "Serendipity",
  "meaning": "The occurrence of happy events by chance",
  "sentence": "Finding that book was pure serendipity.",
  "category": "Noun",
  "antonym": "misfortune",
  "synonyms": ["luck", "fortune"]
}
```

- `word` and `meaning` are required.
- `word` must be unique (case-insensitive).

**Response** `201 Created` — returns the created word object.

---

#### `GET /api/words/:id`

Get a single word by UUID.

**Response** `200 OK` — returns the word object, or `404` if not found.

---

#### `PUT /api/words/:id`

Update a word. Replaces all synonyms with the new array.

**Request body:** same shape as POST (all fields optional except existing constraints).

**Response** `200 OK` — returns the updated word object.

---

#### `DELETE /api/words/:id`

Delete a word and its synonyms (cascade).

**Response** `200 OK`
```json
{ "message": "Word deleted successfully" }
```

---

### Categories

#### `GET /api/categories`

List all categories that have at least one word, sorted alphabetically.

**Response** `200 OK`
```json
[
  { "category": "Adjective", "count": 5 },
  { "category": "Noun", "count": 12 }
]
```

---

### Daily

#### `GET /api/daily`

Get words grouped by day for the last 30 days.

**Response** `200 OK`
```json
[
  {
    "date": "2026-04-19",
    "count": 3,
    "words": [ ...word objects... ]
  }
]
```

#### `GET /api/daily?date=YYYY-MM-DD`

Get words added on a specific date.

**Response** `200 OK` — same `DailyGroup` shape for that single date.

---

### Stats

#### `GET /api/stats`

Get vocabulary statistics.

**Response** `200 OK`
```json
{
  "totalWords": 42,
  "totalCategories": 7,
  "wordsToday": 2,
  "wordsThisWeek": 10,
  "streakDays": 5
}
```

`streakDays` is the number of consecutive days (ending today) on which at least one word was added.

---

## Database Schema

```sql
CREATE TABLE words (
  id          TEXT PRIMARY KEY,
  word        TEXT UNIQUE COLLATE NOCASE,
  meaning     TEXT NOT NULL,
  sentence    TEXT,
  category    TEXT,
  antonym     TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE synonyms (
  id       TEXT PRIMARY KEY,
  word_id  TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  synonym  TEXT NOT NULL,
  UNIQUE(word_id, synonym)
);
```

- WAL journaling mode is enabled for better concurrent read performance.
- Foreign keys are enforced (`PRAGMA foreign_keys = ON`).
- The database is seeded with 3 example words on first run.
- A migration automatically renames the old `acronym` column to `antonym` if present.

---

## Architecture Notes

- **Synchronous SQLite** — `better-sqlite3` uses a synchronous API, keeping route handlers simple without async/await overhead for DB calls.
- **Synonyms as a join table** — synonyms are stored in a separate table with a foreign key to `words`, enabling clean cascade deletes and deduplication.
- **Route-level error propagation** — routes call `next(err)` and the global `errorHandler` middleware formats the response as `{ error: message }`.
- **UUID primary keys** — all IDs are UUIDs generated via the `uuid` package for portability.

---

## Testing

```bash
npm test
```

Tests use Jest with `ts-jest`. The UUID module is mocked (`__mocks__/uuid.js`) for deterministic test output. Tests run with `--runInBand` to avoid SQLite concurrency issues.

Test files:
- `tests/words.test.ts` — CRUD operations
- `tests/categories.test.ts` — category aggregation
- `tests/daily.test.ts` — daily grouping and date filtering
- `tests/stats.test.ts` — stats and streak calculation

---

## Docker

```bash
# Build image
docker build -t vocab-backend .

# Run container
docker run -p 5000:5000 \
  -e FRONTEND_URL=http://your-frontend \
  -v vocab_data:/app/data \
  vocab-backend
```

The Dockerfile uses a two-stage build:
1. **builder** — installs all deps and compiles TypeScript
2. **production** — installs production deps only, rebuilds `better-sqlite3` for the target platform (`linux/amd64`)
