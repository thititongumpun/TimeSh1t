# TimeSh1t — Design Spec
**Date:** 2026-06-11

## Overview

A personal desktop timesheet tracker built with Tauri 2.0 + Preact. Two pages: Home (timesheets) and Projects. Backed by Supabase Postgres with email authentication. AI summary field populated externally via Cloudflare (future integration).

---

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2.0 |
| Frontend | Preact + Vite + TypeScript |
| Routing | preact-iso |
| State | Preact Signals |
| Styles | DaisyUI + Tailwind CSS |
| Backend / Auth | Supabase (Postgres + email auth) |
| Supabase client | @supabase/supabase-js |

Rust layer is minimal — window hosting only. All business logic and data access live in TypeScript.

---

## Database Schema

### `projects`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → auth.users, for RLS |
| `project_no` | text | |
| `project_name` | text | |
| `is_active` | bool | |
| `inserted_at` | timestamp | default now() |

### `timesheets`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → auth.users, for RLS |
| `date_memo` | timestamptz | date the work was done |
| `description` | text | |
| `project_id` | uuid | FK → projects.id |
| `inserted_at` | timestamptz | default now() |
| `is_complete` | bool | |
| `ai_summary` | text | populated externally via Cloudflare |

**RLS policy on both tables:** `auth.uid() = user_id`

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx                     — router + auth gate
├── lib/
│   └── supabase.ts             — supabase client singleton
├── services/
│   ├── auth.ts                 — signIn, signOut, getSession
│   ├── timesheets.ts           — CRUD + filter queries
│   └── projects.ts             — CRUD queries
├── store/
│   └── auth.ts                 — signal: currentUser
├── pages/
│   ├── Login.tsx
│   ├── Home.tsx
│   └── Projects.tsx
├── components/
│   ├── Layout.tsx              — sidebar + content shell
│   ├── Sidebar.tsx
│   ├── timesheets/
│   │   ├── TimesheetTable.tsx
│   │   ├── TimesheetFilters.tsx
│   │   └── TimesheetModal.tsx
│   └── projects/
│       ├── ProjectTable.tsx
│       └── ProjectModal.tsx
└── types/
    └── index.ts                — Timesheet, Project TypeScript types
```

---

## Auth Flow

1. On app launch, `App.tsx` calls `supabase.auth.getSession()`
2. No session → render `<Login />`
3. Successful sign-in → set `currentUser` signal → route to Home
4. `supabase.auth.onAuthStateChange` keeps signal synced for token refreshes and sign-outs
5. Session persisted in `localStorage` — re-opens skip login
6. Sign-out button in sidebar footer

`<Login />` has email + password fields and a DaisyUI error alert. No sign-up UI — users provisioned via Supabase dashboard.

---

## Navigation

Left sidebar with:
- App title / logo at top
- Nav links: Home, Projects (active link highlighted)
- Sign out button at bottom

---

## Home Page — Timesheets

### Filter Bar (top)
- Date range: from/to date pickers, default = current month
- Project: dropdown of active projects
- Status: All / Complete / Incomplete

Filters held in Preact Signals, applied live on change (no submit button).

### Table Columns
`Date` | `Description` | `Project` | `Complete` (checkbox) | `AI Summary` (truncated, tooltip) | `Actions` (Edit / Delete)

### Create / Edit
- Floating "+" button (DaisyUI btn-circle) opens blank modal
- Edit icon on row opens modal pre-filled
- Modal fields: `date_memo` (date picker), `description` (textarea), `project_id` (dropdown of active projects), `is_complete` (checkbox)
- `ai_summary` shown as read-only in modal
- `inserted_at` set server-side, not in form

---

## Projects Page

### Table Columns
`Project No` | `Project Name` | `Active` (badge) | `Created At` | `Actions` (Edit / Delete)

No filters — plain table.

### Create / Edit
- "+" button opens blank `<ProjectModal />`
- Modal fields: `project_no` (text), `project_name` (text), `is_active` (toggle)
- Delete blocked by FK if linked timesheets exist — error surfaced as DaisyUI toast

---

## Data Layer

### Services (typed async functions, no UI)
- `auth.ts`: `signIn(email, password)`, `signOut()`, `getSession()`
- `timesheets.ts`: `fetchTimesheets(filters)`, `createTimesheet(data)`, `updateTimesheet(id, data)`, `deleteTimesheet(id)`
- `projects.ts`: `fetchProjects()`, `createProject(data)`, `updateProject(id, data)`, `deleteProject(id)`

### State
- `currentUser` signal in `store/auth.ts` — null when logged out
- Page-level data (rows, filter values) in local component signals

### Error Handling
Services return Supabase's `{ data, error }` shape. Components check `error` and render a DaisyUI `alert-error` toast.

---

## Environment Variables

```
VITE_SUPABASE_URL=<to be provided>
VITE_SUPABASE_ANON_KEY=<to be provided>
```

---

## Out of Scope (this phase)
- Cloudflare AI summary integration (field exists, populated externally)
- Sign-up flow (users provisioned via Supabase dashboard)
- Offline mode / background sync
