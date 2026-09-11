# PRD: Resume Builder (cvpeers v2)

## Problem Statement
The previous resume builder (cvpeers, Angular + jsPDF) produced PDFs through a low-level, coordinate-based API that required manually calculating where pages should break. This made pagination fragile — content split awkwardly across pages and every layout change forced the break math to be redone. Job seekers need a builder that lets them enter their information once and reliably get a clean, professionally paginated PDF, without the tool (or the user) ever fighting page breaks.

## Goals
- Let a user build a resume through a form-based interface and get a print-ready A4 PDF.
- Handle pagination **automatically** via a CSS layout engine (Paged.js) — no manual coordinate or page-break calculation, and no orphaned/split entries.
- Provide a preview (rendered via pdf.js) that faithfully matches the exported PDF.
- Offer two templates: an **ATS-friendly single-column** template and a **designed two-column** template.
- Preserve rich-text formatting in descriptions (parity with the old Quill-based editor).
- Keep user data private and local by default, with a clean path to add cloud sync later.

## Non-Goals
- **No user accounts, authentication, or backend** in v1 (data layer is abstracted so cloud sync can be added later).
- **No drag-and-drop reordering** of sections or entries in v1.
- **No user-defined custom sections** in v1 (fixed section catalog only).
- **No page sizes other than A4** in v1.
- **No cover-letter builder, no multi-language UI, no AI content generation.**
- **No live keystroke preview** — the preview updates only when an entry is saved (see User Flow).
- Not a PDF *import*/parser — the app builds resumes, it does not read existing PDFs into the editor.

## Templates
- **T1 — ATS single-column:** simple single-column structure, standard section headings, selectable text. Optimized to parse cleanly through Applicant Tracking Systems.
- **T2 — Designed two-column:** a sidebar (e.g. contact, skills, languages, links) plus a main column (e.g. summary, experience, education, projects). More visually modern; ATS parsing is a secondary concern for this template.
- Both templates target A4 and must paginate automatically.

## Functional Requirements

1. The system must present a form-based editor with these sections: **Contact/Header, Summary, Experience, Education, Skills, Projects, Certifications, Languages, and Social/Portfolio Links.**
2. The system must allow the user to add, edit, and delete multiple entries within repeatable sections (Experience, Education, Projects, Certifications, Languages, Links).
3. For each entry, the user fills in form fields and clicks a **Save** button. Typing into the fields must **not** change the preview. On Save, the entry is committed to a saved-items list for that section.
4. Each saved item must display in a list with an **Edit** button. Editing loads the item's values back into the form; committing changes requires Save. A **Delete** action must also be available per item.
5. The system must provide a **rich-text editor** for description fields (Experience, Projects, Summary) supporting bold, italic, and bulleted/ordered lists. (No links, underline, or alignment in v1.)
6. The system must let the user **choose between the two templates (T1, T2)**, and switching templates must re-render the same resume data in the selected layout.
7. The system must render a **preview** of the resume from the **actual generated PDF via pdf.js**, so the preview is visually identical to the downloaded file. The preview regenerates **on Save, on delete, and on template switch** — not while typing.
8. The system must lay out the resume as **A4 pages and paginate content automatically** using Paged.js, keeping individual entries from splitting across a page boundary where avoidable (`break-inside: avoid`), for both templates.
9. The system must apply **running elements** as needed (e.g., page numbers) consistently across pages.
10. The system must let the user **export/download the resume as a PDF via the browser's native print-to-PDF** pipeline.
11. The exported PDF must contain **selectable, real text** (not rasterized images). Template T1 must be structured to remain ATS-parseable.
12. The system must **auto-save** the current resume (all saved items + selected template) to local browser storage (localStorage/IndexedDB) and restore it on the next visit.
13. The system must let the user **export their resume data as a JSON file** and **import a previously exported JSON file** to restore or transfer their work.
14. The data-persistence layer must be **abstracted behind an interface** so a future backend (accounts/cloud sync) can be added without rewriting the editor.
15. The application must be built in **React (TypeScript)** and run fully client-side.

## User Flow
1. User opens the app; if prior data exists in local storage, the editor and preview are pre-populated, otherwise an empty resume is shown.
2. User selects a template (T1 or T2); default is T1.
3. User fills in the Contact/Header fields and clicks **Save**; the preview renders the header.
4. User opens a repeatable section (e.g. Experience), fills the form (using rich-text for the description), and clicks **Save**. The entry appears in that section's saved-items list and the preview regenerates.
5. User continues adding entries across sections. Typing never changes the preview; only Save/Delete/template-switch do.
6. To revise an entry, the user clicks **Edit** on a saved item, changes fields, and clicks **Save** again; the preview updates.
7. As content grows beyond one A4 page, the system paginates automatically without splitting an individual entry.
8. The system auto-saves the resume to local storage on every commit.
9. User clicks **Export PDF**, which opens the browser's native print-to-PDF flow to produce the downloadable file.
10. Optionally, the user clicks **Export JSON** to back up data, or **Import JSON** to load it on another device/browser.

## Edge Cases & Error Handling

| Trigger | System response |
|---|---|
| A single entry's content is taller than one page | Entry is allowed to break across pages as a last resort (avoid-break is a preference, not a hard guarantee); no content is lost or clipped. |
| Two-column template (T2): a column's content exceeds one page | Content continues onto the next page automatically; the two-column structure is maintained per page without manual break configuration. |
| User edits fields but navigates away / adds another item without clicking Save | Unsaved field changes are not reflected in the preview or storage; the system warns before discarding unsaved edits. |
| All sections empty / brand-new resume | Preview shows an empty A4 page; Export PDF is available but warns if the resume has no content. |
| Template switch with existing data | Same data re-renders in the new template; no data is lost. |
| localStorage unavailable or full (private mode / quota) | System notifies the user that auto-save is disabled and recommends JSON export; editing still works in-session. |
| Imported JSON is malformed or from an incompatible schema version | Import is rejected with a clear validation error; existing data is left untouched (no partial overwrite). |
| Rich-text field contains unsupported/pasted HTML | Input is sanitized to the supported formatting subset (bold/italic/lists) before storage and rendering. |
| Very long single field (e.g., a 200-char job title) | Text wraps within its container; layout does not overflow the page horizontally. |
| PDF generation fails mid-render | User sees an error state in the preview with a retry option; the last good preview is not discarded. |

## Acceptance Criteria
- [ ] **Given** a resume whose content exceeds one A4 page, **when** the user views the preview and exports, **then** content is split across multiple A4 pages automatically with no individual entry split unless it alone exceeds a page — and no manual page-break configuration exists in the flow, for **both** templates.
- [ ] **Given** a user is typing into an entry's fields, **when** they have not clicked Save, **then** the preview does not change.
- [ ] **Given** a user clicks Save on an entry, **when** the save completes, **then** the item appears in the saved-items list and the pdf.js preview regenerates to include it.
- [ ] **Given** a saved item, **when** the user clicks Edit, changes values, and clicks Save, **then** the preview reflects the updated values; **when** the user clicks Delete, **then** the item is removed from the list and preview.
- [ ] **Given** the two templates, **when** the user switches between T1 and T2, **then** the same resume data renders in the selected layout with no data loss.
- [x] **Given** an exported PDF, **when** its text is selected/copied (or run through a text extractor), **then** the resume content is recoverable as real text.
- [ ] **Given** a user reloads the browser, **when** the app opens, **then** their most recent resume and selected template are restored from local storage.
- [ ] **Given** a user exports JSON and imports it in a different browser, **when** the import completes, **then** the resume is reproduced identically.
- [ ] **Given** an invalid JSON import, **when** the user attempts it, **then** the app shows a validation error and preserves existing data.
- [ ] All nine specified sections are supported with add / edit / delete on repeatable entries.
- [ ] The persistence layer is accessed only through an interface/abstraction (verifiable in code review) so no UI/editor code calls localStorage directly.

## Open Questions
1. **Two-column pagination (T2):** A full-height sidebar conflicts with top-to-bottom page flow. Decide the per-page column strategy (e.g. columns reset per page vs. independent column flows) so Paged.js can paginate T2 without manual math.
2. **Native print-to-PDF UX:** Browser print dialogs vary and include OS-level controls (margins, headers) the app can't fully suppress. Confirm this is acceptable, or whether we later add an in-app export path.
