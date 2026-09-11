# Project Handover
Generated: 2026-09-11 | Branch: stephent/work | By: opencode session

## 1. Start Here (zero-knowledge onboarding)

A local-first resume builder ("cvpeers v2"): the user fills form-based
sections (9 total), and the app renders a live, automatically paginated A4
preview (Paged.js) that is exported as a print-ready PDF via the browser's
native print pipeline. No backend, no accounts; data persists to
localStorage behind a swappable persistence interface.

Stack: React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) + Vite +
plain CSS (no CSS framework) + Zod + TipTap + Paged.js + Vitest/RTL.
Fonts are self-hosted via `@fontsource` (Inter 400/500/600 +
IBM Plex Serif 300).

Read first, in order: `docs/PRD.md` → `docs/STORIES.md` →
`docs/design-ledger.md` (the ledger's Corrections section outranks
everything else in it — read it before ANY UI work).

## 2. PRD Goal

Source: `docs/PRD.md` (88 lines). Goal in the PRD's own words: the previous
builder (Angular + jsPDF) "required manually calculating where pages should
break… every layout change forced the break math to be redone" — v2 must let
a user "enter their information once and reliably get a clean, professionally
paginated PDF, without the tool (or the user) ever fighting page breaks."

Milestones (`docs/STORIES.md:143`): M1 data-in (S1–S6) ✅ · M2 see-it
(S7–S9) ✅ · M3 ship-it (S12 ✅, S13 open) · M4 choice+polish (S10, S11,
S14 open).

Non-goals (PRD §Non-Goals): no accounts/auth/backend, no drag-drop
reordering, no user-defined custom sections, A4 only, no cover letters, no
AI generation, no live keystroke preview (preview updates on Save only), not
a PDF importer.

## 3. Current State

**Done** (all TDD-plan driven; plans in `docs/superpowers/plans/`):
- M1 foundation + editor (S1–S6): schema/persistence/reducer/context
  (`src/lib/`, `src/features/resume/`), generic repeatable section shell
  (`src/features/editor/SectionEditor.tsx`), all 9 section forms
  (`src/features/editor/sections/`), TipTap rich text
  (`src/features/editor/RichTextField.tsx`) with DOMPurify sanitization
  (`src/lib/sanitizeHtml.ts`).
- M2 render + preview (S7–S9): ATS template + serializer
  (`src/features/render/AtsTemplate.tsx`, `renderResumeHtml.ts`,
  `pageStyles.ts`), Paged.js preview pane (`src/features/preview/Preview.tsx`).
- S12 Export PDF (native print) ✅: `src/features/render/printStyles.ts`,
  Export PDF button in `src/AppHeader.tsx`, print QA verified with a
  puppeteer print-to-PDF harness (commit `faf8501`); marked shipped at
  `docs/STORIES.md:108`.
- App-shell design system, three iterations (all recorded in
  `docs/design-ledger.md` with append-only user corrections):
  1. Paper-and-ink editorial restyle (commit `90e64e7`).
  2. andmade.jp alignment pass 2 (2026-09-11): 12px micro type, 22px
     titles, whitespace-separated item rows (8px gaps, no row hairlines),
     150ms `cubic-bezier(0.4,0,0.2,1)` easings, verbatim 0.7s
     wipe-through underline sweep on `.btn--text` + reduced-motion gate.
  3. Same-day user corrections: 01–09 section indices REMOVED; Courier
     Prime removed entirely (package uninstalled); section titles are now
     IBM Plex Serif 300 (`--font-serif`); all other text is Inter;
     Contact/Summary titles get a 16px gap via `.section > .section__title`
     (`src/index.css`) because they lack the `.section__head` wrapper.

**In progress**: nothing partial — all user-directed design work is
implemented and computed-style verified. **It is all UNCOMMITTED** (see Git
state).

**Not started**: S13 (JSON export/import), SP-2 spike (two-column
pagination strategy, blocks S10), S10 (T2 designed template), S11 (template
switcher), S14 (edge-case pass). No plan docs exist for these yet.

**Git state**: branch `stephent/work`, HEAD `5522996` (20+ commits).
Modified, uncommitted: `src/index.css`, `src/main.tsx`, `package.json`,
`package-lock.json`, `docs/design-ledger.md`; `docs/handover.md` untracked.
**No git remote is configured — every commit exists only on this machine.**

**Test/build status**: 24 files / 84 tests passing; `eslint` clean;
`tsc -b` clean; `npm run build` succeeds in ~225ms with one pre-existing
>500 kB chunk warning (pagedjs). All verified by run, 2026-09-11.

## 4. Next Steps

1. **Commit the pending design-pass work** (the 5 modified files + this
   handover doc). Acceptance: `git status` clean, suite still green.
2. **S13 — JSON export/import** (PRD FR13). Acceptance: Export JSON emits
   full resume + template + `schemaVersion`; import validates with Zod
   (`src/lib/schema/resume.ts`) and rejects malformed/incompatible files
   with an error, leaving existing data untouched (no partial overwrite).
   Follow repo convention: write the TDD plan doc in
   `docs/superpowers/plans/` first.
3. **SP-2 spike** — decide two-column pagination strategy (columns reset per
   page vs independent flows) with a working Paged.js demo; record the
   decision. Acceptance: decision documented + demo paginates.
4. **S10 — T2 two-column template**. Acceptance: same data renders in T2
   and paginates automatically (PRD AC), styled per `docs/design-ledger.md`
   open decision.
5. **S11 — template switcher**. Acceptance: switching T1/T2 re-renders the
   same data without loss; selection persists across reload.
6. **S14 — edge-case pass**. Acceptance: every row of the PRD "Edge Cases &
   Error Handling" table behaves as specified.

**First task to pick up**: commit the uncommitted design-pass changes
(item 1), then start the S13 plan doc
`docs/superpowers/plans/<date>-resume-builder-json-portability.md`
(mirror the structure of
`docs/superpowers/plans/2026-09-11-resume-builder-export-pdf.md`).

## 5. Key Files & Architecture

```
src/
  lib/            schema/resume.ts (Zod, SCHEMA_VERSION=1) · sanitizeHtml.ts (DOMPurify)
                   persistence/ (PersistenceProvider iface, LocalStorage, InMemory)
                   store/ (resumeReducer, repeatableSections)
  features/
    resume/       ResumeProvider.tsx (split state/dispatch contexts) · useResume.ts
    editor/       SectionEditor.tsx (repeatable shell w/ .section__head)
                  sections/ (9 forms; ContactForm/SummaryForm render bare
                  .section__title — no head wrapper, hence the direct-child
                  margin rule) · RichTextField.tsx (TipTap) · useSectionDraft.ts
    render/       AtsTemplate.tsx · renderResumeHtml.ts · pageStyles.ts (PRINT
                  artifact — never restyle with app tokens) · printStyles.ts
    preview/      Preview.tsx (Paged.js Previewer, per-run target div)
  index.css       app-chrome tokens: Inter (--font-sans) everywhere except
                  section titles = IBM Plex Serif 300 (--font-serif);
                  --ease-out; underline-sweep keyframes + reduced-motion gate
  main.tsx        @fontsource/inter 400/500/600 + @fontsource/ibm-plex-serif/300
  AppHeader.tsx   black band: wordmark (14px/1.5), meta, Export PDF
  App.tsx         provider → print <style> → header → editor pane | preview pane
```

Data flow (5 steps): form fields → local draft (`useSectionDraft`) →
dispatch SAVE/DELETE on Save click → `resumeReducer` commits + auto-saves
via `PersistenceProvider` → committed state re-renders the Paged.js preview
(never on keystroke) → Export PDF calls `window.print()` over the paginated
DOM (`printStyles.ts` strips app chrome).

## 6. Decisions & Rationale

| Decision | Rationale | Rejected alternative |
|---|---|---|
| Preview = live Paged.js DOM; export = native print (SP-1, Option A) | The DOM the browser prints IS the preview — zero drift | pdf.js rendering of a generated PDF |
| `printStyles.ts` declares `@page { size: A4; margin: 0 }` | Paged.js page boxes are full-bleed A4 with resume margins baked inside | Relying on browser-default print margins |
| Print CSS must not duplicate Paged.js's injected print rules | Duplication caused blank-page/footer bugs | Copying all print rules into our stylesheet |
| Save-based editing: typing never mutates committed state | PRD core model (FR3/FR4) | Live keystroke preview |
| Render-time `sanitizeHtml` on rich text (defense-in-depth) | The future import path (`REPLACE_ALL`) bypasses save-time sanitization | Trusting committed HTML |
| Scoped element resets `:is(.app-header, .editor-pane)` | Global resets would alter the Paged.js print artifact | Global `h2, p, ul { margin: 0 }` |
| Per-run pagination target div in `Preview.tsx` | StrictMode double-mounts; shared container let superseded runs stack pages | Clearing `innerHTML` without ownership |
| `pageStyles.ts` kept outside the app design system | The resume document is a print artifact (Arial/pt), not app chrome | Applying app fonts to the resume |
| Strict monochrome; site's #0022ff accent declined | User decision 2026-09-11 ("clean" was the goal) | Single blue accent on primary actions |
| Item rows whitespace-separated (8px), section dividers kept | User decision — andmade.jp uses zero rules in lists; sections still need delineation | Hairline row dividers |
| 0.7s wipe-through underline sweep, keyframes verbatim from andmade.jp | User decision — the reference's signature interaction | Subtle 150ms background-size grow |
| Titles = IBM Plex Serif 300; all other text Inter | User-directed same-day correction (Courier-as-label rejected, Courier-as-title tried and replaced) | Courier Prime anywhere (uninstalled); site's Akzidenz-Grotesk |
| Section indices 01–09 removed | User correction 2026-09-11 | CSS-counter numbering |
| `prefers-reduced-motion` gate on the sweep | a11y; the reference lacks it | Ungated 0.7s animation |

## 7. Gotchas & Pitfalls

- **`docs/design-ledger.md` is read-first for UI work**; its Corrections
  section is append-only and outranks reference-site evidence and prior
  decisions (two same-day reversals are recorded there — check it before
  "improving" typography).
- **Paged.js injects its own `@page` and `@media print` styles** into
  `<head>` — when querying "our" print styles, select the React-mounted
  `#root style` element; a generic find on `@media print` grabs theirs.
- **`:hover`/`:focus-visible` cannot be triggered from JS** — assert the
  rules exist in `document.styleSheets` instead. Related: Chrome serializes
  `animation: none` as `animation: auto ease 0s 1 normal none running
  none` — match on `animation-name`/rule presence, not literal cssText.
- **`document.fonts.check()` returns true for unloaded families** via
  system-fallback resolution (observed with Courier after uninstall) —
  use `[...document.fonts].map((f) => f.family)` for ground truth.
- **jsdom cannot emulate print media** — the proven pattern is a puppeteer
  harness (`page.pdf({ preferCSSPageSize: true })` + `pdftotext -bbox`);
  keep-page parity with the DOM preview is the acceptance signal.
- **Chrome emits a trailing blank sheet** if a forced `break-after: page`
  lands on the last element — suppressed via `.pagedjs_page:last-child`
  in `src/features/render/printStyles.ts`.
- **Preview pane padding must be zeroed in print** — a 24px offset pushes
  page boxes past the sheet bottom (fixed in `faf8501`).
- **`npm run format` has pre-existing drift in ~15 untouched files** — run
  `npx prettier --check <changed files>` instead of blanket formatting.
- **StrictMode double-invokes effects in dev** — any async effect needs
  per-run resources + cleanup (see `Preview.tsx`).
- **No git remote** — see Risks.
- Vitest prints a jsdom-per-file performance hint (24 environments) —
  informational only, tests are fast and stable.

## 8. Environment & Commands

Verified from `package.json`:

```bash
npm install        # node_modules
npm run dev        # Vite dev server (http://localhost:5173)
npm run test       # vitest run (24 files / 84 tests)
npm run test:watch # vitest watch mode
npm run lint       # eslint .
npm run build      # tsc -b && vite build
npm run format     # prettier --write src/**/* — SEE GOTCHA above
```

No environment variables required; no `.env`; no secrets in the repo.

## 9. Open Questions & Risks

- **No git remote configured** — all work (including the uncommitted
  design pass) exists only on this machine. Recommend adding a remote and
  pushing `stephent/work` before anything else.
- **5 files of completed design work are uncommitted** — commit before
  starting S13 so the changes don't mix with feature work.
- **Branch hygiene undecided** — `stephent/work` carries everything after
  `feat/render-preview`; nothing has been merged to `main`. Decide
  merge/PR strategy.
- SP-2 (two-column pagination strategy) undecided — blocks S10; PRD Open
  Question #1.
- PRD Open Question #2 (native print dialog variance) accepted for v1; an
  in-app export path may be added when a backend exists.
- `npm run build` chunk-size warning (>500 kB, pagedjs) — cosmetic today,
  revisit if load performance matters.
- Light serif titles (IBM Plex Serif 300 at 22px) — user has not yet
  eyeballed at length; a weight/size bump (400 / 24px) is the pre-agreed
  fallback if 300 reads thin.

## 10. Verification Checklist (first 10 minutes)

1. `npm run test` → 24 files / 84 tests pass.
2. `npm run lint` and `npx tsc -b` → both clean.
3. `npm run dev` → app opens: black header band ("Resume Builder ·
   A4 — ATS · Export PDF"); editor pane left with 9 sections and **no
   01–09 index numbers**; section titles in light serif with a clear gap
   above the forms; labels are Inter sentence-case.
4. Save an entry (e.g. Experience) → it appears in the saved-items list
   (no hairlines between rows, 8px gaps); the preview re-paginates; typing
   does NOT change the preview; hovering Cancel/Edit/Delete plays the
   underline wipe.
5. Export PDF → saved A4 PDF contains only resume sheets, page numbers
   bottom-center, selectable text, no blank pages.
