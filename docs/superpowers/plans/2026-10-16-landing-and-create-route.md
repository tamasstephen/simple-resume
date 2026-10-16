# Landing Page + `/create/` Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve a static marketing landing page at `https://cvpeers.com/` and move the existing editor app, unchanged, to `https://cvpeers.com/create/`.

**Architecture:** Vite multi-page build with two HTML entries. `index.html` becomes the landing page: static HTML plus one stylesheet and one small TS module for the walkthrough animation, with no React. The current app shell moves to `create/index.html` and keeps `src/main.tsx` as its entry. Both pages are real files in `dist/`, so `/create/` works on any static host without SPA rewrites. localStorage is per-origin, so saved resumes survive the move.

**Tech Stack:** Vite 8.3 (multi-page `build.rolldownOptions.input`; `rollupOptions` is the deprecated alias, so check the installed docs if the build warns), TypeScript strict, plain CSS, Vitest + jsdom, `@fontsource/inter` (add 700), `@fontsource/ibm-plex-mono` (new).

**Spec:** the Paper file "Personal website", page "Resume Builder Landing", artboards "Landing — Desktop" (1440) and "Landing — Mobile" (390), plus the "Signature" section on page "Personal Design System". Read exact values with Paper's `get_jsx` / `get_computed_styles` (by layer name). Never read values off screenshots.

## Global Constraints

- The editor app's behaviour and styling must not change in this plan. Its restyle is Wave 2, planned separately.
- No React on the landing page. It is static HTML plus `src/landing/landing.css` plus `src/landing/walkthrough.ts`.
- Fonts are self-hosted via `@fontsource` only, with zero external font requests (design-ledger rule). "Paper Mono" is a Paper-only font; substitute **IBM Plex Mono 400/500** everywhere the design uses Paper Mono.
- New tokens live in `src/styles/tokens.css` and use the Paper token names verbatim (`--color-*`, `--text-*`, `--spacing-*`, `--radius-*`). They must not collide with the app's existing `--ink`, `--paper` and similar tokens in `src/index.css`.
- Colour values (verbatim): `--color-background #FFFFFF`, `--color-surface #F7F7F7`, `--color-text #000000`, `--color-text-secondary #666666`, `--color-text-continuation #8A8A8A` (headings ≥ 24px only), `--color-border #EAEAEA`, `--color-border-strong #D4D4D4`, `--color-primary #0070F3`, `--color-primary-surface #EEF5FF`, `--color-success #00A86B`, `--color-danger-text #CD2B31`.
- Radius: `--radius-control 6px`, `--radius-md 8px`.
- Cobalt (`--color-primary`) appears in exactly two places: the live page-count chip and the active progress segment.
- Every link to the editor uses `href="/create/"` with the trailing slash.
- No "Source" links. Whether the repo is public is unconfirmed, so leave them out until the user says otherwise.
- Copy is taken verbatim from the Paper artboards. Do not rewrite it.
- `prefers-reduced-motion: reduce` means no animation at all; the walkthrough rests on step 02.

## Review Focus

1. **Bookmarked root URL:** a returning user who bookmarked `https://cvpeers.com/` lands on the marketing page with their data intact. The hero CTA must reach `/create/`, where the saved resume loads. The app code is untouched, so the storage key can't change; Task 1 Step 5 confirms existing data loads at `/create/`.
2. **`/create` without a trailing slash:** must not 404 on the dev server or in `vite preview`. Task 1 verifies both manually.
3. **Reduced motion:** the walkthrough must not start a timer. Covered by a Task 3 test.
4. **Mobile width (390px):** no horizontal scroll, and the hero sheets and demo card must not overflow the frame. Task 2 verifies with Chrome DevTools at 390×844.
5. **Print from the landing page:** printing `/` must not trigger the app's print stylesheet. This is guaranteed by the separate entry; Task 2 checks the landing imports nothing from `src/features/`.

---

### Task 1: Move the app to `/create/` and register both entries

**Files:**
- Create: `create/index.html` (the current `index.html` contents, adjusted)
- Modify: `vite.config.ts`, `public/sitemap.xml`, `public/robots.txt` (comment line only), `src/indexHtml.test.ts`, `src/siteFiles.test.ts`
- Test: `src/createHtml.test.ts`

**Interfaces:**
- Produces: the build emits `dist/index.html` (landing) and `dist/create/index.html` (app). Task 2 overwrites the root `index.html`.

- [ ] **Step 1: Write the failing tests.** `src/createHtml.test.ts` imports `../create/index.html?raw` and asserts:
  - `<title>Simple Resume — Editor</title>`
  - `<link rel="canonical" href="https://cvpeers.com/create/" />`
  - `<script type="module" src="/src/main.tsx">`
  - `<div id="root">`

  In `siteFiles.test.ts`, the sitemap test expects `["https://cvpeers.com/", "https://cvpeers.com/create/"]`, and the canonical test keeps asserting that root `index.html` is `https://cvpeers.com/`.
- [ ] **Step 2: Run `npm run test -- createHtml siteFiles`.** Expected: FAIL (file missing, sitemap has one URL).
- [ ] **Step 3: Implement.**
  - `create/index.html` is a copy of the current `index.html` with the title above, canonical and `og:url` set to `https://cvpeers.com/create/`, and the JSON-LD block removed (it moves to the landing page).
  - `vite.config.ts` gets `build.rolldownOptions.input = { main: resolve(__dirname, "index.html"), create: resolve(__dirname, "create/index.html") }` (`node:path`).
  - The sitemap adds a second `<url>` with `<loc>https://cvpeers.com/create/</loc>` and `<lastmod>2026-10-16</lastmod>`.
  - The robots.txt comment becomes `# Simple Resume — landing page + editor.`
- [ ] **Step 4: Run `npm run test && npm run build`.** Expected: all PASS, and `dist/create/index.html` exists.
- [ ] **Step 5: Manual check.** Run `npm run dev`, then `npm run build && npm run preview`. Open `/create/` and `/create`. The editor loads with existing localStorage data in both cases.
- [ ] **Step 6: Commit.** `git commit -m "Move the editor to /create/ so the root can host the landing page"`

### Task 2: Landing page markup, tokens and signature CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/landing/landing.css`, `src/landing/main.ts`
- Modify: `index.html` (replace body and head styling; keep all SEO meta and JSON-LD), `package.json` (add `@fontsource/ibm-plex-mono`)
- Test: `src/landingHtml.test.ts`

**Interfaces:**
- Produces:
  - `index.html` contains `<ol class="steps" data-walkthrough>` with three `<li class="step">` children.
  - The step 02 `<li>` carries the `step--active` class.
  - `#page-count` holds the hero chip text.
  - Task 3 binds to these.

- [ ] **Step 1: Write the failing tests** in `src/landingHtml.test.ts` (`../index.html?raw`, parsed with `DOMParser`):
  - Every `a[href*="create"]` has `href="/create/"`, and there are at least 3 of them: the nav, the hero and the closing CTA.
  - `h1` text is `The preview is the PDF.`
  - There is exactly one `h1`.
  - Sections carry ids `how-it-works` and `privacy`.
  - `[data-walkthrough] > li` count is 3.
  - The document has no `<script>` other than the JSON-LD and `/src/landing/main.ts`.
  - The existing `indexHtml.test.ts` must still pass unchanged (title, description, OG, JSON-LD).
- [ ] **Step 2: Run `npm run test -- landingHtml`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Head:** `index.html` keeps every `<meta>`, canonical and JSON-LD from the current file. Change `theme-color` to `#ffffff`. Change the `<script>` to `/src/landing/main.ts`.
  - **`main.ts`:** imports the fonts (`@fontsource/inter/{400,500,600,700}.css`, `@fontsource/ibm-plex-mono/{400,500}.css`), then `../styles/tokens.css`, then `./landing.css`.
  - **Body:** build the sections in Paper order, using semantic elements: `header > nav`, `main > section`, `footer`. The A4 sheets are decorative, so mark them `aria-hidden="true"`; the demo card is decorative too.
  - **Sheet frame:** `body > .sheet` has `max-width: 1440px`, `margin-inline: auto`, `padding-inline: 56px`, and two full-height `1px var(--color-border)` lines drawn with `.sheet::before` and `.sheet::after` at `left: 56px` and `right: 56px`. Sections have `padding-inline: 32px` and `border-bottom: 1px solid var(--color-border)`.
  - **Crop marks:** each section draws a 17px ink cross centred on each end of its bottom border, using `background` gradients on one absolutely positioned pseudo-element per side.
  - **Two-tone headings:** an `<h2>` containing two `<span class="tone">` lines, the second in `--color-text-continuation`, display block.
  - **Below `768px`:** apply the "Landing — Mobile" artboard values. Frame inset 12px, section padding 16px, CTAs full width, steps stacked, hero headline 52px/52px, section headings 34px/38px, closing heading 48px/48px.
- [ ] **Step 4: Run `npm run test`.** Expected: PASS.
- [ ] **Step 5: Visual check** with Chrome DevTools MCP at 1440×900 and 390×844 against both artboards:
  - no horizontal scroll at 390
  - crop marks sit on every divider
  - the landing imports nothing from `src/features/` (`grep -r "features" src/landing` returns nothing)
- [ ] **Step 6: Commit.** `git commit -m "Add the landing page so first-time visitors see what the editor does before using it"`

### Task 3: Walkthrough animation

**Files:**
- Create: `src/landing/walkthrough.ts`
- Modify: `src/landing/main.ts` (calls `startWalkthrough`)
- Test: `src/landing/walkthrough.test.ts`

**Interfaces:**
- Consumes: `[data-walkthrough] > li` and `#page-count` from Task 2.
- Produces:
  - `export type StepIndex = 0 | 1 | 2`
  - `export function nextStep(current: StepIndex): StepIndex`
  - `export function startWalkthrough({ root, intervalMs, prefersReducedMotion }: { root: HTMLElement; intervalMs: number; prefersReducedMotion: boolean }): () => void` (returns a stop function)

- [ ] **Step 1: Write the failing tests:**
  - `nextStep(0) === 1`, `nextStep(1) === 2`, `nextStep(2) === 0`
  - With `vi.useFakeTimers()` and `intervalMs: 4000`, the second step starts active. After `advanceTimersByTime(4000)` only the third `li` has `step--active`, and `#page-count` text is `A4 · 2 PAGES`.
  - After 4000 more, the first is active and `#page-count` is `A4 · 1 PAGE`.
  - `prefersReducedMotion: true` means step 02 is active, `vi.getTimerCount() === 0`, and nothing changes after `advanceTimersByTime(20000)`.
  - The returned stop function clears the timer (`getTimerCount() === 0`).
- [ ] **Step 2: Run `npm run test -- walkthrough`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `#page-count` reads `A4 · 1 PAGE` on step 0 and `A4 · 2 PAGES` on steps 1–2.
  - The progress segment is a CSS `::before` on `.step--active` that animates `transform: scaleX(0 → 1)` over `var(--walkthrough-ms, 4000ms)` linear. The CSS sets no animation under `prefers-reduced-motion`.
  - `main.ts` passes `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.
- [ ] **Step 4: Run `npm run test && npm run lint && npm run build`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Animate the how-it-works steps so the page-break promise is shown, not told"`
