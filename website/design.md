# Design — TimeCheese website

A locked design system for this site. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre

editorial-loud (Carnival-decorated poster language on the TimeCheese brand palette)

## Provenance

Structure + decoration DNA studied from `https://www.usehallmark.com/examples/carnival-01/`
(Hallmark's own public gallery — Carnival theme, Cold Snap drop) on 2026-07-16, as a
public reference for the user's own product site. Colour tokens are NOT from the source:
the TimeCheese brand palette below is retained. The DNA adopted is structural/decorative
only — macrostructure, ornament language, shadow voice, rule weight, marquee.
Rhythm was not extractable (URL mode); density decisions are Hallmark's own.

## Macrostructure family

- Marketing pages (`src/pages/index.astro`): **Marquee Hero** (Carnival-decorated) —
  poster-caps display hero + scrolling marquee banner, then alternating proof bands,
  spec-sheet table with 2px rules, ornament dividers between sections.
- Content pages (`src/pages/docs/*`, `changelog.astro`): **Long Document** — quiet
  prose; decoration limited to the shared chrome (nav/footer rules). Leave alone.

## Theme

Existing brand tokens, canonical in `src/styles/global.css` `@theme`
(dark default + `html[data-theme='light']` override). Hex values retained —
do not convert or add colours.

- `--color-bg` `#14100b` / light `#faf6ec` — warm dark paper
- `--color-surface` `#1e1812` / `#fffdf7`
- `--color-border` `#332a1d` / `#e6dcc3`
- `--color-text` `#f2eadb` / `#2b2214`
- `--color-muted` `#a3947c` / `#8a7a5e`
- `--color-accent` `#f5b82e` / `#b07d10` — cheese gold (duo-tone voice A)
- `--color-accent-deep` `#c98a12` / `#8f6209` — deep amber (duo-tone voice B)
- `--color-on-accent` `#14100b`

**Duo-tone rule (from the DNA):** gold and deep amber are *competing* accents —
a block fills with one or the other, never both blended in the same element.

## Typography

- Display: Bricolage Grotesque Variable, **800, ALL CAPS poster treatment** on
  marketing headings — `letter-spacing: -0.01em`, `line-height: 1.02` (never
  below 1.0 on all-caps). Roman only, no italic anywhere.
- Body: system sans stack, 400 (`--font-sans`). Sentence case, short paragraphs.
- Mono: system mono stack — labels, timestamps, marquee meta (`--font-mono`).
- Headlines ≤ 6 words. Docs prose keeps its existing quiet treatment.

## Decoration language (the studied DNA)

1. **Hard-offset shadows** — cards/CTAs get `box-shadow: 4px 4px 0 <ink-ish>`
   (`--color-border` for quiet cards, `--color-accent-deep` for standouts).
   Never soft blur shadows.
2. **2px rules** — section separators and card borders are `2px solid
   var(--color-border)`. No hairlines on marketing pages.
3. **Typographic ornaments** — `✱` divider rows (centred, accent), `❋` list
   bullets, `◆` heading prefix (inline, same line as the heading, accent
   colour). These are typographic glyphs, not emoji.
4. **Marquee banner** — one horizontal auto-scroll strip (hero only), content
   repeated ≥2× (`aria-hidden` sibling), freezes under
   `prefers-reduced-motion: reduce`. Honest copy only — real feature claims.
5. **Bleed blocks** — accent-filled strips may run full-bleed past the content
   column so they read as posters, not buttons.
6. No halftone/photo placeholders needed — the Tier-A day-timeline graphic and
   proof panels are the imagery.

## Spacing

Tailwind default 4-pt utility scale. Varied section rhythm; ornament dividers
carry some transitions instead of borders.

## Motion

- `timeline-grow` on the hero graphic (existing) + one `marquee` keyframe
  (translateX loop, ~32s linear). Both reduced-motion safe.
- Everything else: `transition-colors`; `:active` 1px press (existing).

## Microinteractions stance

- Silent success; no toasts.
- Focus ring: instant, `2px solid var(--color-accent)`, offset 2px.

## CTA voice

- Primary: filled `--color-accent`, `border-2` ink-side border + hard-offset
  shadow, `px-5 py-3 text-sm font-bold uppercase text-[--color-on-accent]`.
- Secondary: `border-2 border-[--color-border]`, same geometry, hover → accent.
- Labels never wrap; every CTA fills or outlines with a duo-tone accent — no
  neutral CTAs on marketing pages.

## Icons

None. Typographic ornaments (✱ ❋ ◆) only. Emoji banned except the 🧀 wordmark.

## Nav / footer archetypes

- Nav: **N1b** three-section (existing) — decorated: `border-b-2` rule.
- Footer: **Ft2** inline single line — decorated: `border-t-2` rule.

## What pages MUST share

Wordmark, duo-tone accent discipline, fonts, CTA voice, the token set above.

## Exports

Canonical format is the Tailwind v4 `@theme` block in `src/styles/global.css`.
DTCG / shadcn exports intentionally omitted (Astro-only project).
