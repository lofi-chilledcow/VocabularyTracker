# VocabularyTracker — MCP Server

Model Context Protocol (MCP) server that exposes all VocabularyTracker API operations as AI tools. Connect it to any MCP-compatible client (e.g. Claude Desktop) to manage your vocabulary through natural language.

---

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Tools](#available-tools)
- [Connecting to Claude Desktop](#connecting-to-claude-desktop)
- [Architecture Notes](#architecture-notes)
- [Building](#building)

---

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets AI assistants call external tools and data sources. This server implements the MCP protocol over **stdio transport**, meaning an AI client launches it as a subprocess and communicates via stdin/stdout.

---

## Tech Stack

| Tool                        | Version  | Purpose                         |
|-----------------------------|----------|---------------------------------|
| @modelcontextprotocol/sdk   | 1.29.0   | MCP server framework            |
| Axios                       | 1.15.1   | HTTP client for API calls       |
| Zod                         | (bundled) | Tool parameter validation       |
| TypeScript                  | 6.0.3    | Type safety                     |
| dotenv                      | —        | Environment variable loading    |
| ts-node                     | 10.9.x   | Development runner              |

---

## Project Structure

```
mcp-server/
├── src/
│   └── index.ts        # MCP server — all tool definitions
├── dist/               # Compiled output (after npm run build)
├── .env.example        # Environment variable template
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Getting Started

```bash
cd mcp-server
cp .env.example .env
# Edit .env — set API_URL to your backend address
npm install
npm run dev     # Run with ts-node (development)
```

Available scripts:

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Run directly with ts-node            |
| `npm run build` | Compile TypeScript to `dist/`        |
| `npm start`     | Run compiled `dist/index.js`         |

---

## Environment Variables

```env
API_URL=http://192.168.1.224:5000   # VocabularyTracker backend base URL
```

Copy `.env.example` to `.env` and update `API_URL` to point to your running backend instance.

---

## Available Tools

All tools return a human-readable success message with the JSON response body, or a clear error message if the API call fails.

---

### `add_word`

Add a new word to VocabularyTracker.

**Parameters:**

| Name       | Type       | Required | Description              |
|------------|------------|----------|--------------------------|
| `word`     | string     | Yes      | The word to add          |
| `meaning`  | string     | Yes      | Definition of the word   |
| `sentence` | string     | No       | Example sentence         |
| `category` | string     | No       | Word category (e.g. Noun)|
| `antonym`  | string     | No       | Antonym of the word      |
| `synonyms` | string[]   | No       | List of synonyms         |

**API call:** `POST /api/words`

---

### `search_words`

Search words by keyword (matches word text and meaning).

**Parameters:**

| Name | Type   | Required | Description      |
|------|--------|----------|------------------|
| `q`  | string | Yes      | Search keyword   |

**API call:** `GET /api/words?q=<keyword>`

---

### `list_words`

List all words with optional sorting and category filtering.

**Parameters:**

| Name       | Type                          | Required | Description             |
|------------|-------------------------------|----------|-------------------------|
| `sort`     | `date` \| `alpha` \| `category` | No     | Sort order              |
| `category` | string                        | No       | Filter by category      |

**API call:** `GET /api/words?sort=<sort>&category=<category>`

---

### `get_word`

Get a single word by its ID.

**Parameters:**

| Name | Type   | Required | Description |
|------|--------|----------|-------------|
| `id` | string | Yes      | Word UUID   |

**API call:** `GET /api/words/:id`

---

### `delete_word`

Delete a word by its ID.

**Parameters:**

| Name | Type   | Required | Description |
|------|--------|----------|-------------|
| `id` | string | Yes      | Word UUID   |

**API call:** `DELETE /api/words/:id`

---

### `get_stats`

Get vocabulary statistics.

**Parameters:** none

**Returns:**
```json
{
  "totalWords": 42,
  "totalCategories": 7,
  "wordsToday": 2,
  "wordsThisWeek": 10,
  "streakDays": 5
}
```

**API call:** `GET /api/stats`

---

### `get_daily`

Get words added on a specific date (or today if no date given).

**Parameters:**

| Name   | Type   | Required | Description                            |
|--------|--------|----------|----------------------------------------|
| `date` | string | No       | Date in `YYYY-MM-DD` format (default: today) |

**API call:** `GET /api/daily?date=<date>`

---

### `list_categories`

List all word categories with their word counts.

**Parameters:** none

**Returns:**
```json
[
  { "category": "Adjective", "count": 5 },
  { "category": "Noun", "count": 12 }
]
```

**API call:** `GET /api/categories`

---

## Connecting to Claude Desktop

1. Build the server:
   ```bash
   npm run build
   ```

2. Open your Claude Desktop config file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3. Add the MCP server entry:
   ```json
   {
     "mcpServers": {
       "vocabulary-tracker": {
         "command": "node",
         "args": ["C:/path/to/VocabularyTracker/mcp-server/dist/index.js"],
         "env": {
           "API_URL": "http://192.168.1.224:5000"
         }
       }
     }
   }
   ```

4. Restart Claude Desktop. The tools will appear in the tool picker.

You can then ask Claude things like:
- _"Add the word 'ephemeral' meaning 'lasting a very short time'"_
- _"Search my vocabulary for words related to happiness"_
- _"Show me my vocabulary stats"_
- _"What words did I add today?"_

---

## Architecture Notes

- **stdio transport** — the MCP client (e.g. Claude Desktop) launches this process and communicates over stdin/stdout. All logging goes to stderr to avoid polluting the protocol stream.
- **Axios instance** — a single Axios instance with `baseURL` set from `API_URL` is shared across all tools for consistent error handling.
- **Zod validation** — all tool parameters are defined with Zod schemas, which the MCP SDK uses to generate the tool's JSON Schema for the client.
- **Error handling** — every tool has a try/catch. `AxiosError` responses are unpacked to show the HTTP status and response body. Other errors are stringified. All errors set `isError: true` in the MCP response.

---

## Building

```bash
npm run build
# Output: dist/index.js
```

The TypeScript compiler targets ES2020 with CommonJS modules. The `dist/` folder is gitignored — build locally before deploying or configuring your MCP client.
