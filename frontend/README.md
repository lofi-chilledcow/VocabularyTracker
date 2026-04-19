# VocabularyTracker — Frontend

React 19 single-page application built with Vite and TypeScript, styled with Tailwind CSS.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages](#pages)
- [Components](#components)
- [Custom Hooks](#custom-hooks)
- [API Client](#api-client)
- [Types](#types)
- [Architecture Notes](#architecture-notes)
- [Testing](#testing)
- [Docker](#docker)

---

## Tech Stack

| Tool                    | Version  | Purpose                            |
|-------------------------|----------|------------------------------------|
| React                   | 19.2.4   | UI framework                       |
| React Router DOM        | 7.14.1   | Client-side routing                |
| Vite                    | 8.0.4    | Build tool + dev server            |
| TypeScript              | ~6.0.2   | Type safety                        |
| Tailwind CSS            | 3.4.19   | Utility-first styling              |
| Axios                   | 1.15.0   | HTTP client                        |
| Lucide React            | 1.8.0    | Icon library                       |
| date-fns                | 4.1.0    | Date formatting and arithmetic     |
| Vitest + Testing Library| 4.1.4    | Unit and component testing         |
| ESLint                  | 9.39.4   | Linting                            |

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component, router setup
│   ├── api/
│   │   └── client.ts         # Axios instance with base URL
│   ├── pages/
│   │   ├── Home.tsx          # Word management (CRUD + search/sort/filter)
│   │   └── Daily.tsx         # Calendar-based daily word view
│   ├── components/
│   │   ├── WordCard.tsx      # Word display card
│   │   ├── WordForm.tsx      # Create/edit word form
│   │   ├── TagInput.tsx      # Synonym tag input
│   │   ├── Modal.tsx         # Generic modal wrapper
│   │   ├── ConfirmDialog.tsx # Delete confirmation dialog
│   │   ├── SortBar.tsx       # Sort/search/filter controls
│   │   └── StatsBar.tsx      # Vocabulary statistics bar
│   ├── hooks/
│   │   ├── useWords.ts       # Word CRUD and filtering state
│   │   └── useStats.ts       # Stats fetching state
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   └── tests/
│       ├── setup.ts
│       ├── WordCard.test.tsx
│       ├── WordForm.test.tsx
│       ├── StatsBar.test.tsx
│       └── TagInput.test.tsx
├── public/
├── index.html
├── vite.config.ts            # Vite + Vitest config, API proxy
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── nginx.conf                # Production SPA nginx config
├── Dockerfile
└── package.json
```

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies all `/api/*` requests to `http://localhost:5000` (the backend).

Available scripts:

| Script           | Description                         |
|------------------|-------------------------------------|
| `npm run dev`    | Vite dev server with HMR            |
| `npm run build`  | Production build to `dist/`         |
| `npm run preview`| Serve the production build locally  |
| `npm test`       | Run Vitest test suite               |
| `npm run lint`   | ESLint check                        |

---

## Environment Variables

```env
VITE_API_URL=http://192.168.1.100:5000   # Backend API base URL
```

In development the Vite proxy handles `/api` → `:5000` automatically, so `VITE_API_URL` is not needed locally. In production it is injected at Docker build time via `--build-arg`.

---

## Pages

### `/` — Home

The main word management interface.

**Features:**
- Grid of `WordCard` components
- FAB button (bottom-right `+`) to open the create word modal
- `SortBar` for search, sort (date / A–Z / category), and category filter
- `StatsBar` showing aggregate vocabulary statistics
- Edit word — opens pre-filled `WordForm` modal
- Delete word — opens `ConfirmDialog` before deleting
- Debounced search (300 ms) triggers re-fetch

**State:**
```
words[]         — current word list
loading         — fetch in progress
error           — fetch error message
modalOpen       — create/edit modal visibility
editTarget      — word being edited (null = create mode)
deleteTarget    — word pending deletion
submitting      — form submit in progress
deleting        — delete in progress
statsKey        — incremented to force StatsBar re-mount after mutations
```

---

### `/daily` — Daily

Calendar-based view showing words added on a specific day.

**Features:**
- Rolling 14-day strip with word count badges per day
- Left/right navigation arrows to shift the strip window
- Click a day to load words for that date
- "Today" label on the current date
- Read-only word cards (no edit/delete)

**State:**
```
currentDate     — selected date
words[]         — words for selected date
fetchedDate     — last successfully fetched date (prevents duplicate fetches)
strip[]         — 14-day window of dates
```

---

## Components

### `WordCard`

Displays a single word entry.

- **Props:** `word: Word`, `onEdit`, `onDelete`
- Shows: word title, meaning, optional sentence, category badge, antonym badge, synonym pills
- Edit (pencil icon) and Delete (trash icon) buttons appear on hover
- Footer shows creation date formatted with date-fns

---

### `WordForm`

Create or edit a word.

- **Props:** `initial?: Word`, `onSubmit(data)`, `onCancel`, `loading`
- Fields: word\*, meaning\*, sentence, category (autocomplete), antonym, synonyms (TagInput)
- Fetches existing categories from `/api/categories` for the autocomplete dropdown
- Validates that `word` and `meaning` are non-empty before submit
- `initial` prop populates fields for edit mode

---

### `TagInput`

Manages a list of synonym tags.

- **Props:** `value: string[]`, `onChange(tags)`
- Type a synonym and press **Enter** or **,** to add
- Press **Backspace** on empty input to remove the last tag
- Click **×** on any tag to remove it
- Prevents duplicate entries (case-insensitive)

---

### `Modal`

Generic overlay modal.

- **Props:** `title`, `onClose`, `children`
- Closes on **Escape** key or backdrop click
- Scrollable content area for tall forms

---

### `ConfirmDialog`

Delete confirmation dialog built on `Modal`.

- **Props:** `word: Word`, `onConfirm`, `onCancel`, `loading`
- Shows the word name and a warning message
- Cancel / Delete buttons with loading spinner during deletion

---

### `SortBar`

Search, sort, and filter controls for the Home page.

- **Props:** `filter: FilterState`, `onChange(filter)`
- Sort buttons: **By Date** / **A–Z** / **By Category**
- Search input with 300 ms debounce
- Category dropdown fetches options from `/api/categories`

---

### `StatsBar`

Vocabulary statistics display.

- **Props:** `key` (used externally to trigger re-mount/refetch)
- Fetches from `/api/stats` on mount
- Displays 4 stat cards: Total Words, Added Today, This Week, Streak (with fire icon)
- Responsive: 2 columns on mobile, 4 on desktop
- Skeleton loading state while fetching

---

## Custom Hooks

### `useWords`

Manages word list state and all CRUD operations.

```ts
const {
  words,       // Word[]
  loading,     // boolean
  error,       // string | null
  filter,      // FilterState
  setFilter,   // (filter: FilterState) => void
  createWord,  // (data: WordFormData) => Promise<Word>
  updateWord,  // (id: string, data: WordFormData) => Promise<Word>
  deleteWord,  // (id: string) => Promise<void>
  refetch,     // () => void
} = useWords();
```

- Auto-fetches words whenever `filter` changes (via `useEffect`)
- Passes `sort`, `q`, and `category` as query params to `GET /api/words`

---

### `useStats`

Fetches vocabulary statistics.

```ts
const {
  stats,    // Stats | null
  loading,  // boolean
  refetch,  // () => void
} = useStats();
```

- Fetches on mount; errors are silently ignored (stats are non-critical)

---

## API Client

`src/api/client.ts` exports a configured Axios instance:

```ts
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});
```

In development the empty base URL combined with the Vite dev proxy means all `/api/*` calls are forwarded to `:5000`.

---

## Types

```ts
interface Word {
  id: string;
  word: string;
  meaning: string;
  sentence?: string;
  category?: string;
  antonym?: string;
  synonyms: string[];
  created_at: string;
  updated_at: string;
}

interface WordFormData {
  word: string;
  meaning: string;
  sentence?: string;
  category?: string;
  antonym?: string;
  synonyms?: string[];
}

interface DailyGroup {
  date: string;
  count: number;
  words: Word[];
}

interface Stats {
  totalWords: number;
  totalCategories: number;
  wordsToday: number;
  wordsThisWeek: number;
  streakDays: number;
}

type SortOption = "date" | "alpha" | "category";

interface FilterState {
  sort: SortOption;
  q: string;
  category: string;
}
```

---

## Architecture Notes

- **No global state manager** — each page manages its own state via custom hooks. `useWords` encapsulates all word list logic; `useStats` handles stats independently.
- **Debounced search** — search input changes are debounced 300 ms before triggering a re-fetch to avoid hammering the API on every keystroke.
- **StatsBar re-mount pattern** — after mutations (create/update/delete), the Home page increments `statsKey` which is passed as the React `key` prop to `StatsBar`, causing it to unmount and remount (and re-fetch stats) without needing a prop callback.
- **Vite proxy** — `vite.config.ts` proxies `/api` to `http://localhost:5000` in development, so no CORS configuration is needed locally.
- **Mobile-first** — all layouts use Tailwind's mobile-first defaults with `sm:` breakpoints for wider screens.

---

## Testing

```bash
npm test
```

Uses Vitest with `@testing-library/react` and `@testing-library/user-event`.

Test files:
- `tests/WordCard.test.tsx` — renders word data, edit/delete callbacks
- `tests/WordForm.test.tsx` — form validation, submit behavior
- `tests/StatsBar.test.tsx` — stats display and loading state
- `tests/TagInput.test.tsx` — tag add/remove interactions

---

## Docker

```bash
# Build (inject API URL at build time)
docker build --build-arg VITE_API_URL=http://192.168.1.100:5000 -t vocab-frontend .

# Run
docker run -p 8080:8080 vocab-frontend
```

The Dockerfile uses a two-stage build:
1. **builder** — runs `npm install` and `vite build` with `VITE_API_URL` injected
2. **serve** — copies `dist/` into an `nginx:alpine` image on port 8080

`nginx.conf` handles SPA routing: all non-file requests are rewritten to `/index.html` so React Router handles client-side navigation.
