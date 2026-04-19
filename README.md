# VocabularyTracker

A full-stack vocabulary learning application with a React frontend, Node.js/Express backend, SQLite database, and an MCP (Model Context Protocol) server for AI integration.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Services](#services)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [MCP Server (AI Integration)](#mcp-server-ai-integration)

---

## Overview

VocabularyTracker lets you build and manage a personal vocabulary list. You can:

- Add, edit, delete, and search words
- Attach meanings, example sentences, categories, antonyms, and synonyms
- Browse words by date with a 14-day calendar strip
- View vocabulary statistics (total words, today, this week, streak)
- Interact with your vocabulary through any MCP-compatible AI client (e.g. Claude Desktop)

---

## Project Structure

```
VocabularyTracker/
├── backend/          # Express.js API + SQLite database
├── frontend/         # React 19 + Vite SPA
├── mcp-server/       # Model Context Protocol server for AI integration
├── data/             # SQLite database file (runtime, gitignored)
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example      # VM_IP for production deployment
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                                                         │
│  ┌──────────────────────┐   ┌─────────────────────────┐ │
│  │   React Frontend     │   │   AI Client (Claude)    │ │
│  │   :8080 (nginx)      │   │   via MCP protocol      │ │
│  └──────────┬───────────┘   └────────────┬────────────┘ │
└─────────────┼────────────────────────────┼──────────────┘
              │ HTTP                        │ stdio
              ▼                            ▼
     ┌────────────────┐         ┌───────────────────┐
     │  Express API   │◄────────│   MCP Server      │
     │  :5000         │  HTTP   │   (axios client)  │
     └────────┬───────┘         └───────────────────┘
              │
              ▼
     ┌────────────────┐
     │  SQLite DB     │
     │  (better-      │
     │   sqlite3)     │
     └────────────────┘
```

---

## Services

| Service      | Tech                          | Port  | Description                    |
|--------------|-------------------------------|-------|--------------------------------|
| `backend`    | Node.js 20, Express 5, SQLite | 5000  | REST API + database            |
| `frontend`   | React 19, Vite, nginx         | 8080  | Single-page application        |
| `mcp-server` | MCP SDK, TypeScript           | stdio | AI tool bridge (local process) |

---

## Environment Variables

**Root `.env.example`:**
```env
VM_IP=your_vm_ip_here   # Used by docker-compose.prod.yml to set CORS and API URLs
```

See each sub-directory for their own `.env.example` files.

---

## Quick Start

### Docker (recommended)

```bash
# Development
docker compose up --build

# Production
VM_IP=192.168.1.100 docker compose -f docker-compose.prod.yml up --build -d
```

Frontend → http://localhost:8080
Backend API → http://localhost:5000

---

## Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev       # ts-node with nodemon, hot reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server with HMR on :5173, proxies /api to :5000
```

### MCP Server

```bash
cd mcp-server
cp .env.example .env   # set API_URL
npm install
npm run dev            # ts-node src/index.ts
```

---

## Production Deployment

The production stack uses two Docker containers orchestrated by `docker-compose.prod.yml`:

- **Backend** builds TypeScript, installs production deps only, rebuilds `better-sqlite3` for the target platform.
- **Frontend** builds the Vite SPA with `VITE_API_URL` injected at build time, then serves it via nginx.
- A named Docker volume (`vocab_data`) persists the SQLite database between container restarts.

```bash
# On your server/VM
cp .env.example .env
# Edit .env — set VM_IP to your server's IP
docker compose -f docker-compose.prod.yml up --build -d
```

---

## MCP Server (AI Integration)

The `mcp-server/` directory contains an MCP server that exposes all VocabularyTracker API operations as AI tools. Connect it to any MCP-compatible client (e.g. Claude Desktop) to manage your vocabulary through natural language.

See [mcp-server/README.md](mcp-server/README.md) for setup and configuration details.
