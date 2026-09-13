# Simple Resume

A local-first resume builder. You fill in nine sections, a live A4 preview
paginates itself, and the browser's own print pipeline turns that same
document into a PDF. No accounts, no backend — everything lives in your
browser's local storage.

## Why it exists

This is a rebuild of [cvpeers](https://github.com/tamasstephen/cvpeers), an
Angular + jsPDF app whose page breaks were computed by hand. Every layout
change meant redoing the break maths, and the PDF still drifted from what the
editor showed.

Simple Resume takes the problem away instead of solving it repeatedly: the
document is HTML and CSS, [Paged.js](https://pagedjs.org/) does the
pagination, and the preview **is** the print artifact — the same DOM the
browser prints. There is no page-break configuration anywhere in the codebase.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest
npm run lint     # eslint
npm run build    # tsc -b && vite build
```

## How it works

Editing is **save-based**: typing never changes the preview. A form edits a
local draft, and only Save, Delete or a template switch commits to state — so
the preview repaginates on meaningful changes rather than on every keystroke.

```
form draft ──Save──▶ reducer ──▶ committed state ──▶ Paged.js ──▶ preview DOM
                                        │                            │
                                   localStorage                 window.print()
```

| Area                         | Where                   |
| ---------------------------- | ----------------------- |
| Schema, persistence, reducer | `src/lib/`              |
| Editor UI                    | `src/features/editor/`  |
| Template + page CSS          | `src/features/render/`  |
| Paginated preview            | `src/features/preview/` |

Two details worth knowing before changing things:

- `src/features/render/pageStyles.ts` is a **print artifact**, not app chrome.
  It is deliberately set in points and Arial, and it does not share the app's
  design tokens.
- Rich text is sanitised twice — once when saved and once at render — because
  imported data can reach committed state without passing the editor.

## Stack

React 19 · TypeScript (strict, `noUncheckedIndexedAccess`) · Vite · Zod ·
TipTap · Paged.js · DOMPurify · Vitest + Testing Library. Plain CSS, no
framework.

## Status

The ATS template, editor, preview and PDF export work end to end. Still open:
JSON import/export, a second (designed, two-column) template and the template
switcher. `docs/PRD.md` and `docs/STORIES.md` hold the requirements and
backlog; `docs/design-ledger.md` records the design decisions and should be
read before any UI work.
