# Resume Builder — Story Backlog

Derived from `docs/PRD.md`. Stories are grouped by epic and ordered so each can be picked up once its dependencies are done. IDs are stable references (e.g. `S3`).

---

## Epic A — Foundation

### S1 — Project scaffold
**As a** developer **I want** a React + TypeScript project set up **so that** we have a consistent base to build on.
- Vite + React + TypeScript, strict mode on.
- ESLint + Prettier (mirror cvpeers conventions), path aliases, base folder structure (`components/`, `features/`, `lib/`, `templates/`, `types/`).
- Root layout shell: editor pane (left) + preview pane (right).

**Acceptance:** app builds and runs; lint/format pass; empty two-pane layout renders.
**Depends on:** —

### S2 — Data model + persistence abstraction
**As a** developer **I want** typed resume data and a storage interface **so that** the editor is decoupled from where data lives.
- Define `Resume` types for all 9 sections + selected template + schema version.
- `PersistenceProvider` interface (`load`, `save`, `clear`); `LocalStoragePersistence` implementation.
- Auto-save on every commit; restore on load.

**Acceptance (PRD FR12, FR14):** no UI code touches `localStorage` directly; reload restores last state; interface is swappable (verified by a stub/in-memory impl in tests).
**Depends on:** S1

---

## Epic B — Editor

### S3 — Section framework (save-based edit model)
**As a** user **I want** to fill a form and Save entries into a list **so that** the preview only changes when I commit.
- Generic repeatable-section component: form fields → **Save** → item added to saved-items list.
- Per-item **Edit** (load values back into form) and **Delete**.
- Typing does not emit any preview/state change; only Save/Delete commit.

**Acceptance (PRD FR3, FR4, AC "typing does not change preview"):** typing never mutates committed state; Save commits; Edit round-trips values; Delete removes.
**Depends on:** S2

### S4 — Contact/Header + Summary sections
**As a** user **I want** to enter my header and summary **so that** the resume has identity and intro content.
- Contact: name, title, email, phone, links.
- Summary: single rich-text-capable block (rich text arrives in S6; plain text acceptable until then).

**Acceptance:** header + summary persist via S2 and appear in committed state.
**Depends on:** S3

### S5 — Repeatable sections
**As a** user **I want** Experience, Education, Skills, Projects, Certifications, Languages, and Links **so that** I can capture full resume content.
- Each built on the S3 framework with section-specific fields.
- Multiple entries per section; add/edit/delete each.

**Acceptance (PRD FR1, FR2, AC "all nine sections"):** all nine sections support add/edit/delete.
**Depends on:** S3 (S4 in parallel)

### S6 — Rich-text editor for descriptions
**As a** user **I want** bold/italic/lists in descriptions **so that** I can format Experience, Projects, and Summary.
- Rich-text field (bold, italic, ordered/unordered lists only).
- Sanitize pasted/unsupported HTML to the allowed subset on commit.

**Acceptance (PRD FR5, edge case "unsupported HTML"):** only the allowed formatting persists; pasted HTML is sanitized.
**Depends on:** S4, S5

---

## Epic C — Rendering, Preview & Export

### S7 — Template rendering layer + T1 (ATS single-column)
**As a** user **I want** my data rendered as an ATS-friendly single-column resume **so that** it parses cleanly.
- Data → HTML/CSS render function; template registry.
- T1 single-column with standard headings, selectable text.

**Acceptance (PRD FR6 partial, FR11, Templates T1):** committed data renders to T1 HTML; text is selectable/extractable.
**Depends on:** S5 (S6 for formatted content)

### S8 — Automatic pagination (Paged.js)
**As a** user **I want** content to flow across A4 pages automatically **so that** I never manage page breaks.
- Integrate Paged.js over the template HTML; A4 page box; `break-inside: avoid` on entries; page numbers / running elements.

**Acceptance (PRD FR8, FR9, AC "content split automatically"):** multi-page content paginates with no entry split unless it alone exceeds a page; zero manual break config.
**Depends on:** S7

### S9 — Preview pane (Paged.js DOM)
**As a** user **I want** a faithful preview **so that** what I see matches the export.
- **SP-1 resolved (Option A):** pdf.js is dropped from v1. The preview is the **live Paged.js-rendered DOM** (same HTML/CSS the browser prints), shown scaled/scrollable in the preview pane. No client-side PDF blob is generated.
- Regenerate on Save / Delete / template switch — **not** on keystroke.
- Render layer kept clean so a future server-side PDF path (pagedjs-cli/Puppeteer) + pdf.js can slot in (Option C) when a backend arrives.

**Acceptance (PRD FR7, AC "preview matches export"):** preview updates only on commit/template switch and, being the same DOM the print path uses, matches exported output.
**Depends on:** S8

### S10 — T2 (designed two-column) template
**As a** user **I want** a modern two-column template **so that** I have a designed option.
- Sidebar (contact, skills, languages, links) + main column (summary, experience, education, projects).
- Must paginate under Paged.js.
- ⚠️ **Risk/spike:** two-column pagination strategy (PRD Open Q #1) — decide column-reset-per-page vs independent flows *before* building.

**Acceptance (PRD Templates T2, edge case "column exceeds one page"):** same data renders in T2 and paginates automatically without manual math.
**Depends on:** S8 (spike first)

### S11 — Template switcher
**As a** user **I want** to switch templates **so that** I can compare layouts.
- UI to select T1/T2; default T1; re-render same data; persist selection (S2).

**Acceptance (PRD FR6, AC "switch with no data loss"):** switching re-renders identical data; selection persists across reload.
**Depends on:** S7, S10

### S12 — Export to PDF (native print)
**As a** user **I want** to download my resume as PDF **so that** I can submit it.
- **Export PDF** triggers browser-native print-to-PDF over the paginated document; print CSS matches the preview.

**Acceptance (PRD FR10, AC "selectable text"):** exported file matches preview and contains real text.
**Depends on:** S8 (S9 for parity check)

---

## Epic D — Data portability & resilience

### S13 — JSON export / import
**As a** user **I want** to back up and restore my data **so that** I don't lose work or can move devices.
- **Export JSON** (full resume + template + schema version).
- **Import JSON** with schema validation; reject malformed/incompatible files without overwriting existing data.

**Acceptance (PRD FR13, AC "export/import round-trip", "invalid import preserves data"):** round-trip reproduces resume identically; invalid import shows error and preserves state.
**Depends on:** S2

### S14 — Edge-case & error handling pass
**As a** user **I want** graceful handling of failures **so that** I'm never confused or lose content.
- Empty-resume state + export warning.
- Unsaved-changes warning on navigate/add-another.
- localStorage unavailable/full → notify, disable auto-save, recommend JSON export.
- Long-field wrapping (no horizontal overflow).
- PDF generation failure → error state + retry, keep last good preview.

**Acceptance (PRD Edge Cases & Error Handling table):** each listed edge case behaves as specified.
**Depends on:** S9, S12, S13

---

## Suggested milestones
- **M1 — Data-in:** S1, S2, S3, S4, S5, S6 → user can enter and persist a full resume (no visual output yet).
- **M2 — See it:** S7, S8, S9 → ATS template renders, paginates, and previews faithfully.
- **M3 — Ship it:** S12, S13 → export to PDF and JSON backup/restore.
- **M4 — Choice + polish:** S10, S11, S14 → two-column template, switcher, edge cases.

## Pre-work spikes (do before their story)
- **SP-1 → S9:** ✅ Resolved (Option A) — no client-side PDF; preview = live Paged.js DOM, export = browser print, pdf.js deferred to a future server-side path.
- **SP-2 → S10:** two-column pagination strategy under Paged.js.
