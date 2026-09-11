# Resume Builder — Export PDF (Native Print) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user export the committed resume as a print-ready, selectable-text A4 PDF via the browser's native print-to-PDF pipeline — an **Export PDF** button in the black app band plus an app-level print stylesheet that strips every trace of app chrome so only the Paged.js sheets print.

**Architecture:** No PDF is generated in-app (SP-1 resolved: the preview DOM *is* the print source). `printStyles` — a string constant in `src/features/render/printStyles.ts`, following the `pageStyles` precedent — is mounted once by `App` as a `<style>` element. Inside `@media print` it declares a full-bleed `@page` (the Paged.js page boxes are 210×297mm with the resume's margins baked *inside* as `.pagedjs_margin` areas, so browser sheet margins must be zero or the boxes won't fit), hides the band + editor pane, resets the shell/preview containers, neutralizes the preview scale transform, and drops preview-only sheet chrome. Paged.js's `Previewer` injects its **own** `@media print` block (verified live in the running app): html/body margin zeroing + `print-color-adjust: exact`, `.pagedjs_pages { transform: none !important; overflow: visible }`, `.pagedjs_page { margin: 0; padding: 0; page-break-after: always; break-after: page }` — our block deliberately duplicates **none** of that. The **Export PDF** button calls `window.print()`; the native dialog does the rest.

**Tech Stack:** React + TS, the existing Paged.js preview, Vitest + React Testing Library (`vi.stubGlobal` to stub `window.print`).

**Spec:** `docs/PRD.md` (FR10, FR11, AC "exported PDF → real text"). `docs/STORIES.md` (S12). Prior plans: `docs/superpowers/plans/2026-09-10-resume-builder-foundation.md`, `docs/superpowers/plans/2026-09-11-resume-builder-editor-ui.md`, `docs/superpowers/plans/2026-09-11-resume-builder-render-preview.md`.

## Global Constraints

- TypeScript `strict` incl. `noUncheckedIndexedAccess`. NO `any`; NO `as` casts; NO `@ts-ignore` in production (a `// @ts-expect-error` is allowed in a test only to assert a wrong call fails to compile — none is needed in this plan).
- Test-suite neutrality: all **76 existing tests pass unchanged** — no existing assertion may be edited or deleted. All new tests are additive. Count anchors: 76 → 79 (Task 1) → 81 (Task 2) → 82 (Task 3).
- `printStyles` MUST NOT duplicate the print rules Paged.js injects itself (html/body margins, `print-color-adjust`, `.pagedjs_pages` transform/overflow, `.pagedjs_page` margin/padding/breaks). It contains only what Paged.js cannot know: this app's chrome and preview-only styling.
- `@page` in `printStyles` MUST be `size: A4; margin: 0` — full-bleed sheets (see Architecture). Browser-default margins would shrink the printable area and the 210mm boxes would not fit the sheet.
- Exactly one `!important` in `printStyles`: neutralizing Preview's **inline** `transform: scale(...)` on `.preview-pages` (inline beats any stylesheet). After Task 3's cleanup, `.preview-scroll` overflow/height are class rules overridden by document order — the print `<style>` renders inside `#root`, after `index.css` in `<head>` — so they need no `!important`.
- Design system: the Export PDF button reuses the `.btn`/`.btn--secondary` language inverted for the black band via a dedicated `.app-header__export` class — it only flips `border-color`/`color` to `--white`; padding (`--space-2 --space-3`), font (500 12px/1.2 sans), and the hover fade come from the shared classes. No new colors, no border-radius (the global reset keeps 0), `type="button"` per repo convention.
- Button behavior is exactly `onClick={() => window.print()}` — no disabled state, no empty-resume warning (that is S14), no custom export UI.
- Out of scope (later stories/plans): T2 two-column template (S10), template switcher (S11), JSON import/export (S13), edge-case pass incl. empty-resume export warning and PDF-failure states (S14), pdf.js (dropped per SP-1), server-side/pagedjs-cli export, overriding OS/browser print-dialog controls beyond `@page`, changing Paged.js's own injected rules, `pageStyles` content changes.
- Commit with Conventional Commit messages. Do NOT append any `Co-Authored-By`/session trailer to commits — the trailers in prior plans belong to a different agent and are deliberately omitted here.

## Existing interfaces this plan builds on (verified)

- `src/AppHeader.tsx` — `AppHeader()` renders `.app-header` with `__wordmark` + `__meta` spans; no props, no state. (No `AppHeader.test.tsx` exists yet.)
- `src/App.tsx` — `ResumeProvider` → `AppHeader` → `.app-shell` (`.editor-pane` + `.preview-pane` with `<Preview />`).
- `src/App.test.tsx` — `pagedjs` mocked at file level; one smoke test (Editor/Preview regions). The mock stays verbatim.
- `src/features/preview/Preview.tsx` — `.preview-scroll` carries inline `overflow: "auto"; height: "100%"`; `.preview-pages` carries inline `transform: scale(X); transform-origin: "top left"` (runtime fit-to-pane state).
- `src/features/render/pageStyles.ts` + `pageStyles.test.ts` — the string-constant + content-assertion precedent to mirror for `printStyles`.
- `src/index.css` — `.app-header` (52px band, `space-between`), `.app-header__wordmark/__meta`, `.btn` / `.btn--secondary` (1px ink border, transparent bg, hover `opacity: 0.5`), `.app-shell` (2-col grid, viewport-capped height), `.preview-pane` (`overflow: hidden`, hairline `border-left`, paper bg), `.preview-scroll` (padding only today), `.pagedjs_page` (white bg + hairline `box-shadow` ring).
- `window.print()` — a not-implemented stub in jsdom; `vi.stubGlobal("print", spy)` replaces it cleanly (`window === globalThis` in the jsdom environment).

---

### Task 1: Print stylesheet + mount it in the app

**Files:**
- Create: `src/features/render/printStyles.ts`
- Create: `src/features/render/printStyles.test.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx`

**Interfaces:**
- Produces: `printStyles: string` — one `@media print` block, self-contained (no design tokens, literal colors like `pageStyles`).
- Consumes: nothing new; `App` renders `<style>{printStyles}</style>` exactly once, inside the provider.

- [ ] **Step 1: Write failing tests for the print stylesheet**

Create `src/features/render/printStyles.test.ts`:
```ts
import { printStyles } from "./printStyles";

test("declares a full-bleed A4 sheet and hides the app chrome", () => {
  expect(printStyles).toContain("@media print");
  expect(printStyles).toContain("@page");
  expect(printStyles).toContain("size: A4");
  expect(printStyles).toContain("margin: 0");
  expect(printStyles).toContain(".app-header, .editor-pane");
  expect(printStyles).toContain("display: none");
  expect(printStyles).toContain(".app-shell");
  expect(printStyles).toContain("display: block");
});

test("resets the preview containers so only the sheets print", () => {
  expect(printStyles).toContain(".preview-pane");
  expect(printStyles).toContain("overflow: visible");
  expect(printStyles).toContain(".preview-scroll");
  expect(printStyles).toContain("height: auto");
  expect(printStyles).toContain(".preview-pages");
  expect(printStyles).toContain("transform: none !important");
  expect(printStyles).toContain(".pagedjs_page");
  expect(printStyles).toContain("box-shadow: none");
  expect(printStyles).toContain("background: #fff");
});

test("does not duplicate the print rules Paged.js injects itself", () => {
  // Verified live: Paged.js's Previewer injects html/body margin zeroing +
  // print-color-adjust: exact, .pagedjs_pages { transform: none !important;
  // overflow: visible }, and .pagedjs_page { margin: 0; padding: 0;
  // page-break-after: always; break-after: page } into @media print.
  expect(printStyles).not.toContain("print-color-adjust");
  expect(printStyles).not.toContain(".pagedjs_pages");
  expect(printStyles).not.toContain("break-after: page");
  expect(printStyles).not.toContain("page-break-after");
  expect(printStyles).not.toContain("padding: 0");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- printStyles`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the print stylesheet**

Create `src/features/render/printStyles.ts`:
```ts
// Print CSS for the native print-to-PDF export (S12). Paged.js's Previewer
// injects its OWN @media print block into the document (verified live):
// html/body margin zeroing + print-color-adjust: exact, .pagedjs_pages
// { transform: none !important; overflow: visible }, .pagedjs_page
// { margin: 0; padding: 0; page-break-after: always; break-after: page }.
// This block deliberately does NOT duplicate those — it adds only what
// Paged.js cannot know: this app's chrome and preview-only styling.
export const printStyles = `
@media print {
  /* Full-bleed sheets: Paged.js page boxes are 210x297mm with the resume's
     18mm/16mm margins baked INSIDE as .pagedjs_margin areas. Browser-default
     sheet margins would shrink the printable area and the boxes would not
     fit the page. */
  @page { size: A4; margin: 0; }
  body { background: #fff; }
  .app-header, .editor-pane { display: none; }
  .app-shell { display: block; height: auto; }
  .preview-pane { overflow: visible; border: 0; background: none; }
  /* Class-vs-class overrides: this <style> renders inside #root, after
     index.css in <head>, so document order wins without !important. Only
     the inline scale transform needs !important (inline beats stylesheets). */
  .preview-scroll { overflow: visible; height: auto; }
  .preview-pages { transform: none !important; }
  .pagedjs_page { box-shadow: none; }
}
`;
```

- [ ] **Step 4: Run the print-styles tests to verify they pass**

Run: `npm test -- printStyles`
Expected: PASS (3 tests).

- [ ] **Step 5: Add the failing App mount test**

Append to `src/App.test.tsx` (existing mock and smoke test stay verbatim), adding the import at the top:
```tsx
import { printStyles } from "./features/render/printStyles";
```
```tsx
test("mounts the print stylesheet for native PDF export", () => {
  const { container } = render(<App />);
  const style = container.querySelector("style");
  expect(style?.textContent).toBe(printStyles);
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- App`
Expected: FAIL — no `<style>` element is rendered yet (`querySelector` returns null).

- [ ] **Step 7: Mount the style element in App**

Modify `src/App.tsx` — add the import and render the print CSS once, as the first child inside the provider (position within `#root` is irrelevant to cascade; only "inside `#root`, after `<head>`" matters):
```tsx
import { printStyles } from "./features/render/printStyles";
```
```tsx
    <ResumeProvider persistence={persistence}>
      {/* Print CSS for native print-to-PDF (S12). Renders inside #root —
          after index.css in <head> — so its rules win on document order. */}
      <style>{printStyles}</style>
      <AppHeader />
```

- [ ] **Step 8: Run the App test, then the full suite**

Run: `npm test -- App` → Expected: PASS (2 tests).
Run: `npm test` → Expected: all green — 79 tests (76 existing + 3 new).

- [ ] **Step 9: Commit**

```bash
git add src/features/render/printStyles.ts src/features/render/printStyles.test.ts src/App.tsx src/App.test.tsx
git commit -m "feat: add full-bleed print stylesheet and mount it in the app"
```

---

### Task 2: Export PDF button in the app band

**Files:**
- Create: `src/AppHeader.test.tsx`
- Modify: `src/AppHeader.tsx`, `src/index.css`

**Interfaces:**
- Produces: `AppHeader()` now also renders `<button type="button" className="btn btn--secondary app-header__export">Export PDF</button>` whose click calls `window.print()` exactly once. Still no props, no app state.

- [ ] **Step 1: Write the failing tests**

Create `src/AppHeader.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the wordmark, meta label, and Export PDF button", () => {
  render(<AppHeader />);
  expect(screen.getByText("Resume Builder")).toBeInTheDocument();
  expect(screen.getByText("A4 — ATS")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
});

test("Export PDF opens the browser's native print dialog exactly once", async () => {
  // jsdom's window.print is a not-implemented stub; replace it globally for
  // the test (window === globalThis in the jsdom environment).
  const printSpy = vi.fn();
  vi.stubGlobal("print", printSpy);
  render(<AppHeader />);
  await userEvent.click(screen.getByRole("button", { name: "Export PDF" }));
  expect(printSpy).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- AppHeader`
Expected: FAIL — the button role does not exist yet (first test fails at `getByRole`).

- [ ] **Step 3: Implement the button**

Replace `src/AppHeader.tsx`:
```tsx
/** Black app band: wordmark + meta micro-label + Export PDF action. No nav. */
export function AppHeader() {
  return (
    <header className="app-header">
      <span className="app-header__wordmark">Resume Builder</span>
      <div className="app-header__actions">
        <span className="app-header__meta">A4 — ATS</span>
        <button type="button" className="btn btn--secondary app-header__export" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Add the band styles to index.css**

In `src/index.css` — first, next to the other `.app-header__*` rules:
```css
/* Right side of the band: meta label + export action grouped together. */
.app-header__actions {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}
```
Then, **immediately after the `.btn--secondary` rules** (order is load-bearing — equal specificity, so `.app-header__export` must come later to win):
```css
/* Inverted secondary for the black band: same shape and language as
   .btn--secondary (padding, 1px border, hover fade) with ink flipped
   to white. Font and padding come from the shared .btn classes. */
.app-header__export {
  border-color: var(--white);
  color: var(--white);
}
```

- [ ] **Step 5: Run the AppHeader tests, then the full suite**

Run: `npm test -- AppHeader` → Expected: PASS (2 tests).
Run: `npm test` → Expected: all green — 81 tests (79 + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/AppHeader.tsx src/AppHeader.test.tsx src/index.css
git commit -m "feat: add Export PDF button that opens the native print dialog"
```

---

### Task 3: Preview inline-style cleanup, full verification, docs

**Files:**
- Modify: `src/features/preview/Preview.tsx`, `src/features/preview/Preview.test.tsx`, `src/index.css`
- Modify (docs): `docs/PRD.md`, `docs/STORIES.md`

**Interfaces:** none new — a pure styling refactor. `.preview-scroll`'s static `overflow`/`height` move from inline style to the class; the dynamic scale transform stays inline.

- [ ] **Step 1: Write the failing regression test**

Append to `src/features/preview/Preview.test.tsx` (existing tests stay verbatim):
```tsx
test("scroll overflow/height come from CSS, not inline — only scale stays inline", () => {
  const { container } = render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
    </ResumeProvider>,
  );
  const scrollStyle = container.querySelector<HTMLElement>(".preview-scroll")?.getAttribute("style") ?? "";
  expect(scrollStyle).not.toContain("overflow");
  expect(scrollStyle).not.toContain("height");
  // The dynamic fit-to-pane scale is runtime state and must remain inline.
  const pagesStyle = container.querySelector<HTMLElement>(".preview-pages")?.getAttribute("style") ?? "";
  expect(pagesStyle).toContain("transform");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- Preview`
Expected: FAIL — `.preview-scroll` still carries inline `overflow: auto; height: 100%`.

- [ ] **Step 3: Move the static styles to CSS**

In `src/features/preview/Preview.tsx`, replace the return block (the pagination and fit effects are untouched):
```tsx
  return (
    <div ref={scrollRef} className="preview-scroll">
      <div
        ref={pagesRef}
        className="preview-pages"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
```
In `src/index.css`, replace the existing `.preview-scroll` rule with:
```css
/* Block padding only: inline padding would shrink the fit-to-width scale.
   overflow/height are class rules (not inline) so the print stylesheet can
   reset them by document order — only the dynamic scale stays inline. */
.preview-scroll {
  overflow: auto;
  height: 100%;
  padding: var(--space-4) 0;
}
```

- [ ] **Step 4: Run the Preview test, the full suite, lint, and build**

Run: `npm test -- Preview` → Expected: PASS (4 tests).
Run: `npm test` → Expected: all green — 82 tests (81 + 1 new), zero edits to existing assertions.
Run: `npm run lint && npm run build` → Expected: clean; build succeeds.

- [ ] **Step 5: Manual verification — activate the print CSS in-session**

jsdom cannot emulate print media, so verify in the running app. Run `npm run dev`, open the app, and in DevTools console temporarily inject the print rules as an **active** (not media-gated) style:
```js
const el = document.createElement("style");
// NOTE: Paged.js injects its OWN @media print <style> into <head> earlier in
// document order — a plain find("@media print") grabs that one. Ours is the
// <style> React mounts inside #root.
const css = document.querySelector("#root style")?.textContent ?? "";
el.textContent = css.replace("@media print {", "").replace(/}\s*$/, "");
document.head.append(el);
```
Expected observations:
- The black band and the editor pane disappear; the preview pane spans the full width with no hairline border and a white (not paper) background.
- Sheets render unscaled (transform neutralized) and without the hairline preview ring; consecutive sheets stack in flow.
- Resume margins still sit INSIDE each sheet (Paged.js margin areas) — each sheet looks like the preview page.
- `@page` has no on-screen effect (paged media only) — the full-bleed fit is covered by Step 6.
Remove with `el.remove()` (or reload). If any observation fails, fix `printStyles` before proceeding.

- [ ] **Step 6: Pause — the user runs the native print check**

Ask the user to click **Export PDF** (or Cmd+P) with a populated multi-page resume and "Save as PDF". Expected:
- Only the resume sheets print — no band, editor, preview scrollbars, or page rings.
- Paper size A4; margins "Default" is fine (the CSS `@page { margin: 0 }` wins, sheets print full-bleed).
- Multi-page resumes break one sheet per printed page; the bottom-center page numbers are present.
- Text in the saved PDF is selectable/copyable — real text, not rasterized (FR11 / AC).

- [ ] **Step 7: Update docs and progress checkboxes**

Only after the user confirms Step 6:
- `docs/PRD.md`: tick the AC `- [ ] **Given** an exported PDF … recoverable as real text` → `- [x]`.
- `docs/STORIES.md`: mark S12 shipped (append ` ✅` to the `### S12 — Export to PDF (native print)` heading).
- Tick this plan's completed step checkboxes.

- [ ] **Step 8: Commit (two focused commits)**

```bash
git add src/features/preview/Preview.tsx src/features/preview/Preview.test.tsx src/index.css
git commit -m "refactor: move preview scroll overflow and height into CSS"
git add docs/PRD.md docs/STORIES.md
git commit -m "docs: mark S12 native print export shipped"
```

---

## Self-Review

**Spec coverage (S12 / FR10 / FR11):** Export trigger = Task 2 button → `window.print()` (FR10). Print fidelity = Task 1 `printStyles` (full-bleed `@page`, chrome hidden, preview transforms/overflow reset, sheet ring removed) riding on the same DOM Paged.js already paginated — nothing re-renders for print. Selectable text (FR11) is inherent: the sheets are real DOM text, and the user's Step 6 check confirms it on the saved file. Task 3 guarantees the class-level print overrides actually apply (no inline `!important` battles left) and lands the manual verification jsdom cannot do. PRD Open Q #2 is accepted as-is: browser/OS print-dialog variance is tolerated; `@page` handles what CSS can.
**Out of scope:** confirmed — S10/S11/S13/S14 items, pdf.js, server-side export, dialog styling beyond `@page`.
**Type consistency:** `printStyles: string` is produced once and asserted identically in `printStyles.test.ts` and `App.test.tsx`. `AppHeader` stays prop-less; reducer, schema, and `pageStyles` are untouched. No `any`/`as` anywhere; `querySelector<HTMLElement>` generics only.
**Testing boundary:** jsdom cannot emulate print media or the native dialog — print CSS is verified by content assertions (Task 1), an in-session active-style injection (Task 3 Step 5), and a human Cmd+P check (Step 6). `window.print` is verified via `vi.stubGlobal`.

## Next plan (write when this lands)
- **S13 — JSON export/import:** export full resume + template + schema version; import with schema validation, rejecting malformed/incompatible files without partial overwrite. Render-time `sanitizeHtml` (Plan 3) already defends the `REPLACE_ALL` import path. Then S10/S11 after the SP-2 two-column pagination spike, and S14 last.
