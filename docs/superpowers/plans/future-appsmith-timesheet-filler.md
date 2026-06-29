# Plan: "Send selected timesheets to Appsmith" auto-filler

> Status: **deferred / future** (planned 2026-06-25, not yet implemented).

## Context

The user re-enters timesheet data into a separate **Appsmith** web timesheet app. That app
is tedious: per entry you click several times to add/duplicate a row and pick **hours +
minutes** from pickers. They want to drive it from TimeSh1t instead of hand-typing.

Decisions locked in with the user:
- **Source:** the rows currently **selected** in TimeSh1t's Home table (existing multi-select).
- **Runtime:** open Appsmith **inside a Tauri webview window** and inject a fill script
  (Appsmith is already logged in / session persists, so no auth handling needed).
- **Time:** fixed **09:00 start / 18:00 end** for every entry.
- **Project:** match by **`project_no`**.
- **Selectors:** Appsmith's DOM selectors will be **tuned live** during implementation, so the
  fill script isolates them in one clearly-marked, editable block.

Outcome: select rows → click "Send to Appsmith" → a webview opens on the Appsmith form →
click a floating "Fill N entries" button → entries get filled and added automatically.

## Why this shape (lazy rationale)

- The injection is **Rust-driven** (`WebviewWindowBuilder` + `initialization_script`). Rust is
  privileged, so we need **no new capability permissions** and the remote Appsmith webview gets
  **no** Tauri IPC access (the injected script uses only plain DOM APIs). This is both the
  smallest diff and the safest — remote content stays sandboxed from our commands.
- A **floating "Fill" button** injected into the page (instead of auto-running) means the user
  triggers the fill only when they're on the right screen, and we can re-edit selectors and
  reopen without guessing page-load timing.

## Files to change

### 1. `src-tauri/src/lib.rs` — new command `open_appsmith_filler`
- Signature: `async fn open_appsmith_filler(app: tauri::AppHandle, url: String, rows_json: String) -> Result<(), String>`
- Build an `initialization_script` string that embeds `rows_json` and the fill logic (see §4),
  then:
  ```rust
  tauri::WebviewWindowBuilder::new(&app, "appsmith", tauri::WebviewUrl::External(url.parse().map_err(|e| ...)?))
      .title("Appsmith filler")
      .inner_size(1200.0, 850.0)
      .initialization_script(&script)
      .build()
      .map_err(|e| e.to_string())?;
  ```
- Register in the existing `invoke_handler` macro (line ~172) alongside `greet, ask_claude, claude_status`.
- Reuse one label `"appsmith"`; if a window with that label exists, focus it instead of failing
  (check `app.get_webview_window("appsmith")`).

### 2. `src/pages/Home.tsx` — button + handler
- Add a **"Send to Appsmith"** button in the existing selection banner (line ~206, next to
  "Mark done"). Guard it with the **`isTauri`** check already used in `Archived.tsx` so it only
  shows in the desktop app.
- Handler `handleSendToAppsmith()`:
  ```ts
  const rows = timesheets
    .filter(t => selectedIds.has(t.id))
    .map(t => ({
      date: new Date(t.date_memo).toLocaleDateString(),
      projectNo: t.projects?.project_no ?? '',
      description: t.description,
    }))
  await invoke('open_appsmith_filler', { url: APPSMITH_URL, rowsJson: JSON.stringify(rows) })
  ```
  Reuse the existing `invoke` import and `setError`/`setActionMessage` toast pattern.

### 3. `src/lib/appsmith.ts` (new, tiny) — the URL constant
- `export const APPSMITH_URL = '<paste real Appsmith app URL here>'`
- ponytail: a one-line const, not a settings UI. Promote to a setting only if the URL actually
  changes per user.

### 4. The fill script (built as a string in the Rust command, §1)
Plain DOM JS injected into the Appsmith page. Structure:
- `const ROWS = <rows_json>;` and `const START = '09:00', END = '18:00';`
- A `waitFor(selector, timeoutMs)` poller (Appsmith renders async).
- A **`setNativeValue(el, value)`** helper that uses the native value setter +
  `dispatchEvent(new Event('input', {bubbles:true}))` — Appsmith inputs are React-controlled, so
  assigning `.value` directly will not register. (This is the #1 gotcha.)
- A **`// ===== SELECTORS — tune live =====`** block holding every selector and the
  add/duplicate click sequence ("click N times before add"). This is the only part we iterate on.
- A floating fixed-position button "Fill N entries" appended to `document.body`; on click it runs
  `for (const row of ROWS) { await fillOne(row) }` with small awaits between entries.
- `fillOne(row)`: pick project by `projectNo`, set description, set start/end time pickers to
  09:00/18:00, perform the add/duplicate clicks.

ponytail: no retry/undo/queue framework — a sequential loop with `waitFor` guards. Add resilience
only if a real run shows flakiness.

## Verification (end-to-end, live tuning)

1. `npm run tauri dev`.
2. On Home, select a couple of timesheet rows → click **Send to Appsmith**.
3. The Appsmith webview opens (already logged in). Right-click → Inspect to open devtools.
4. Navigate to the entry form; click the injected **"Fill N entries"** button.
5. Iterate: read failing selectors in devtools, edit the SELECTORS block in `lib.rs`, restart
   `tauri dev`, retry — until project_no, description, and 09:00/18:00 times fill and each entry
   is added correctly.
6. Confirm the count of added Appsmith entries equals the number of selected rows.

No automated test — this is UI automation against a third-party DOM; the manual run above is the
check (matches project convention: no Rust tests exist today).

## Open item before implementation
- Need the real **Appsmith app URL** to drop into `APPSMITH_URL`.

## Out of scope / deferred
- Per-row variable hours (fixed 09:00–18:00 as requested).
- Storing hours in the TimeSh1t schema.
- Web (non-Tauri) support — button hidden outside the desktop app.
- Release ritual (version bump + CHANGELOG) — do after the feature works, per the existing
  v3.x release pattern, if the user wants to ship it.
