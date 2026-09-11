# Resume Builder — Render & Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the committed resume as an ATS-friendly single-column HTML document and show it in the right-hand pane as a live, automatically-paginated A4 preview via Paged.js — updating whenever the user Saves.

**Architecture:** A React template component (`AtsTemplate`) renders a `Resume` to markup; `renderResumeHtml` stringifies it with `renderToStaticMarkup`. Rich-text fields are injected with `dangerouslySetInnerHTML` after a render-time `sanitizeHtml` pass (defense-in-depth — the `REPLACE_ALL`/import path bypasses the editor's Save-time sanitizer). A `Preview` component feeds that HTML plus a page-CSS string to Paged.js's `Previewer.preview(content, stylesheets, container)`, which fragments it into A4 pages in the DOM; the preview re-renders on every committed change. No PDF is generated and pdf.js is not used (SP-1: the Paged.js DOM *is* the faithful preview; export via native print is Plan 4).

**Tech Stack:** React + TS, `react-dom/server` (`renderToStaticMarkup`), Paged.js (`pagedjs`), existing DOMPurify `sanitizeHtml`, Vitest + React Testing Library.

**Spec:** `docs/PRD.md` and `docs/STORIES.md` (stories S7, S8, S9). Prior plans: `docs/superpowers/plans/2026-09-10-resume-builder-foundation.md`, `docs/superpowers/plans/2026-09-11-resume-builder-editor-ui.md`.

## Global Constraints

- TypeScript `strict` incl. `noUncheckedIndexedAccess`. NO `any`; NO `as` casts; NO `@ts-ignore` in production (a `// @ts-expect-error` is allowed in a test only to assert a wrong call fails to compile).
- Rich-text HTML (`summary.text`, `experience[].description`, `education[].description`, `projects[].description`) MUST pass through `sanitizeHtml` at render time before `dangerouslySetInnerHTML` — this is the render-side defense-in-depth for the import trust boundary.
- Plain-text fields are rendered as JSX text children (React auto-escapes) — never via `dangerouslySetInnerHTML`.
- Template is **single-column, ATS-parseable**, selectable real text, **clean modern sans** styling (Arial/Helvetica system stack). A4 page size.
- Paged.js call signature: `new Previewer().preview(content, stylesheets, renderTo)` where `content` is the HTML string, `stylesheets` is `[{ "resume-page": pageStyles }]` (inline-CSS object form), `renderTo` is the container element. It returns a promise resolving to a flow (`.total` pages).
- The preview regenerates on committed change only (Save/Delete/template switch) — it reads `useResumeState().committed`; typing never triggers it (typing never mutates committed state).
- Only the T1 (`"ats"`) template exists; `renderResumeHtml` maps `template: "designed"` to the ATS template as a fallback until T2 lands in Plan 4.
- Out of scope (later plans): PDF export / native print (S12), T2 two-column template (S10), template switcher UI (S11), JSON import/export (S13), edge-case UX pass (S14).
- Commit with Conventional Commit messages. End EVERY commit message with this two-line trailer, preceded by a blank line (use these literal strings; do not substitute your own model name):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01V3g4wk6WvZyFWkXAxzo7pp
  ```

## Existing interfaces this plan builds on (verified)

- `src/lib/schema/resume.ts` — `Resume`, `emptyResume()`, and item types. Fields: `contact {name,title,email,phone,location}`, `summary {text}`, `experience[] {id,company,role,startDate,endDate,current,location,description}`, `education[] {id,institution,degree,field,startDate,endDate,description}`, `skills[] {id,name}`, `projects[] {id,name,url,description}`, `certifications[] {id,name,issuer,date}`, `languages[] {id,name,proficiency}`, `links[] {id,label,url}`, plus `template: "ats" | "designed"`.
- `src/lib/sanitizeHtml.ts` — `sanitizeHtml(dirty: string): string` (DOMPurify allowlist: p,br,strong,em,b,i,ul,ol,li; no attributes).
- `src/features/resume/useResume.ts` — `useResumeState(): ResumeState` (`.committed` is the `Resume`), `useResumeDispatch()`.
- `src/features/resume/ResumeProvider.tsx` — `ResumeProvider({persistence, children})`.
- `src/lib/persistence/InMemoryPersistence.ts` — `InMemoryPersistence` (test double).
- `src/App.tsx` — the preview pane is currently `<section aria-label="Preview" className="preview-pane" />` (empty).

---

### Task 1: Render layer — ATS template, page CSS, and HTML serializer

**Files:**
- Create: `src/features/render/AtsTemplate.tsx`
- Create: `src/features/render/pageStyles.ts`
- Create: `src/features/render/renderResumeHtml.ts`
- Test: `src/features/render/renderResumeHtml.test.ts`, `src/features/render/pageStyles.test.ts`

**Interfaces:**
- Consumes: `Resume` (schema), `sanitizeHtml`, `react-dom/server`.
- Produces:
  - `AtsTemplate({ resume }: { resume: Resume }): JSX.Element` — single-column ATS template.
  - `pageStyles: string` — the @page + typography CSS.
  - `renderResumeHtml(resume: Resume): string` — static HTML for Paged.js.

- [ ] **Step 1: Write failing tests for the serializer**

Create `src/features/render/renderResumeHtml.test.ts`:
```ts
import { renderResumeHtml } from "./renderResumeHtml";
import { emptyResume } from "../../lib/schema/resume";

test("renders header, sections, and rich text for a populated resume", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { name: "Ada Lovelace", title: "Engineer", email: "a@x.com", phone: "", location: "London" },
    summary: { text: "<p>Builder of engines</p>" },
    experience: [
      { id: "e1", company: "Analytical", role: "Lead", startDate: "1843", endDate: "", current: true, location: "", description: "<ul><li>Notes</li></ul>" },
    ],
    skills: [{ id: "s1", name: "Mathematics" }],
  });
  expect(html).toContain("Ada Lovelace");
  expect(html).toContain("Engineer");
  expect(html).toContain("Builder of engines");
  expect(html).toContain("<li>Notes</li>");
  expect(html).toContain("Mathematics");
  expect(html).toContain("Experience");
});

test("escapes plain-text fields (no raw HTML injection)", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { name: "<script>alert(1)</script>", title: "", email: "", phone: "", location: "" },
  });
  expect(html).not.toContain("<script>alert(1)</script>");
  expect(html).toContain("&lt;script&gt;");
});

test("sanitizes rich text at render even if committed HTML is unsafe", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    summary: { text: '<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)">' },
  });
  expect(html).toContain("<p>ok</p>");
  expect(html).not.toContain("script");
  expect(html).not.toContain("onerror");
});

test("omits empty sections", () => {
  const html = renderResumeHtml(emptyResume());
  expect(html).not.toContain("Experience");
  expect(html).not.toContain("Summary");
  expect(html).not.toContain("Skills");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- renderResumeHtml`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the template**

Create `src/features/render/AtsTemplate.tsx`:
```tsx
import { sanitizeHtml } from "../../lib/sanitizeHtml";
import type { Resume } from "../../lib/schema/resume";

// Rich text is sanitized here (render time) as defense-in-depth: data imported
// via REPLACE_ALL can reach committed state without passing the editor's
// Save-time sanitizer.
function RichText({ html }: { html: string }) {
  return <div className="resume-rich" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

function join(parts: readonly string[], sep: string): string {
  return parts.filter((p) => p.length > 0).join(sep);
}

export function AtsTemplate({ resume }: { resume: Resume }) {
  const { contact, summary, experience, education, skills, projects, certifications, languages, links } = resume;
  const contactLine = join([contact.email, contact.phone, contact.location], " · ");
  const linkLine = join(links.map((l) => (l.label.length > 0 ? l.label : l.url)), " · ");

  return (
    <article className="resume-root">
      <header className="resume-header">
        {contact.name.length > 0 ? <h1 className="resume-name">{contact.name}</h1> : null}
        {contact.title.length > 0 ? <p className="resume-title">{contact.title}</p> : null}
        {contactLine.length > 0 ? <p className="resume-contact">{contactLine}</p> : null}
        {linkLine.length > 0 ? <p className="resume-links">{linkLine}</p> : null}
      </header>

      {summary.text.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Summary</h2>
          <RichText html={summary.text} />
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {experience.map((e) => (
            <div key={e.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">{join([e.role, e.company], " — ")}</span>
                <span className="resume-entry-dates">{join([e.startDate, e.current ? "Present" : e.endDate], " – ")}</span>
              </div>
              {e.location.length > 0 ? <div className="resume-entry-sub">{e.location}</div> : null}
              <RichText html={e.description} />
            </div>
          ))}
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.map((ed) => (
            <div key={ed.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">{join([ed.degree, ed.field], ", ").length > 0 ? join([ed.degree, ed.field], ", ") : ed.institution}</span>
                <span className="resume-entry-dates">{join([ed.startDate, ed.endDate], " – ")}</span>
              </div>
              {ed.institution.length > 0 ? <div className="resume-entry-sub">{ed.institution}</div> : null}
              <RichText html={ed.description} />
            </div>
          ))}
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">{p.name}</span>
                {p.url.length > 0 ? <span className="resume-entry-dates">{p.url}</span> : null}
              </div>
              <RichText html={p.description} />
            </div>
          ))}
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <p className="resume-inline-list">{join(skills.map((s) => s.name), " · ")}</p>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.map((c) => (
            <div key={c.id} className="resume-entry">
              <span className="resume-entry-title">{c.name}</span>
              {join([c.issuer, c.date], ", ").length > 0 ? (
                <span className="resume-entry-sub"> — {join([c.issuer, c.date], ", ")}</span>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {languages.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Languages</h2>
          <p className="resume-inline-list">
            {join(languages.map((l) => (l.proficiency.length > 0 ? `${l.name} (${l.proficiency})` : l.name)), " · ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 4: Implement the page CSS**

Create `src/features/render/pageStyles.ts`:
```ts
// Page + typography CSS handed to Paged.js (inline stylesheet) and reused by
// the print/export path in a later plan. Clean modern sans, A4, page numbers,
// and break-inside:avoid so an entry is not split across a page boundary.
export const pageStyles = `
@page {
  size: A4;
  margin: 18mm 16mm;
  @bottom-center { content: counter(page); font-size: 9pt; color: #666; }
}
.resume-root {
  font-family: Arial, Helvetica, "Segoe UI", sans-serif;
  color: #1a1a1a;
  font-size: 10.5pt;
  line-height: 1.45;
}
.resume-name { font-size: 20pt; margin: 0 0 2pt; }
.resume-title { font-size: 11pt; color: #444; margin: 0 0 4pt; }
.resume-contact, .resume-links { font-size: 9.5pt; color: #444; margin: 0; }
.resume-section { margin-top: 12pt; }
.resume-section-title {
  font-size: 11pt; text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid #cccccc; padding-bottom: 2pt; margin: 0 0 6pt;
}
.resume-entry { break-inside: avoid; margin-bottom: 8pt; }
.resume-entry-head { display: flex; justify-content: space-between; gap: 8pt; }
.resume-entry-title { font-weight: 700; }
.resume-entry-dates { color: #666; white-space: nowrap; font-size: 9.5pt; }
.resume-entry-sub { color: #444; font-size: 9.5pt; }
.resume-rich { margin: 2pt 0 0; }
.resume-rich ul, .resume-rich ol { margin: 2pt 0; padding-left: 16pt; }
.resume-inline-list { margin: 0; }
`;
```

- [ ] **Step 5: Implement the serializer**

Create `src/features/render/renderResumeHtml.ts`:
```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AtsTemplate } from "./AtsTemplate";
import type { Resume } from "../../lib/schema/resume";

// Only the ATS (T1) template exists; the "designed" (T2) template is Plan 4 and
// falls back to ATS until then. Both branches currently render AtsTemplate.
export function renderResumeHtml(resume: Resume): string {
  return renderToStaticMarkup(createElement(AtsTemplate, { resume }));
}
```

- [ ] **Step 6: Write the page-styles test**

Create `src/features/render/pageStyles.test.ts`:
```ts
import { pageStyles } from "./pageStyles";

test("declares A4 page, avoids breaking entries, and numbers pages", () => {
  expect(pageStyles).toContain("size: A4");
  expect(pageStyles).toContain("break-inside: avoid");
  expect(pageStyles).toContain("counter(page)");
});
```

- [ ] **Step 7: Run tests to verify they pass, then the full suite**

Run: `npm test -- "renderResumeHtml|pageStyles"` → Expected: PASS.
Run: `npm test` → Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add src/features/render
git commit -m "feat: add ATS resume template, page CSS, and HTML serializer"
# end the message with the trailer from Global Constraints (blank line before it)
```

---

### Task 2: Preview pane with Paged.js pagination

**Files:**
- Create: `src/features/preview/Preview.tsx`
- Test: `src/features/preview/Preview.test.tsx`

**Interfaces:**
- Consumes: `useResumeState`, `renderResumeHtml`, `pageStyles`, `pagedjs`.
- Produces: `Preview(): JSX.Element` — renders the committed resume via Paged.js into a scaled, scrollable container; re-renders on committed change.

- [ ] **Step 1: Install Paged.js**

Run: `npm install pagedjs`

- [ ] **Step 2: Write the failing test (Paged.js mocked)**

Create `src/features/preview/Preview.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Preview } from "./Preview";
import { ResumeProvider } from "../resume/ResumeProvider";
import { useResumeDispatch } from "../resume/useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";
import { pageStyles } from "../render/pageStyles";

// Paged.js needs real layout (unavailable in jsdom); mock it and assert our
// integration passes the right content + stylesheets. Real pagination is a
// manual/Playwright concern.
const { previewMock } = vi.hoisted(() => ({ previewMock: vi.fn() }));
vi.mock("pagedjs", () => ({ Previewer: vi.fn(() => ({ preview: previewMock })) }));

beforeEach(() => {
  previewMock.mockReset();
  previewMock.mockResolvedValue({ total: 1 });
});

function Rename() {
  const dispatch = useResumeDispatch();
  return (
    <button
      onClick={() =>
        dispatch({ type: "SET_CONTACT", contact: { name: "Grace Hopper", title: "", email: "", phone: "", location: "" } })
      }
    >
      rename
    </button>
  );
}

test("renders the committed resume through Paged.js with the page styles", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), contact: { name: "Ada Lovelace", title: "", email: "", phone: "", location: "" } });
  render(
    <ResumeProvider persistence={persistence}>
      <Preview />
    </ResumeProvider>,
  );
  expect(previewMock).toHaveBeenCalledWith(
    expect.stringContaining("Ada Lovelace"),
    [{ "resume-page": pageStyles }],
    expect.anything(),
  );
});

test("re-renders the preview when committed state changes", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
      <Rename />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByText("rename"));
  expect(previewMock).toHaveBeenCalledWith(
    expect.stringContaining("Grace Hopper"),
    [{ "resume-page": pageStyles }],
    expect.anything(),
  );
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- Preview`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the Preview component**

Create `src/features/preview/Preview.tsx`:
```tsx
import { useEffect, useRef, useState } from "react";
import { Previewer } from "pagedjs";
import { useResumeState } from "../resume/useResume";
import { renderResumeHtml } from "../render/renderResumeHtml";
import { pageStyles } from "../render/pageStyles";

// A4 width at 96dpi (210mm) — used to scale the rendered page to fit the pane.
const PAGE_WIDTH_PX = 794;

export function Preview() {
  const resume = useResumeState().committed;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Re-paginate whenever the committed resume changes.
  useEffect(() => {
    const container = pagesRef.current;
    if (container === null) return;
    container.innerHTML = "";
    const previewer = new Previewer();
    void previewer
      .preview(renderResumeHtml(resume), [{ "resume-page": pageStyles }], container)
      .catch((error: unknown) => {
        console.error("Preview pagination failed", error);
      });
  }, [resume]);

  // Fit the A4 page width to the available pane width.
  useEffect(() => {
    const fit = () => {
      const scroll = scrollRef.current;
      if (scroll === null) return;
      const width = scroll.clientWidth;
      if (width > 0) setScale(Math.min(1, width / PAGE_WIDTH_PX));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div ref={scrollRef} className="preview-scroll" style={{ overflow: "auto", height: "100%" }}>
      <div
        ref={pagesRef}
        className="preview-pages"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes, then the full suite**

Run: `npm test -- Preview` → Expected: PASS (2 tests), output pristine.
Run: `npm test` → Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/features/preview package.json package-lock.json
git commit -m "feat: add Paged.js preview pane that re-renders on save"
# end the message with the trailer from Global Constraints (blank line before it)
```

---

### Task 3: Mount the preview in the app shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: `Preview`.
- Produces: App renders `<Preview />` inside the Preview pane; both panes remain.

- [ ] **Step 1: Update the App test (Paged.js mocked) — write it first**

Replace `src/App.test.tsx` with:
```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

// App now mounts Preview, which loads Paged.js; mock it so the smoke test stays
// pristine and free of jsdom layout errors.
vi.mock("pagedjs", () => ({ Previewer: vi.fn(() => ({ preview: vi.fn().mockResolvedValue({ total: 1 }) })) }));

test("renders editor and preview panes", () => {
  render(<App />);
  expect(screen.getByRole("region", { name: "Editor" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify it still describes the desired behavior**

Run: `npm test -- App`
Expected: PASS already for the two regions (Preview not yet mounted), but the `pagedjs` mock is now in place. (If it passes, that is fine — Step 3 adds the Preview mount; re-run in Step 4.)

- [ ] **Step 3: Mount Preview in App**

Modify `src/App.tsx` — render `<Preview />` inside the Preview pane:
```tsx
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";
import { Editor } from "./features/editor/Editor";
import { Preview } from "./features/preview/Preview";

const persistence = new LocalStoragePersistence();

export default function App() {
  return (
    <ResumeProvider persistence={persistence}>
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane">
          <Editor />
        </section>
        <section aria-label="Preview" className="preview-pane">
          <Preview />
        </section>
      </main>
    </ResumeProvider>
  );
}
```

- [ ] **Step 4: Run App test, full suite, lint, and build**

Run: `npm test -- App` → Expected: PASS, pristine (no console.error from Paged.js — it is mocked).
Run: `npm test` → Expected: all green.
Run: `npm run lint && npm run build` → Expected: clean; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: mount live preview pane in the app shell"
# end the message with the trailer from Global Constraints (blank line before it)
```

---

## Self-Review

**Spec coverage (S7, S8, S9):**
- S7 (T1 ATS template render): Task 1 — `AtsTemplate` renders all nine sections single-column, clean sans, selectable text; `renderResumeHtml` serializes it; empty sections omitted.
- S8 (automatic A4 pagination): Task 1 `pageStyles` (@page A4, `break-inside: avoid`, page-number counter) + Task 2 Paged.js `Previewer.preview` fragmenting into pages — zero manual page-break math.
- S9 (live preview): Task 2 `Preview` renders the actual Paged.js DOM, regenerating on committed change (Save/Delete/template switch), scaled to fit; Task 3 mounts it. Matches export later because the same HTML+CSS drives native print (Plan 4).
- Carry-forward folded in: render-time `sanitizeHtml` on all rich fields (defense-in-depth for the `REPLACE_ALL`/import boundary, per memory `foundation-deferred-findings`).
- Correctly out of scope: PDF export/native print (S12), T2 (S10), template switcher (S11), import/export (S13), edge-case pass (S14).

**Placeholder scan:** none — every code step has complete, runnable code; the only prose-in-step is the commit-trailer reminder pointing at Global Constraints.

**Type consistency:** `renderResumeHtml(resume: Resume): string` (Task 1) is consumed unchanged in Task 2. `pageStyles: string` (Task 1) is passed as `[{ "resume-page": pageStyles }]` in Task 2 and asserted identically in the Preview test. `Preview` (Task 2) is imported unchanged in Task 3. Paged.js `preview(content, stylesheets, renderTo)` signature is used consistently (string, inline-CSS array, element). All schema field names match `src/lib/schema/resume.ts`.

**Testing-boundary note:** Paged.js (like TipTap) is not driven in jsdom — `Previewer` is mocked in the Preview and App tests, and the integration is verified by asserting the content/stylesheets passed to it. The security-critical render-time sanitization is verified by pure `renderResumeHtml` string tests, independent of Paged.js. Real pagination fidelity is a manual/Playwright check.

## Next plan (write when this lands)
- **Plan 4 — Export, portability, T2, polish (S12, S13, S10, S11, S14):** native print-to-PDF reusing `pageStyles`; JSON import/export (import mapper MUST sanitize rich fields before `REPLACE_ALL` — see `[[foundation-deferred-findings]]`); T2 two-column template (needs the SP-2 pagination spike) plugged into `renderResumeHtml`'s template switch; template switcher UI; edge-case/error pass. When whole-editor/preview tests query across sections, scope with RTL `within(section)` (duplicate accessible names are intentional).
```
