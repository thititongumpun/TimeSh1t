# TimeSh1t Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build TimeSh1t — a Tauri 2.0 desktop timesheet tracker with Preact frontend, Supabase auth + data, DaisyUI styling, and live-filtered tables for timesheets and projects.

**Architecture:** Supabase JS client runs in the Preact webview. TypeScript service modules wrap all DB calls. Preact Signals hold reactive state. preact-iso handles routing. Rust is window-only.

**Tech Stack:** Tauri 2.0, Preact 10, Vite 6, TypeScript, Tailwind CSS v3 + DaisyUI v4, @supabase/supabase-js, preact-iso, @preact/signals, Vitest + @testing-library/preact

---

## File Map

| Path | Action | Purpose |
|---|---|---|
| `vite.config.ts` | Modify | Keep Tauri options, no CSS plugin needed (PostCSS handles it) |
| `tailwind.config.cjs` | Create | Tailwind + DaisyUI config |
| `postcss.config.cjs` | Create | PostCSS config for Tailwind |
| `src/index.css` | Create | Tailwind directives |
| `src/main.tsx` | Modify | Import CSS, remove boilerplate |
| `src/App.tsx` | Replace | Auth gate + router |
| `src/App.css` | Delete import | Remove boilerplate (do not delete file, just remove import) |
| `vitest.config.ts` | Create | Vitest configuration |
| `src/test/setup.ts` | Create | jest-dom matchers |
| `.env.local` | Create | Supabase credential placeholders |
| `src/lib/supabase.ts` | Create | Supabase client singleton |
| `src/types/index.ts` | Create | Shared TypeScript types |
| `src/store/auth.ts` | Create | currentUser + authLoading signals |
| `src/services/auth.ts` | Create | signIn, signOut, getSession |
| `src/services/auth.test.ts` | Create | Auth service unit tests |
| `src/services/projects.ts` | Create | Projects CRUD |
| `src/services/projects.test.ts` | Create | Projects service tests |
| `src/services/timesheets.ts` | Create | Timesheets CRUD + filters |
| `src/services/timesheets.test.ts` | Create | Timesheets service tests |
| `src/components/Layout.tsx` | Create | Sidebar + content shell |
| `src/components/Sidebar.tsx` | Create | Nav links, sign out |
| `src/components/Sidebar.test.tsx` | Create | Sidebar render test |
| `src/pages/Login.tsx` | Create | Email/password login form |
| `src/pages/Login.test.tsx` | Create | Login form tests |
| `src/components/projects/ProjectTable.tsx` | Create | Projects data table |
| `src/components/projects/ProjectTable.test.tsx` | Create | Table render + interaction tests |
| `src/components/projects/ProjectModal.tsx` | Create | Create/edit modal |
| `src/pages/Projects.tsx` | Create | Projects page |
| `src/components/timesheets/TimesheetFilters.tsx` | Create | Date/project/status filters |
| `src/components/timesheets/TimesheetFilters.test.tsx` | Create | Filters component tests |
| `src/components/timesheets/TimesheetModal.tsx` | Create | Create/edit modal |
| `src/components/timesheets/TimesheetTable.tsx` | Create | Timesheets table |
| `src/pages/Home.tsx` | Create | Home/timesheets page |

---

### Task 1: Install dependencies + configure Tailwind CSS v3 + DaisyUI v4

**Files:**
- `package.json` (via npm install)
- Create: `tailwind.config.cjs`
- Create: `postcss.config.cjs`
- Create: `src/index.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install all dependencies**

```bash
npm install @supabase/supabase-js preact-iso @preact/signals
npm install -D tailwindcss@3 postcss autoprefixer "daisyui@^4" vitest @testing-library/preact @testing-library/jest-dom jsdom
```

Expected: All packages install without errors. No peer dependency conflicts.

- [ ] **Step 2: Create tailwind.config.cjs**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: { themes: ['dark'] },
}
```

- [ ] **Step 3: Create postcss.config.cjs**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Update src/main.tsx to import CSS (remove boilerplate render)**

```tsx
import { render } from 'preact'
import './index.css'
import App from './App'

render(<App />, document.getElementById('root')!)
```

- [ ] **Step 6: Verify Tailwind + DaisyUI work**

```bash
npm run dev
```

Open http://localhost:1420. The page should load (even if it shows the old boilerplate). No CSS build errors in terminal.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.cjs postcss.config.cjs src/index.css src/main.tsx package.json package-lock.json
git commit -m "chore: install deps and configure Tailwind CSS v3 + DaisyUI v4"
```

---

### Task 2: Vitest configuration + test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 2: Create src/test/setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Write a smoke test to verify the setup**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('test infrastructure', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm run test:run
```

Expected:
```
✓ src/test/smoke.test.ts > test infrastructure > runs
Test Files  1 passed (1)
```

- [ ] **Step 6: Delete the smoke test**

```bash
rm src/test/smoke.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: configure Vitest + @testing-library/preact"
```

---

### Task 3: TypeScript types + Supabase client + env

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`
- Create: `.env.local`

- [ ] **Step 1: Create src/types/index.ts**

```ts
export interface Project {
  id: string
  user_id: string
  project_no: string
  project_name: string
  is_active: boolean
  inserted_at: string
}

export interface Timesheet {
  id: string
  user_id: string
  date_memo: string
  description: string
  project_id: string | null
  inserted_at: string
  is_complete: boolean
  ai_summary: string | null
}

export interface TimesheetWithProject extends Timesheet {
  projects: { project_name: string; project_no: string } | null
}

export interface TimesheetFilters {
  date_from: string | null
  date_to: string | null
  project_id: string | null
  status: 'all' | 'complete' | 'incomplete'
}

export type ProjectInput = {
  project_no: string
  project_name: string
  is_active: boolean
}

export type TimesheetInput = {
  date_memo: string
  description: string
  project_id: string | null
  is_complete: boolean
}
```

- [ ] **Step 2: Create src/lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Create .env.local with placeholder credentials**

```
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-anon-key
```

- [ ] **Step 4: Verify .env.local is gitignored**

```bash
grep -n ".env" .gitignore
```

Expected: `.env.local` or `.env*` appears in `.gitignore`. If not, add `.env.local` to `.gitignore` manually.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/lib/supabase.ts
git commit -m "feat: add TypeScript types and Supabase client singleton"
```

Note: Do NOT commit `.env.local`.

---

### Task 4: Auth store + auth service (TDD)

**Files:**
- Create: `src/store/auth.ts`
- Create: `src/services/auth.ts`
- Create: `src/services/auth.test.ts`

- [ ] **Step 1: Write failing tests for auth service**

Create `src/services/auth.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '../lib/supabase'
import { signIn, signOut, getSession } from './auth'
import { currentUser, authLoading } from '../store/auth'

describe('auth service', () => {
  beforeEach(() => {
    currentUser.value = null
    authLoading.value = true
    vi.clearAllMocks()
  })

  it('signIn sets currentUser on success', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    } as any)

    await signIn('test@example.com', 'password')
    expect(currentUser.value).toEqual(mockUser)
  })

  it('signIn returns error without setting currentUser on failure', async () => {
    const mockError = { message: 'Invalid credentials' }
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    } as any)

    const { error } = await signIn('bad@example.com', 'wrong')
    expect(error).toEqual(mockError)
    expect(currentUser.value).toBeNull()
  })

  it('signOut clears currentUser on success', async () => {
    currentUser.value = { id: '123' } as any
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    await signOut()
    expect(currentUser.value).toBeNull()
  })

  it('getSession sets currentUser from active session', async () => {
    const mockUser = { id: '456' }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    } as any)

    await getSession()
    expect(currentUser.value).toEqual(mockUser)
  })

  it('getSession leaves currentUser null when no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    await getSession()
    expect(currentUser.value).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/services/auth.test.ts
```

Expected: FAIL with "Cannot find module './auth'"

- [ ] **Step 3: Create src/store/auth.ts**

```ts
import { signal } from '@preact/signals'
import type { User } from '@supabase/supabase-js'

export const currentUser = signal<User | null>(null)
export const authLoading = signal<boolean>(true)
```

- [ ] **Step 4: Create src/services/auth.ts**

```ts
import { supabase } from '../lib/supabase'
import { currentUser } from '../store/auth'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error && data.user) currentUser.value = data.user
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error) currentUser.value = null
  return { error }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (!error && data.session) currentUser.value = data.session.user
  return { data, error }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test:run -- src/services/auth.test.ts
```

Expected:
```
✓ auth service > signIn sets currentUser on success
✓ auth service > signIn returns error without setting currentUser on failure
✓ auth service > signOut clears currentUser on success
✓ auth service > getSession sets currentUser from active session
✓ auth service > getSession leaves currentUser null when no session
Test Files  1 passed (1)
```

- [ ] **Step 6: Commit**

```bash
git add src/store/auth.ts src/services/auth.ts src/services/auth.test.ts
git commit -m "feat: add auth store and auth service with tests"
```

---

### Task 5: Projects service (TDD)

**Files:**
- Create: `src/services/projects.ts`
- Create: `src/services/projects.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/projects.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

import { fetchProjects, fetchActiveProjects, createProject, updateProject, deleteProject } from './projects'

function makeChain(result: any) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  }
  return chain
}

describe('projects service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchProjects queries the projects table ordered by inserted_at desc', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchProjects()

    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.order).toHaveBeenCalledWith('inserted_at', { ascending: false })
  })

  it('fetchActiveProjects filters by is_active = true', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchActiveProjects()

    expect(chain.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('createProject inserts and returns single row', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await createProject({ project_no: 'P001', project_name: 'Alpha', is_active: true })

    expect(chain.insert).toHaveBeenCalledWith({ project_no: 'P001', project_name: 'Alpha', is_active: true })
    expect(chain.single).toHaveBeenCalled()
  })

  it('updateProject applies update by id', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await updateProject('1', { project_name: 'Beta' })

    expect(chain.update).toHaveBeenCalledWith({ project_name: 'Beta' })
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })

  it('deleteProject deletes by id', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await deleteProject('1')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/services/projects.test.ts
```

Expected: FAIL with "Cannot find module './projects'"

- [ ] **Step 3: Create src/services/projects.ts**

```ts
import { supabase } from '../lib/supabase'
import type { ProjectInput } from '../types'

export async function fetchProjects() {
  return supabase.from('projects').select('*').order('inserted_at', { ascending: false })
}

export async function fetchActiveProjects() {
  return supabase.from('projects').select('*').eq('is_active', true).order('project_name')
}

export async function createProject(data: ProjectInput) {
  return supabase.from('projects').insert(data).select().single()
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
  return supabase.from('projects').update(data).eq('id', id).select().single()
}

export async function deleteProject(id: string) {
  return supabase.from('projects').delete().eq('id', id)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/services/projects.test.ts
```

Expected: 5 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/projects.ts src/services/projects.test.ts
git commit -m "feat: add projects service with tests"
```

---

### Task 6: Timesheets service (TDD)

**Files:**
- Create: `src/services/timesheets.ts`
- Create: `src/services/timesheets.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/timesheets.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

import {
  fetchTimesheets,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
} from './timesheets'
import type { TimesheetFilters } from '../types'

function makeChain(result: any) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  }
  return chain
}

const emptyFilters: TimesheetFilters = {
  date_from: null,
  date_to: null,
  project_id: null,
  status: 'all',
}

describe('timesheets service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchTimesheets selects with project join ordered by date_memo desc', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets(emptyFilters)

    expect(mockFrom).toHaveBeenCalledWith('timesheets')
    expect(chain.select).toHaveBeenCalledWith('*, projects(project_name, project_no)')
    expect(chain.order).toHaveBeenCalledWith('date_memo', { ascending: false })
  })

  it('fetchTimesheets applies date_from filter when set', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets({ ...emptyFilters, date_from: '2026-06-01' })

    expect(chain.gte).toHaveBeenCalledWith('date_memo', '2026-06-01')
  })

  it('fetchTimesheets applies date_to filter when set', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets({ ...emptyFilters, date_to: '2026-06-30' })

    expect(chain.lte).toHaveBeenCalledWith('date_memo', '2026-06-30')
  })

  it('fetchTimesheets applies project_id filter when set', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets({ ...emptyFilters, project_id: 'p1' })

    expect(chain.eq).toHaveBeenCalledWith('project_id', 'p1')
  })

  it('fetchTimesheets applies is_complete=true when status is complete', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets({ ...emptyFilters, status: 'complete' })

    expect(chain.eq).toHaveBeenCalledWith('is_complete', true)
  })

  it('fetchTimesheets applies is_complete=false when status is incomplete', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTimesheets({ ...emptyFilters, status: 'incomplete' })

    expect(chain.eq).toHaveBeenCalledWith('is_complete', false)
  })

  it('createTimesheet inserts and returns single row', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await createTimesheet({
      date_memo: '2026-06-11',
      description: 'Did stuff',
      project_id: null,
      is_complete: false,
    })

    expect(chain.insert).toHaveBeenCalled()
    expect(chain.single).toHaveBeenCalled()
  })

  it('updateTimesheet applies update by id', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await updateTimesheet('1', { is_complete: true })

    expect(chain.update).toHaveBeenCalledWith({ is_complete: true })
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })

  it('deleteTimesheet deletes by id', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await deleteTimesheet('1')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/services/timesheets.test.ts
```

Expected: FAIL with "Cannot find module './timesheets'"

- [ ] **Step 3: Create src/services/timesheets.ts**

```ts
import { supabase } from '../lib/supabase'
import type { TimesheetFilters, TimesheetInput } from '../types'

export async function fetchTimesheets(filters: TimesheetFilters) {
  let query = supabase
    .from('timesheets')
    .select('*, projects(project_name, project_no)')

  if (filters.date_from) query = query.gte('date_memo', filters.date_from)
  if (filters.date_to) query = query.lte('date_memo', filters.date_to)
  if (filters.project_id) query = query.eq('project_id', filters.project_id)
  if (filters.status === 'complete') query = query.eq('is_complete', true)
  if (filters.status === 'incomplete') query = query.eq('is_complete', false)

  return query.order('date_memo', { ascending: false })
}

export async function createTimesheet(data: TimesheetInput) {
  return supabase.from('timesheets').insert(data).select().single()
}

export async function updateTimesheet(id: string, data: Partial<TimesheetInput>) {
  return supabase.from('timesheets').update(data).eq('id', id).select().single()
}

export async function deleteTimesheet(id: string) {
  return supabase.from('timesheets').delete().eq('id', id)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/services/timesheets.test.ts
```

Expected: 9 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/timesheets.ts src/services/timesheets.test.ts
git commit -m "feat: add timesheets service with filter support and tests"
```

---

### Task 7: Layout + Sidebar components

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Sidebar.test.tsx`

- [ ] **Step 1: Write failing test for Sidebar**

Create `src/components/Sidebar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import { LocationProvider } from 'preact-iso'
import { Sidebar } from './Sidebar'

vi.mock('../services/auth', () => ({ signOut: vi.fn() }))

describe('Sidebar', () => {
  function renderSidebar() {
    return render(
      <LocationProvider>
        <Sidebar />
      </LocationProvider>
    )
  }

  it('renders app title and nav links', () => {
    renderSidebar()
    expect(screen.getByText('TimeSh1t')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/components/Sidebar.test.tsx
```

Expected: FAIL with "Cannot find module './Sidebar'"

- [ ] **Step 3: Create src/components/Sidebar.tsx**

```tsx
import { useLocation } from 'preact-iso'
import { signOut } from '../services/auth'

export function Sidebar() {
  const { url } = useLocation()

  return (
    <aside class="w-48 min-h-screen bg-base-200 flex flex-col">
      <div class="p-4 font-bold text-xl text-primary">TimeSh1t</div>
      <nav class="flex-1 px-2">
        <ul class="menu menu-sm">
          <li>
            <a href="/" class={url === '/' ? 'active' : ''}>
              Home
            </a>
          </li>
          <li>
            <a href="/projects" class={url.startsWith('/projects') ? 'active' : ''}>
              Projects
            </a>
          </li>
        </ul>
      </nav>
      <div class="p-4">
        <button class="btn btn-ghost btn-sm w-full" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Create src/components/Layout.tsx**

```tsx
import type { ComponentChildren } from 'preact'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ComponentChildren
}

export function Layout({ children }: LayoutProps) {
  return (
    <div class="flex min-h-screen bg-base-100">
      <Sidebar />
      <main class="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test:run -- src/components/Sidebar.test.tsx
```

Expected: 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/Sidebar.tsx src/components/Sidebar.test.tsx src/components/Layout.tsx
git commit -m "feat: add Layout and Sidebar components"
```

---

### Task 8: Login page (TDD)

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/pages/Login.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/Login.test.tsx`:
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Login } from './Login'

vi.mock('../services/auth', () => ({
  signIn: vi.fn(),
}))

import { signIn } from '../services/auth'

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email and password inputs', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls signIn with entered credentials on submit', async () => {
    vi.mocked(signIn).mockResolvedValue({ data: { user: { id: '1' }, session: {} }, error: null } as any)
    render(<Login />)

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('user@example.com', 'secret'))
  })

  it('shows error alert when signIn returns an error', async () => {
    vi.mocked(signIn).mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } } as any)
    render(<Login />)

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } })
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/pages/Login.test.tsx
```

Expected: FAIL with "Cannot find module './Login'"

- [ ] **Step 3: Create src/pages/Login.tsx**

```tsx
import { useState } from 'preact/hooks'
import { signIn } from '../services/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-base-100">
      <div class="card w-96 bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-2">TimeSh1t</h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div class="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}
            <div class="form-control mb-4">
              <label class="label" for="email">
                <span class="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                class="input input-bordered"
                value={email}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
              />
            </div>
            <div class="form-control mb-6">
              <label class="label" for="password">
                <span class="label-text">Password</span>
              </label>
              <input
                id="password"
                type="password"
                class="input input-bordered"
                value={password}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
              />
            </div>
            <button
              type="submit"
              class={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/pages/Login.test.tsx
```

Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx src/pages/Login.test.tsx
git commit -m "feat: add Login page with tests"
```

---

### Task 9: App.tsx auth gate + router

**Files:**
- Modify: `src/App.tsx` (full replacement)

- [ ] **Step 1: Replace src/App.tsx with auth gate + router**

```tsx
import { useEffect } from 'preact/hooks'
import { LocationProvider, Router } from 'preact-iso'
import { supabase } from './lib/supabase'
import { currentUser, authLoading } from './store/auth'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { Layout } from './components/Layout'

export function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      currentUser.value = session?.user ?? null
      authLoading.value = false
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading.value) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-100">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!currentUser.value) {
    return <Login />
  }

  return (
    <LocationProvider>
      <Layout>
        <Router>
          <Home path="/" />
          <Projects path="/projects" />
        </Router>
      </Layout>
    </LocationProvider>
  )
}

export default App
```

Note: `Home` and `Projects` are not created yet — TypeScript will error until Task 10 and 11 complete. That is expected at this stage.

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: App auth gate + preact-iso router"
```

---

### Task 10: Projects components + page (TDD)

**Files:**
- Create: `src/components/projects/ProjectTable.tsx`
- Create: `src/components/projects/ProjectTable.test.tsx`
- Create: `src/components/projects/ProjectModal.tsx`
- Create: `src/pages/Projects.tsx`

- [ ] **Step 1: Write failing tests for ProjectTable**

Create `src/components/projects/ProjectTable.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import { ProjectTable } from './ProjectTable'
import type { Project } from '../../types'

const mockProjects: Project[] = [
  {
    id: 'p1',
    user_id: 'u1',
    project_no: 'P001',
    project_name: 'Alpha',
    is_active: true,
    inserted_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'p2',
    user_id: 'u1',
    project_no: 'P002',
    project_name: 'Beta',
    is_active: false,
    inserted_at: '2026-02-01T00:00:00Z',
  },
]

describe('ProjectTable', () => {
  it('renders all project rows', () => {
    render(<ProjectTable projects={mockProjects} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('P001')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('P002')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows Active badge for active projects and Inactive for inactive', () => {
    render(<ProjectTable projects={mockProjects} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('calls onEdit with the project when Edit is clicked', () => {
    const onEdit = vi.fn()
    render(<ProjectTable projects={mockProjects} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getAllByText('Edit')[0])
    expect(onEdit).toHaveBeenCalledWith(mockProjects[0])
  })

  it('calls onDelete with project id when Del is clicked', () => {
    const onDelete = vi.fn()
    render(<ProjectTable projects={mockProjects} onEdit={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByText('Del')[0])
    expect(onDelete).toHaveBeenCalledWith('p1')
  })

  it('renders empty state when no projects', () => {
    render(<ProjectTable projects={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('No projects yet.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/components/projects/ProjectTable.test.tsx
```

Expected: FAIL with "Cannot find module './ProjectTable'"

- [ ] **Step 3: Create src/components/projects/ProjectTable.tsx**

```tsx
import type { Project } from '../../types'

interface Props {
  projects: Project[]
  onEdit: (p: Project) => void
  onDelete: (id: string) => void
}

export function ProjectTable({ projects, onEdit, onDelete }: Props) {
  if (projects.length === 0) {
    return <p class="text-base-content/50 py-8 text-center">No projects yet.</p>
  }

  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Project No.</th>
            <th>Project Name</th>
            <th>Active</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.project_no}</td>
              <td>{p.project_name}</td>
              <td>
                <span class={`badge ${p.is_active ? 'badge-success' : 'badge-ghost'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(p.inserted_at).toLocaleDateString()}</td>
              <td class="flex gap-1">
                <button class="btn btn-ghost btn-xs" onClick={() => onEdit(p)}>
                  Edit
                </button>
                <button class="btn btn-ghost btn-xs text-error" onClick={() => onDelete(p.id)}>
                  Del
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/components/projects/ProjectTable.test.tsx
```

Expected: 5 passing tests.

- [ ] **Step 5: Create src/components/projects/ProjectModal.tsx**

```tsx
import { useState } from 'preact/hooks'
import { createProject, updateProject } from '../../services/projects'
import type { Project, ProjectInput } from '../../types'

interface Props {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: Props) {
  const [projectNo, setProjectNo] = useState(project?.project_no ?? '')
  const [projectName, setProjectName] = useState(project?.project_name ?? '')
  const [isActive, setIsActive] = useState(project?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload: ProjectInput = { project_no: projectNo, project_name: projectName, is_active: isActive }
    const { error } = project
      ? await updateProject(project.id, payload)
      : await createProject(payload)
    if (error) setError(error.message)
    else onClose()
    setLoading(false)
  }

  return (
    <dialog class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{project ? 'Edit Project' : 'New Project'}</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div class="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          <div class="form-control mb-3">
            <label class="label" for="project_no">
              <span class="label-text">Project No.</span>
            </label>
            <input
              id="project_no"
              type="text"
              class="input input-bordered"
              value={projectNo}
              onInput={(e) => setProjectNo(e.currentTarget.value)}
              required
            />
          </div>
          <div class="form-control mb-3">
            <label class="label" for="project_name">
              <span class="label-text">Project Name</span>
            </label>
            <input
              id="project_name"
              type="text"
              class="input input-bordered"
              value={projectName}
              onInput={(e) => setProjectName(e.currentTarget.value)}
              required
            />
          </div>
          <div class="form-control mb-4">
            <label class="label cursor-pointer">
              <span class="label-text">Active</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.currentTarget.checked)}
              />
            </label>
          </div>
          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              class={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
```

- [ ] **Step 6: Create src/pages/Projects.tsx**

```tsx
import { useState, useEffect } from 'preact/hooks'
import { fetchProjects, deleteProject } from '../services/projects'
import { ProjectTable } from '../components/projects/ProjectTable'
import { ProjectModal } from '../components/projects/ProjectModal'
import type { Project } from '../types'

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await fetchProjects()
    if (error) setError(error.message)
    else setProjects((data as Project[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleEdit(p: Project) {
    setEditingProject(p)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    const { error } = await deleteProject(id)
    if (error) setError(error.message)
    else load()
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingProject(null)
    load()
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Projects</h1>
        <button class="btn btn-primary btn-circle text-xl" onClick={() => setModalOpen(true)}>
          +
        </button>
      </div>
      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>
      ) : (
        <ProjectTable projects={projects} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {modalOpen && <ProjectModal project={editingProject} onClose={handleModalClose} />}
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/projects/ src/pages/Projects.tsx
git commit -m "feat: add Projects page, ProjectTable, and ProjectModal"
```

---

### Task 11: Timesheet components + Home page (TDD)

**Files:**
- Create: `src/components/timesheets/TimesheetFilters.tsx`
- Create: `src/components/timesheets/TimesheetFilters.test.tsx`
- Create: `src/components/timesheets/TimesheetModal.tsx`
- Create: `src/components/timesheets/TimesheetTable.tsx`
- Create: `src/pages/Home.tsx`

- [ ] **Step 1: Write failing tests for TimesheetFilters**

Create `src/components/timesheets/TimesheetFilters.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import { TimesheetFilters } from './TimesheetFilters'
import type { TimesheetFilters as Filters, Project } from '../../types'

const filters: Filters = {
  date_from: '2026-06-01',
  date_to: '2026-06-30',
  project_id: null,
  status: 'all',
}

const projects: Project[] = [
  { id: 'p1', user_id: 'u1', project_no: 'P001', project_name: 'Alpha', is_active: true, inserted_at: '' },
]

describe('TimesheetFilters', () => {
  it('renders date inputs and filter dropdowns', () => {
    render(<TimesheetFilters filters={filters} projects={projects} onChange={vi.fn()} />)
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument()
    expect(screen.getByText('All projects')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All')).toBeInTheDocument()
  })

  it('renders project options in the project dropdown', () => {
    render(<TimesheetFilters filters={filters} projects={projects} onChange={vi.fn()} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('calls onChange with updated status when status dropdown changes', () => {
    const onChange = vi.fn()
    render(<TimesheetFilters filters={filters} projects={[]} onChange={onChange} />)
    fireEvent.change(screen.getByDisplayValue('All'), { target: { value: 'complete' } })
    expect(onChange).toHaveBeenCalledWith({ ...filters, status: 'complete' })
  })

  it('calls onChange with updated date_from when date input changes', () => {
    const onChange = vi.fn()
    render(<TimesheetFilters filters={filters} projects={[]} onChange={onChange} />)
    fireEvent.input(screen.getByLabelText(/from/i), { target: { value: '2026-05-01' } })
    expect(onChange).toHaveBeenCalledWith({ ...filters, date_from: '2026-05-01' })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/components/timesheets/TimesheetFilters.test.tsx
```

Expected: FAIL with "Cannot find module './TimesheetFilters'"

- [ ] **Step 3: Create src/components/timesheets/TimesheetFilters.tsx**

```tsx
import type { TimesheetFilters, Project } from '../../types'

interface Props {
  filters: TimesheetFilters
  projects: Project[]
  onChange: (filters: TimesheetFilters) => void
}

export function TimesheetFilters({ filters, projects, onChange }: Props) {
  return (
    <div class="flex flex-wrap gap-4 mb-4 items-end">
      <div class="form-control">
        <label class="label" for="date_from">
          <span class="label-text">From</span>
        </label>
        <input
          id="date_from"
          type="date"
          class="input input-bordered input-sm"
          value={filters.date_from ?? ''}
          onInput={(e) => onChange({ ...filters, date_from: e.currentTarget.value || null })}
        />
      </div>
      <div class="form-control">
        <label class="label" for="date_to">
          <span class="label-text">To</span>
        </label>
        <input
          id="date_to"
          type="date"
          class="input input-bordered input-sm"
          value={filters.date_to ?? ''}
          onInput={(e) => onChange({ ...filters, date_to: e.currentTarget.value || null })}
        />
      </div>
      <div class="form-control">
        <label class="label" for="project_filter">
          <span class="label-text">Project</span>
        </label>
        <select
          id="project_filter"
          class="select select-bordered select-sm"
          value={filters.project_id ?? ''}
          onChange={(e) => onChange({ ...filters, project_id: e.currentTarget.value || null })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
          ))}
        </select>
      </div>
      <div class="form-control">
        <label class="label" for="status_filter">
          <span class="label-text">Status</span>
        </label>
        <select
          id="status_filter"
          class="select select-bordered select-sm"
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.currentTarget.value as TimesheetFilters['status'] })
          }
        >
          <option value="all">All</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/components/timesheets/TimesheetFilters.test.tsx
```

Expected: 4 passing tests.

- [ ] **Step 5: Create src/components/timesheets/TimesheetTable.tsx**

```tsx
import type { TimesheetWithProject, Project } from '../../types'

interface Props {
  timesheets: TimesheetWithProject[]
  onEdit: (t: TimesheetWithProject) => void
  onDelete: (id: string) => void
}

export function TimesheetTable({ timesheets, onEdit, onDelete }: Props) {
  if (timesheets.length === 0) {
    return <p class="text-base-content/50 py-8 text-center">No timesheet entries found.</p>
  }

  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Project</th>
            <th>Complete</th>
            <th>AI Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((t) => (
            <tr key={t.id}>
              <td class="whitespace-nowrap">
                {new Date(t.date_memo).toLocaleDateString()}
              </td>
              <td class="max-w-xs">
                <span class="line-clamp-2">{t.description}</span>
              </td>
              <td>{t.projects?.project_name ?? <span class="text-base-content/30">—</span>}</td>
              <td>
                <input type="checkbox" class="checkbox checkbox-sm" checked={t.is_complete} disabled />
              </td>
              <td class="max-w-xs">
                {t.ai_summary ? (
                  <div class="tooltip" data-tip={t.ai_summary}>
                    <span class="line-clamp-1 text-sm text-base-content/60">{t.ai_summary}</span>
                  </div>
                ) : (
                  <span class="text-base-content/30">—</span>
                )}
              </td>
              <td class="flex gap-1">
                <button class="btn btn-ghost btn-xs" onClick={() => onEdit(t)}>
                  Edit
                </button>
                <button class="btn btn-ghost btn-xs text-error" onClick={() => onDelete(t.id)}>
                  Del
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 6: Create src/components/timesheets/TimesheetModal.tsx**

```tsx
import { useState } from 'preact/hooks'
import { createTimesheet, updateTimesheet } from '../../services/timesheets'
import type { Timesheet, TimesheetWithProject, Project, TimesheetInput } from '../../types'

interface Props {
  timesheet: TimesheetWithProject | null
  projects: Project[]
  onClose: () => void
}

export function TimesheetModal({ timesheet, projects, onClose }: Props) {
  const [dateMemo, setDateMemo] = useState(
    timesheet ? timesheet.date_memo.slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [description, setDescription] = useState(timesheet?.description ?? '')
  const [projectId, setProjectId] = useState(timesheet?.project_id ?? '')
  const [isComplete, setIsComplete] = useState(timesheet?.is_complete ?? false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload: TimesheetInput = {
      date_memo: dateMemo,
      description,
      project_id: projectId || null,
      is_complete: isComplete,
    }
    const { error } = timesheet
      ? await updateTimesheet(timesheet.id, payload)
      : await createTimesheet(payload)
    if (error) setError(error.message)
    else onClose()
    setLoading(false)
  }

  return (
    <dialog class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {timesheet ? 'Edit Entry' : 'New Entry'}
        </h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div class="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          <div class="form-control mb-3">
            <label class="label" for="date_memo">
              <span class="label-text">Date</span>
            </label>
            <input
              id="date_memo"
              type="date"
              class="input input-bordered"
              value={dateMemo}
              onInput={(e) => setDateMemo(e.currentTarget.value)}
              required
            />
          </div>
          <div class="form-control mb-3">
            <label class="label" for="description">
              <span class="label-text">Description</span>
            </label>
            <textarea
              id="description"
              class="textarea textarea-bordered"
              value={description}
              onInput={(e) => setDescription(e.currentTarget.value)}
              rows={3}
              required
            />
          </div>
          <div class="form-control mb-3">
            <label class="label" for="project_id">
              <span class="label-text">Project</span>
            </label>
            <select
              id="project_id"
              class="select select-bordered"
              value={projectId}
              onChange={(e) => setProjectId(e.currentTarget.value)}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
          <div class="form-control mb-4">
            <label class="label cursor-pointer">
              <span class="label-text">Complete</span>
              <input
                type="checkbox"
                class="checkbox"
                checked={isComplete}
                onChange={(e) => setIsComplete(e.currentTarget.checked)}
              />
            </label>
          </div>
          {timesheet?.ai_summary && (
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">AI Summary</span>
              </label>
              <textarea
                class="textarea textarea-bordered text-base-content/60"
                value={timesheet.ai_summary}
                rows={2}
                disabled
              />
            </div>
          )}
          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              class={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {timesheet ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
```

- [ ] **Step 7: Create src/pages/Home.tsx**

```tsx
import { useState, useEffect } from 'preact/hooks'
import { fetchTimesheets, deleteTimesheet } from '../services/timesheets'
import { fetchActiveProjects } from '../services/projects'
import { TimesheetTable } from '../components/timesheets/TimesheetTable'
import { TimesheetFilters } from '../components/timesheets/TimesheetFilters'
import { TimesheetModal } from '../components/timesheets/TimesheetModal'
import type { TimesheetWithProject, TimesheetFilters as Filters, Project } from '../types'

function defaultFilters(): Filters {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    date_from: firstDay.toISOString().slice(0, 10),
    date_to: lastDay.toISOString().slice(0, 10),
    project_id: null,
    status: 'all',
  }
}

export function Home() {
  const [timesheets, setTimesheets] = useState<TimesheetWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filters, setFilters] = useState<Filters>(defaultFilters())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTimesheet, setEditingTimesheet] = useState<TimesheetWithProject | null>(null)

  async function loadTimesheets() {
    setLoading(true)
    const { data, error } = await fetchTimesheets(filters)
    if (error) setError(error.message)
    else setTimesheets((data as TimesheetWithProject[]) ?? [])
    setLoading(false)
  }

  async function loadProjects() {
    const { data } = await fetchActiveProjects()
    setProjects((data as Project[]) ?? [])
  }

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { loadTimesheets() }, [filters])

  function handleEdit(t: TimesheetWithProject) {
    setEditingTimesheet(t)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    const { error } = await deleteTimesheet(id)
    if (error) setError(error.message)
    else loadTimesheets()
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingTimesheet(null)
    loadTimesheets()
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Timesheets</h1>
        <button
          class="btn btn-primary btn-circle text-xl"
          onClick={() => setModalOpen(true)}
        >
          +
        </button>
      </div>
      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      <TimesheetFilters filters={filters} projects={projects} onChange={setFilters} />
      {loading ? (
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>
      ) : (
        <TimesheetTable
          timesheets={timesheets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {modalOpen && (
        <TimesheetModal
          timesheet={editingTimesheet}
          projects={projects}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run all tests to verify everything passes**

```bash
npm run test:run
```

Expected: All test files pass. Count should be 5+ test files, 25+ tests total.

- [ ] **Step 9: Commit**

```bash
git add src/components/timesheets/ src/pages/Home.tsx
git commit -m "feat: add Timesheets components and Home page"
```

---

### Task 12: Cleanup + build verification

**Files:**
- Modify: `src/App.tsx` (remove unused import of old App.css reference)

- [ ] **Step 1: Verify App.tsx no longer imports App.css**

App.tsx written in Task 9 does not import App.css. Verify:
```bash
grep "App.css" src/App.tsx
```

Expected: no output (no match).

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
```

Expected: All tests pass. No failures.

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors. Output in `dist/`.

- [ ] **Step 4: Run the Tauri dev app for a smoke test**

```bash
npm run tauri dev
```

Expected: Desktop window opens showing a loading spinner (since Supabase credentials are placeholders, it will briefly show spinner then redirect to Login page). Confirm the Login form renders correctly with email + password fields.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: cleanup and verify full build"
```

---

## Post-Setup: Wire up real Supabase credentials

Once you have the Supabase project URL and anon key:

1. Update `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

2. Run the SQL migrations in Supabase to create tables:
   ```sql
   -- projects
   create table projects (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users not null,
     project_no text not null,
     project_name text not null,
     is_active boolean not null default true,
     inserted_at timestamp with time zone default now()
   );

   alter table projects enable row level security;
   create policy "Users see own projects" on projects
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

   -- timesheets
   create table timesheets (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users not null,
     date_memo timestamp with time zone not null,
     description text not null,
     project_id uuid references projects(id),
     inserted_at timestamp with time zone default now(),
     is_complete boolean not null default false,
     ai_summary text
   );

   alter table timesheets enable row level security;
   create policy "Users see own timesheets" on timesheets
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```

3. Create a user via Supabase dashboard → Authentication → Users → Invite user (email).
