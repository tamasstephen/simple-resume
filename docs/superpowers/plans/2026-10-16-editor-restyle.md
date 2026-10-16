# Editor Restyle (Wave 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the editor at `/create/` to the personal design system and the Paper redesign: the new header, a numbered section rail, section headings, full-width entry rows, new form controls, dialog, menu, tags, empty states and preview bar. Behaviour does not change.

**Architecture:**
- `src/index.css` switches from the old paper/ink tokens to the shared `src/styles/tokens.css` that the landing page already uses.
- One new data module, `sectionMeta.ts`, is the single source for section numbers, anchors and copy.
- Two new components: `SectionHeading` and `SectionRail`. The rail uses a small `useActiveSection` hook.
- The entry `<table>` becomes a `<ul>` of rows.
- No reducer, schema or persistence changes.

**Tech Stack:** React 19, TS strict, plain CSS, Vitest + Testing Library, `@fontsource/inter` 400–700, `@fontsource/ibm-plex-mono` 400/500.

**Spec:** the Paper file "Personal website":
- Page "Resume Builder Redesign", artboards "Editor — Desktop" and "Editor — Edit dialog, validation".
- Page "Personal Design System", sections "Form states", "Controls, lists & overlays" and "Dialog".

Read exact values with Paper `get_jsx` / `get_computed_styles` by layer name, never from screenshots.

## Global Constraints

- **User decisions (2026-10-16) override the earlier design-ledger corrections:**
  - Keep section numbers 01–09.
  - Use the full new look: Inter titles, 6px control radius, 8px menu/list radius, 12px dialog radius, shadows on the dialog and menu.
  - Use full-width entry rows instead of the hugging table.
- **Out of scope for this wave:**
  - Validation/error states and the rail's error badges → Wave 3.
  - Completion checkmarks, the Backup button and the template picker → later wave.
  - Zoom toggle, "Duplicate" menu item and "⌘ + Enter" hint: not built.
  - Do not render placeholders for any of these.
- **Off-limits files:**
  - `src/features/render/pageStyles.ts` is untouched.
  - `src/features/render/printStyles.ts` gets exactly one change: `.section-rail` added to its existing hide selector (`.app-header, .editor-pane, .section-rail { display: none; }`) with a matching assertion in `printStyles.test.ts`.
  - The printed resume must otherwise be identical.
- **Tokens and fonts:**
  - Tokens come only from `src/styles/tokens.css`. Remove `--paper`, `--ink`, `--ink-muted`, `--hairline`, `--white`, `--danger`, `--font-serif`, `--fs-*`, `--lh-*` and `--space-*` from `src/index.css`.
  - Remove the `@fontsource/ibm-plex-serif` import and dependency.
- **Colour roles:**
  - Danger text uses `--color-danger-text` (#CD2B31).
  - Cobalt `--color-primary` is used only for focus rings (`0 0 0 3px` at 20% plus a 1px `--color-primary` border on inputs) and the active rail marker. There is no cobalt fill on buttons; the primary button is black.
- **Section order and numbering follow the editor's document order:** 01 Contact, 02 Links, 03 Summary, 04 Experience, 05 Education, 06 Skills, 07 Projects, 08 Certifications, 09 Languages.
- **Section copy (verbatim):**

  | # | Name | Headline | Description |
  |---|---|---|---|
  | 01 | Contact | How to reach you | Your name and title lead the page; the rest prints on one line beneath. |
  | 02 | Links | Where to find you online | Portfolio, GitHub, LinkedIn — whatever helps someone see your work. |
  | 03 | Summary | Your story in brief | Two or three sentences: what you do and what you’re best at. |
  | 04 | Experience | Where you’ve worked | Newest first. Two to four bullet points per role read best on paper. |
  | 05 | Education | What you studied | Degrees, schools and years. Newest first. |
  | 06 | Skills | What you’re good at | One skill per tag. They print as a single line. |
  | 07 | Projects | Things you’ve built | Side projects, open source, or notable work outside a job. |
  | 08 | Certifications | Proof on paper | Optional — skip it if it doesn’t apply. |
  | 09 | Languages | Languages you speak | Add a level if it helps, like “German — C1”. |

- **Below 960px:**
  - The rail becomes a horizontally scrollable strip, sticky under the header, showing number and name only.
  - Panes stack as today: header, rail strip, editor, preview.
  - Ruling: the redesign has no mobile editor artboard.
- **Project rules:** no `as`, no `any`, guard clauses, functions ≤ ~20 lines, object params for more than 2 args, no commented-out code.
- **Tests:** existing tests are updated, not deleted, when a selector or copy changes. Every behaviour they assert (Edit/Delete menu, Esc, focus return, tag edit/remove, print) must still be asserted.

## Review Focus

1. **Print/PDF export unchanged.** `printStyles.test.ts` and `pageStyles.test.ts` stay green. The new rail is hidden in print: Task 2 adds `.section-rail` to the print hide selector and a test for it.
2. **Keyboard reach.**
   - The rail links move focus to the section heading, not just scroll; the heading gets `tabIndex={-1}`.
   - The kebab menu keeps arrow-key cycling, Esc and focus return.
   - Covered by Task 2 and Task 3 tests.
3. **Long content.**
   - A 120-character role or company truncates with an ellipsis inside the row. The date column and kebab keep their fixed slots.
   - 30 skills wrap without horizontal scroll.
   - Covered by Task 3: a CSS check plus a Chrome DevTools check at 1440 and 390.
4. **Empty resume.** Every repeatable section shows the empty state with its own Add button, and the rail still lists all nine. Covered by Task 3.
5. **Scroll-spy where IntersectionObserver is missing (jsdom, old browsers).** The rail must render with no active item and must not throw. Covered by Task 2.

---

### Task 1: Tokens, fonts and base controls

**Files:**
- Modify: `src/index.css` (tokens, base, buttons, inputs, checkbox, toolbar toggles, focus, preview sheet), `src/main.tsx` (font imports + `./styles/tokens.css`), `package.json`, `docs/design-ledger.md`
- Test: `src/indexCss.test.ts` (new)

**Interfaces:**
- Produces: class names that stay stable for later tasks: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--text`, `.btn--toggle`, `.field`, `.field--short`, `.field--medium`, `.rich-text__toolbar`, `.rich-text .tiptap`.
- Consumes: `src/styles/tokens.css` (exists).

- [ ] **Step 1: Write the failing test.** `src/indexCss.test.ts` imports `./index.css?raw` and asserts:
  - it does not match `/--paper|--ink\b|--font-serif|IBM Plex Serif/`
  - it contains `var(--color-text)`, `var(--radius-control)` and `var(--color-focus)`
  - it still contains the `@media print` block that resets `#root`
- [ ] **Step 2: Run `npx vitest run src/indexCss.test.ts`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Values come from the Paper Design System sections "Actions", "Inputs & states", "Form states" and "Controls, lists & overlays".
  - **Base:** body background `--color-background`; body text Inter 14px/150% `--color-text`.
  - **Primary button:** black fill, white 14px/600, height 40px (36px in the header), padding-inline 16px, radius 6, hover opacity 0.85, disabled `--color-surface` fill with `--color-text-disabled` text.
  - **Secondary button:** white, 1px `--color-border-strong`, same metrics.
  - **Text button:** keep the underline-sweep keyframes; colour `--color-text`.
  - **Toggle:** 32×28, radius 4; when `aria-pressed="true"`, black fill with white text.
  - **Labels:** 14px/600 `--color-text`, 8px above the input.
  - **Inputs:** height 44px, padding-inline 14px, 1px `--color-border-strong`, radius 6. On focus: 1px `--color-primary` border plus `box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)`. Disabled: `--color-surface` fill and `--color-text-disabled`.
  - **Checkbox:** `accent-color: var(--color-text)`, 18px.
  - **Rich text:** one bordered box with radius 6. The toolbar sits inside it on top, with a `--color-surface` background and a 1px `--color-border` bottom.
  - **Focus-visible (non-input):** `outline: 2px solid var(--color-primary); outline-offset: 2px`.
  - **Preview sheet:** `.pagedjs_page` shadow `0 0 0 1px rgb(0 0 0 / 6%), 0 12px 32px rgb(0 0 0 / 6%)`.
  - **`main.tsx`:** import Inter 400/500/600/700, IBM Plex Mono 400/500 and `./styles/tokens.css` before `./index.css`. Remove IBM Plex Serif and run `npm uninstall @fontsource/ibm-plex-serif`.
  - **Ledger:** append to `docs/design-ledger.md` Corrections: `2026-10-16 — Redesign adopted from the personal design system (Paper): numbers 01–09 kept, Inter titles, radius 6/8/12, dialog and menu shadows, full-width entry rows. Supersedes the zero-radius, no-shadow, IBM Plex Serif, hugging-table and no-numbers corrections above.` Update the Tokens section to point at `src/styles/tokens.css`.
- [ ] **Step 4: Run `npm run test && npm run lint && npm run build`.** Expected: PASS. Existing snapshot or class assertions that only changed style must still pass. If one asserted a removed token, update it.
- [ ] **Step 5: Commit.** `Adopt the personal design system tokens in the editor so app and landing speak one visual language`

### Task 2: App shell — header, section rail, section headings, preview bar

**Files:**
- Create: `src/features/editor/sectionMeta.ts`, `src/features/editor/SectionHeading.tsx`, `src/features/editor/SectionRail.tsx`, `src/features/editor/useActiveSection.ts`, `src/features/preview/PreviewBar.tsx`
- Modify: `src/features/render/printStyles.ts` + `printStyles.test.ts` (add `.section-rail` to the hide selector only), `src/App.tsx`, `src/AppHeader.tsx`, `src/features/editor/Editor.tsx`, `src/features/editor/SectionEditor.tsx` (heading), `src/features/editor/sections/ContactForm.tsx`, `SummaryForm.tsx`, all repeatable `*Section.tsx` (pass `sectionId`), `src/index.css`
- Test: `sectionMeta.test.ts`, `SectionRail.test.tsx`, `useActiveSection.test.ts`, `PreviewBar.test.tsx`; update `AppHeader.test.tsx` and `Editor.test.tsx`

**Interfaces:**
- Produces:
  - `export type SectionId = "contact" | "links" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "languages"`
  - `export interface SectionMeta { id: SectionId; number: string; name: string; headline: string; description: string }`
  - `export const SECTIONS: readonly SectionMeta[]` (document order, numbers "01".."09")
  - `export function getSectionMeta(id: SectionId): SectionMeta`
  - `export function sectionAnchor(id: SectionId): string` returns `` `section-${id}` ``
  - `<SectionHeading sectionId={id} />` renders the eyebrow `"04 / EXPERIENCE"` (mono), an `<h2 tabIndex={-1} id={sectionAnchor(id) + "-title"}>` with the headline, and a `<p>` description.
  - `<SectionRail activeId={SectionId | null} />`
  - `useActiveSection(ids: readonly SectionId[]): SectionId | null`
  - `<PreviewBar pageCount={number} />`
  - `SectionEditor` gains a required prop `sectionId: SectionId`. Its `title` prop stays for the dialog and aria labels.

- [ ] **Step 1: Write the failing tests.**
  - `sectionMeta`:
    - `SECTIONS.map(s => s.id)` equals the order in Global Constraints.
    - Numbers are "01".."09".
    - `getSectionMeta("experience").headline === "Where you’ve worked"`.
    - `sectionAnchor("links") === "section-links"`.
  - `SectionRail`:
    - Renders a `nav` named "Sections" with 9 links. Each `href` is `#section-<id>`, and each label contains the number and name.
    - `activeId="experience"` puts `aria-current="location"` on that link only.
    - Clicking a link focuses the matching `h2` (render the `Editor` alongside).
  - `useActiveSection`:
    - With `window.IntersectionObserver` undefined, it returns `null` and doesn't throw.
    - With a fake observer, the entry intersecting nearest the top wins.
  - `PreviewBar`:
    - `pageCount=0` shows `PREVIEW · A4`.
    - `pageCount=1` shows `PREVIEW · A4 · 1 PAGE`.
    - `pageCount=2` shows `PREVIEW · A4 · 2 PAGES`.
  - `AppHeader`:
    - Shows the "Simple Resume" wordmark, `SAVED LOCALLY` and "Export PDF".
    - Shows "Alex Morgan — Staff Engineer" when the committed contact has name and title; shows only the name when the title is empty; shows nothing there when the name is empty.
    - The page-count tests move to `PreviewBar`. Export still calls `window.print` once, and the stacked-layout Preview link is kept.
  - `Editor`: renders all nine `h2` headlines in order.
- [ ] **Step 2: Run the new and updated tests.** Expected: FAIL.
- [ ] **Step 3: Implement.** Values come from the "Editor — Desktop" artboard.
  - **Layout:** grid `232px minmax(0, 600px) 1fr`. The header is 64px, padding-inline 24px, with a bottom border.
  - **Rail:**
    - padding 24px 12px; items 36px tall, radius 6; number slot 22px (mono 12); right status slot 20px (empty this wave).
    - The active item gets a `--color-surface` background, 600 weight and a 2px `--color-primary` bar on its left edge.
    - It scrolls with the editor column (sticky, top 64px).
  - **Editor column:** padding 40px 48px; sections separated by a 32px gap and a top border; heading block gap 10px (eyebrow mono 12/0.06em; h2 32/700/−0.035em/36px; description 15px/150% `--color-text-secondary`).
  - **Section ids:** each section's `<section>` gets `id={sectionAnchor(id)}`.
  - **Header:**
    - Wordmark: Inter 16/700/−0.02em, then a 1px × 16px divider, then the name/title in 14px secondary.
    - `SAVED LOCALLY` in mono 12 with a 6px `--color-success` dot.
    - Export PDF: primary 36px with a download icon (inline SVG from the artboard).
  - **Preview pane:** `--color-surface` background, padding 24px 40px. `PreviewBar` sits above the sheets: 32px, mono 12/0.06em secondary.
  - **Below 960px:** the rail is a horizontal strip as described in Global Constraints, and is hidden in print.
- [ ] **Step 4: Run `npm run test && npm run lint && npm run build`.** Then do a visual check with Chrome DevTools at 1440×900 and 390×844 against the artboard: no horizontal scroll; the rail is hidden in print preview (`emulate` with media `print`).
- [ ] **Step 5: Commit.** `Give the editor a numbered section rail and real headings so long resumes are navigable`

### Task 3: Entry rows, menu, tags, empty states, dialog

**Files:**
- Modify: `src/features/editor/SectionEditor.tsx`, `KebabMenu.tsx` (markup classes only), `ItemDialog.tsx`, `src/index.css`
- Test: update `SectionEditor.test.tsx`; add cases there

**Interfaces:**
- Consumes: `SectionHeading` and `sectionId` from Task 2.
- Produces:
  - The entry list is `<ul class="entry-list" aria-label="{title} items">` with `<li class="entry">` rows.
  - The empty state is `<div class="empty-state">` holding a title, the description from `getSectionMeta(...)` and the Add button.

- [ ] **Step 1: Update and add the failing tests in `SectionEditor.test.tsx`:**
  - Saved items render as `listitem`s in a list named "{Title} items" (no `table` role remains).
  - With `renderMeta`, the meta text is in the same `listitem`.
  - The empty section shows `` `No ${title.toLowerCase()} yet` `` (e.g. "No experience yet", "No skills yet") plus the section description and an "Add {itemNoun}" button.
  - The dialog shows the eyebrow `"{NUMBER} / {NAME} / NEW"` when adding and `"… / EDIT"` when editing.
  - Its heading is "Add {itemNoun}" or "Edit {itemNoun}".
  - A "Close" button calls `onCancel`.
  - The Save label stays "Save" or "Save changes".
  - Every existing behaviour test (kebab Edit/Delete, Esc, focus return, outside click, danger modifier, tags edit/remove) still passes. Only the selectors change.
- [ ] **Step 2: Run `npx vitest run src/features/editor`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Values come from the "Editor — Desktop" artboard (layers "Entries", "List", "Row") and the design system's "Controls, lists & overlays" and "Dialog" sections.
  - **List:** 1px `--color-border`, radius 8, rows separated by 1px borders.
  - **Row:** padding 14px 12px 14px 16px, gap 16px. The text column flex-grows with the title 14/600 (truncated with an ellipsis) and the subtitle 13px secondary from `renderSummary`. The meta column is a fixed 110px, right-aligned, mono 12 secondary. The kebab slot is 32×32, `flex-shrink: 0`.
  - **Menu:** 176px wide, padding 4px, radius 8, 1px border, shadow `0 8px 24px rgb(0 0 0 / 8%)`. Items 36px, radius 4, hover `--color-surface`. Delete is 500 weight in `--color-danger-text`.
  - **Tags:** 32px tall, radius 6, 1px `--color-border`, label 14px, remove icon 20px in secondary.
  - **Add button:** secondary 40px with a 14px plus icon, labelled "Add {itemNoun}".
  - **Empty state:** 1px dashed `--color-border-strong`, radius 8, padding 20px. The text block sits left and the Add button right (it wraps below 480px).
  - **Dialog:**
    - 560px wide, radius 12, no border, shadow `0 24px 64px rgb(0 0 0 / 18%)`, `::backdrop` `--color-scrim`.
    - Header padding 24px 24px 0: eyebrow mono 12, title 20/600, Close icon button 32px.
    - Body padding 20px 24px 24px with a 16px gap.
    - Footer: sticky, 1px top border, padding 16px 24px, buttons right-aligned. Cancel is secondary and Save primary, both 40px.
- [ ] **Step 4: Run `npm run test && npm run lint && npm run build`.** Then use Chrome DevTools at 1440 and 390:
  - add an experience with a 120-character role, which truncates while date and kebab keep their slots
  - add 30 skills, which wrap with no horizontal scroll
  - check that an empty resume shows nine sections with empty states where repeatable
  - open and close the dialog with Esc and with the Close button
- [ ] **Step 5: Commit.** `Show saved entries as full-width rows with clear empty states so each section reads at a glance`
