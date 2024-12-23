# Fullstack Task Manager

Task creation, editing, categorization, **real-time updates**, and lightweight **collaboration** — built with **Next.js**, **React**, and **FastAPI**.

## Features

| Capability | Approach |
|---|---|
| Task CRUD | FastAPI + SQLModel (SQLite by default) |
| Categories | Named labels with colors and filter queries |
| Real-time sync | WebSocket hub broadcasting create/update/delete |
| Collaboration | Assignees on tasks + threaded comments |
| Frontend board | Next.js App Router UI with live connection status |

## Architecture

```
Next.js (app/)  --HTTP/WS-->  FastAPI (backend/)
   TaskBoard UI                 routers: tasks, categories, comments, realtime
   filters + forms              SQLModel models + SQLite/Postgres
```

The Next.js rewrite proxy forwards `/api/*` and `/ws` to the FastAPI process during local development.

## Quick start

### 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env

python -m backend.seed
uvicorn backend.main:app --reload --port 8000
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend

```bash
npm install
npm run next-dev
```

App: [http://localhost:3000](http://localhost:3000)

### 3. Both together

```bash
npm run dev
```

## API overview

- `GET /api/health` — readiness
- `GET/POST /api/tasks` — list (with filters) / create
- `GET/PATCH/DELETE /api/tasks/{id}` — read / update / delete
- `GET/POST /api/categories` — list / create
- `GET/POST /api/tasks/{id}/comments` — collaboration thread
- `WS /ws` — live board events (`task.created`, `task.updated`, `task.deleted`, `comment.created`)

### Task filters

Query params on `GET /api/tasks`:

- `status` — `todo` | `in_progress` | `done`
- `priority` — `low` | `medium` | `high`
- `category_id` — integer
- `assignee` — exact match
- `q` — title/description search

## Project layout

```
app/                 # Next.js App Router pages
frontend/
  components/        # Board, forms, filters, comments
  hooks/             # WebSocket client
  lib/               # API client + types
backend/
  routers/           # HTTP + WebSocket routes
  models.py          # SQLModel entities
  realtime.py        # Connection manager
  seed.py            # Demo data
data/                # Local SQLite database
tests/               # Backend API tests
```

## Configuration

See `.env.example` for database URL, CORS origins, and WebSocket host overrides.

## License

MIT
