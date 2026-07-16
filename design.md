# Design — TimeCheese desktop app

A locked design system for the desktop app (`src/`). Every page redesign reads this
file before emitting code. Do not regenerate per page — extend or amend this file
when the system needs to grow. The marketing site has its own system at
`website/design.md`; the two share brand DNA (cheese-gold duo-tone, warm paper,
Bricolage Grotesque) but this app system is deliberately calmer: it's a work tool.

## Genre

modern-minimal (app surfaces). Brand echoes from the website's carnival system are
allowed only as: accent colour, warm neutrals, 2px rules on key surfaces, display
font on page titles. No marquees, no ornaments, no poster caps, no hard-offset
shadows on in-flow content.

## Macrostructure family

- App pages (Home, Projects, Archived, Holiday, Notes, Ask, Jira, Timeline, Park):
  **Workbench** — one consistent page-header rhythm (below), then the dense work
  surface (table / cards / form). No enrichment ever; function carries the page.
- Auth screens (Login, PendingApproval): **single-card focus** — one card, centered,
  brand wordmark treatment, nothing else on the canvas.
- Shell (Layout + Sidebar): persistent left rail, N3 side-rail archetype. The rail
  is the brand's loudest surface in the app (wordmark in display font, gold active
  indicator); pages stay quieter than the rail.

## Theme

Two custom DaisyUI v5 themes in `src/index.css`, derived from the website brand hexes
(`#f5b82e` gold · `#c98a12` deep amber · `#14100b`/`#faf6ec` papers). `timecheese`
is the default, `timecheese-dark` is `--prefersdark`. The 9 stock themes stay
selectable in the switcher but receive no bespoke polish.

```css
@plugin "daisyui" {
  themes: timecheese --default, timecheese-dark --prefersdark, light, dark, retro, nord, abyss, aqua, lofi, acid, dracula;
}

@plugin "daisyui/theme" {
  name: "timecheese";
  color-scheme: light;
  --color-base-100: oklch(98% 0.012 95);   /* warm paper, from #fffdf7 */
  --color-base-200: oklch(96.5% 0.016 92); /* from #faf6ec */
  --color-base-300: oklch(90% 0.03 90);    /* from #e6dcc3 */
  --color-base-content: oklch(26% 0.028 75); /* warm ink, from #2b2214 */
  --color-primary: oklch(70% 0.145 78);      /* deep-amber-leaning gold — must pass 4.5:1 with primary-content */
  --color-primary-content: oklch(17% 0.02 75);
  --color-secondary: oklch(55% 0.11 75);     /* deep amber, from #8f6209 */
  --color-secondary-content: oklch(98% 0.012 95);
  --color-accent: oklch(82% 0.16 84);        /* cheese gold, from #f5b82e */
  --color-accent-content: oklch(17% 0.02 75);
  --color-neutral: oklch(30% 0.03 75);
  --color-neutral-content: oklch(96.5% 0.016 92);
  --color-info: oklch(54% 0.11 240);       /* darkened from 62% for 4.5:1 on white content */
  --color-info-content: oklch(98% 0.01 240);
  --color-success: oklch(53% 0.12 150);    /* darkened from 58% for 4.5:1 on white content */
  --color-success-content: oklch(98% 0.01 150);
  --color-warning: oklch(75% 0.15 80);
  --color-warning-content: oklch(20% 0.03 80);
  --color-error: oklch(55% 0.19 28);
  --color-error-content: oklch(98% 0.01 28);
  --radius-selector: 0.5rem;
  --radius-field: 0.375rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 2px;      /* brand 2px rule voice */
  --depth: 0;         /* no fake depth — flat, rule-driven */
  --noise: 0;
}

@plugin "daisyui/theme" {
  name: "timecheese-dark";
  color-scheme: dark;
  --color-base-100: oklch(17% 0.015 75);   /* warm dark paper, from #14100b */
  --color-base-200: oklch(21% 0.018 75);   /* from #1e1812 */
  --color-base-300: oklch(29% 0.025 75);   /* from #332a1d */
  --color-base-content: oklch(93% 0.02 90); /* from #f2eadb */
  --color-primary: oklch(82% 0.16 84);       /* cheese gold pops on dark */
  --color-primary-content: oklch(17% 0.02 75);
  --color-secondary: oklch(68% 0.14 75);     /* deep amber, from #c98a12 */
  --color-secondary-content: oklch(17% 0.02 75);
  --color-accent: oklch(82% 0.16 84);
  --color-accent-content: oklch(17% 0.02 75);
  --color-neutral: oklch(29% 0.025 75);
  --color-neutral-content: oklch(93% 0.02 90);
  --color-info: oklch(72% 0.11 240);
  --color-info-content: oklch(15% 0.02 240);
  --color-success: oklch(72% 0.13 150);
  --color-success-content: oklch(15% 0.02 150);
  --color-warning: oklch(80% 0.15 80);
  --color-warning-content: oklch(18% 0.03 80);
  --color-error: oklch(65% 0.18 28);
  --color-error-content: oklch(15% 0.02 28);
  --radius-selector: 0.5rem;
  --radius-field: 0.375rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 2px;
  --depth: 0;
  --noise: 0;
}
```

Contrast is a hard gate: `primary`/`primary-content`, `base-100`/`base-content`, and
every status pair must pass 4.5:1. If an OKLCH value above fails when rendered,
adjust lightness, keep hue, and record the change here.

## Typography

- Display: **Bricolage Grotesque Variable** (`@fontsource-variable/bricolage-grotesque`,
  new dependency) — weights 600–800, roman only, sentence case (NOT the website's
  poster caps). Used for: sidebar wordmark, page titles, modal titles, auth card title.
- Body: existing system sans stack (Tailwind default). Untouched.
- Mono: system mono (Tailwind `font-mono`) — dates, times, durations, counts,
  project numbers. Timestamps in tables are always mono.
- Utility contract: `src/index.css` defines `@theme { --font-display: 'Bricolage Grotesque Variable', ui-sans-serif, sans-serif; }`
  → pages use Tailwind's `font-display` class. Never inline `font-family`.
- Page titles: `font-display font-bold text-2xl` (one size, every page — the rhythm
  is the brand). No italic anywhere, ever.

## Page-header rhythm (every app page, mandatory, identical)

```
<header class="flex items-end justify-between gap-4 mb-6">
  <div>
    <h1 class="font-display font-bold text-2xl">Page title</h1>
    <p class="text-sm opacity-60 font-mono">contextual meta — counts, month, filters state</p>
  </div>
  <div>…primary action button(s)…</div>
</header>
```

Title + mono meta line left, actions right, `mb-6` to the work surface. This replaces
each page's current ad-hoc heading.

## Spacing

Tailwind's default 4-pt scale via utility classes. Page gutter: `p-6`. Vertical rhythm
between work-surface blocks: `gap-4` / `mb-4`. Cards use `card-body` defaults. No raw
pixel values in `style=` attributes.

## Component voice

- **Cards / tables / modals**: 2px `border-base-300` rule, `--radius-box`, flat
  (no shadow classes except DaisyUI dropdown/modal defaults).
- **Tables**: `table` with mono timestamps, row hover `hover:bg-base-200`,
  header row uppercase `text-xs tracking-wide opacity-60`.
- **Primary CTA**: `btn btn-primary` — one per page maximum, always in the page
  header or modal footer. Secondary actions: `btn btn-ghost` or `btn-outline`.
- **Status**: DaisyUI `badge` for is_complete/is_active states — `badge-success` /
  `badge-ghost`, never raw colored text.
- **Empty states**: centered in the work surface — one mono line + one ghost action.
  No illustrations.
- **Sidebar rail**: active route gets a 2px gold left rule + `text-primary`;
  inactive links `opacity-70 hover:opacity-100`. Wordmark "TimeCheese" in
  `font-display font-extrabold`.

## Motion

- CSS-only. No motion library. Animate `transform` and `opacity` only.
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, durations ≤ 220ms.
- Modal/dropdown transitions: DaisyUI defaults, untouched.
- `prefers-reduced-motion: reduce` → opacity-only ≤ 150ms (declare once in index.css).
- No scroll reveals, no staggered entrances — this is a desktop tool.

## Microinteractions stance

- Silent success (existing pattern: state updates in place). Never celebratory toasts.
- Loading: DaisyUI `loading loading-spinner loading-xs` inside the triggering button
  (existing pattern — keep).
- Errors: `alert alert-error` banner at the top of the work surface (existing
  pattern — keep).
- `:focus-visible` ring must remain visible on every interactive element; never
  remove outlines.

## What pages MUST share

- The theme tokens (never inline colors; DaisyUI semantic classes only).
- The page-header rhythm above.
- `font-display` scoped to titles/wordmark only; mono for machine-ish values.
- CTA voice (one `btn-primary` per page).
- 2px rule voice on cards/tables/modals.

## What pages MAY differ on

- Work-surface composition (table vs card grid vs split panes vs chat log) —
  whatever the page's function already is. Do not change what a page *does*.
- Density (Home is dense; Notes/Ask are airy).

## Variants

- **Park ticket card (user-requested, 2026-07-16)**: the Park page's selected-vehicle
  display may render as a compact non-interactive "parking ticket" card wrapped in
  DaisyUI v5.6 `hover-3d` (the one sanctioned exception to the flat/no-depth rule —
  transform-only hover, and the global reduced-motion rule collapses it). The
  `hover-3d` wrapper must contain NO interactive elements (its hover zones block
  clicks); form controls (card-no input, Send button) live outside it. No other
  page adopts hover-3d without amending this entry.

## Hard constraints (implementation safety)

- Visual/interaction layer ONLY. No changes to services, stores, routing, data flow,
  props, or test-visible behavior beyond class names and markup structure.
- No file deletions. No new components unless a page duplicates 3+ times.
- Preact: `class=`, `for=`, `onInput`. DaisyUI v5: no `*-bordered`, use
  `fieldset`/`label`, spinner spans in buttons.
- Existing tests must keep passing (`npm run test:run`); if a test asserts markup
  you changed, update the test to the new markup, never weaken the assertion.
