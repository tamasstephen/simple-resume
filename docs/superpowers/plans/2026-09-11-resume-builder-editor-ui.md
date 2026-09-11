# Resume Builder — Editor UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the left-pane editor: a save-based form UI where the user fills fields and clicks Save to commit entries, edits/deletes saved entries, and writes rich-text descriptions — covering all nine resume sections, with no visible preview yet.

**Architecture:** Editing is **save-based**: each form holds its own local draft (component state); typing never touches committed state, so it never touches the (future) preview. Only Save/Delete dispatch reducer actions. A generic `useSectionDraft` hook owns draft lifecycle; a generic `SectionEditor` shell owns the list + buttons UI; each section component wires them and dispatches `SAVE_ITEM`/`DELETE_ITEM` with a **literal** section string (realizing Plan 1's compile-time section↔item safety). Rich text is a TipTap field; its HTML is sanitized with DOMPurify at the save boundary before it enters committed state.

**Tech Stack:** React + TS, TipTap (`@tiptap/react` + `@tiptap/starter-kit`), DOMPurify, Vitest + React Testing Library.

**Spec:** `docs/PRD.md` and `docs/STORIES.md` (stories S3-UI, S4, S5, S6). Foundation plan: `docs/superpowers/plans/2026-09-10-resume-builder-foundation.md`.

## Global Constraints

- TypeScript `strict` incl. `noUncheckedIndexedAccess`. NO `any`; NO `as` casts; NO `@ts-ignore` in production (a `// @ts-expect-error` is allowed in a test only when the test's purpose is to assert a wrong call fails to compile).
- Save-based editing: typing into any form field MUST NOT dispatch or change committed state. Only Save (and Delete) mutate committed state.
- Dispatch sites for `SAVE_ITEM`/`DELETE_ITEM` MUST use a **literal** section string (e.g. `section: "experience"`), never a generic variable — this is what makes the item type-check against the section.
- Rich-text HTML (Experience/Education/Projects `description`, Summary `text`) MUST be sanitized with `sanitizeHtml` at the save boundary before dispatch. DOMPurify allowlist: tags `p, br, strong, em, b, i, ul, ol, li`; attributes: none.
- Persistence is reached only through the existing `PersistenceProvider`/`ResumeProvider`; components use the resume hooks, never `localStorage` directly.
- Reducer action shapes are fixed (from Plan 1): `SAVE_ITEM {section,item}`, `DELETE_ITEM {section,id}`, `SET_CONTACT {contact}`, `SET_SUMMARY {summary}`, `SELECT_TEMPLATE {template}`, `REPLACE_ALL {resume}`. Do not change them.
- Out of scope (later plans): drag-reorder, template switcher UI (S11), rendering/preview (S7–S9), export (S12), JSON import/export (S13), custom sections.
- Commit with Conventional Commit messages. End EVERY commit message with this two-line trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01V3g4wk6WvZyFWkXAxzo7pp
  ```

## Existing interfaces this plan builds on (from Plan 1, verified)

- `src/lib/schema/resume.ts` — `Resume`, `emptyResume()`, `Template`, and item types: `ContactHeader {name,title,email,phone,location}`, `Summary {text}`, `ExperienceItem {id,company,role,startDate,endDate,current,location,description}`, `EducationItem {id,institution,degree,field,startDate,endDate,description}`, `SkillItem {id,name}`, `ProjectItem {id,name,url,description}`, `CertificationItem {id,name,issuer,date}`, `LanguageItem {id,name,proficiency}`, `LinkItem {id,label,url}`.
- `src/lib/store/resumeReducer.ts` — `resumeReducer`, `initialState`, `ResumeState {committed: Resume}`, `ResumeAction`.
- `src/lib/store/repeatableSections.ts` — `RepeatableSection`, `REPEATABLE_SECTIONS`.
- `src/features/resume/ResumeProvider.tsx` — `ResumeProvider({persistence, children})`.
- `src/features/resume/useResume.ts` — CURRENTLY exports `ResumeContext`, `ResumeContextValue`, `useResume()`. **Task 1 replaces this API.**
- `src/lib/persistence/InMemoryPersistence.ts` — `InMemoryPersistence` (test double).

---

### Task 1: Split resume context into state + dispatch

Rationale: the foundation review flagged that a single `{state, dispatch}` context re-renders all consumers on every commit once many forms + preview subscribe. Split now, before the forms land. `dispatch` from `useReducer` is referentially stable, so dispatch-only components won't re-render on state changes.

**Files:**
- Modify: `src/features/resume/useResume.ts` (replace API)
- Modify: `src/features/resume/ResumeProvider.tsx`
- Modify: `src/features/resume/ResumeProvider.test.tsx`

**Interfaces:**
- Consumes: `ResumeState`, `ResumeAction` from `resumeReducer`.
- Produces:
  - `ResumeStateContext: Context<ResumeState | null>`
  - `ResumeDispatchContext: Context<Dispatch<ResumeAction> | null>`
  - `useResumeState(): ResumeState` — throws (message mentions `ResumeProvider`) outside provider.
  - `useResumeDispatch(): Dispatch<ResumeAction>` — throws (message mentions `ResumeProvider`) outside provider.
  - `useResume` and `ResumeContext` are REMOVED.

- [ ] **Step 1: Update the provider test to the new API (write failing test)**

Replace the whole body of `src/features/resume/ResumeProvider.test.tsx`:
```tsx
import { render, screen, act } from "@testing-library/react";
import { ResumeProvider } from "./ResumeProvider";
import { useResumeState, useResumeDispatch } from "./useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";

function Probe() {
  const state = useResumeState();
  const dispatch = useResumeDispatch();
  return (
    <div>
      <span data-testid="skills">{state.committed.skills.length}</span>
      <button
        onClick={() =>
          dispatch({ type: "SAVE_ITEM", section: "skills", item: { id: "s1", name: "TS" } })
        }
      >
        add
      </button>
    </div>
  );
}

test("loads initial state from persistence", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), skills: [{ id: "seed", name: "Go" }] });
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  expect(screen.getByTestId("skills").textContent).toBe("1");
});

test("auto-saves committed changes to persistence", () => {
  const persistence = new InMemoryPersistence();
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  act(() => {
    screen.getByText("add").click();
  });
  expect(persistence.load()?.skills).toHaveLength(1);
});

test("useResumeState throws outside a provider", () => {
  function Orphan() {
    useResumeState();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});

test("useResumeDispatch throws outside a provider", () => {
  function Orphan() {
    useResumeDispatch();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ResumeProvider`
Expected: FAIL — `useResumeState`/`useResumeDispatch` not exported.

- [ ] **Step 3: Rewrite the context module**

Replace `src/features/resume/useResume.ts` entirely:
```ts
import { createContext, useContext, type Dispatch } from "react";
import type { ResumeState, ResumeAction } from "../../lib/store/resumeReducer";

export const ResumeStateContext = createContext<ResumeState | null>(null);
export const ResumeDispatchContext = createContext<Dispatch<ResumeAction> | null>(null);

export function useResumeState(): ResumeState {
  const state = useContext(ResumeStateContext);
  if (state === null) {
    throw new Error("useResumeState must be used within a ResumeProvider");
  }
  return state;
}

export function useResumeDispatch(): Dispatch<ResumeAction> {
  const dispatch = useContext(ResumeDispatchContext);
  if (dispatch === null) {
    throw new Error("useResumeDispatch must be used within a ResumeProvider");
  }
  return dispatch;
}
```

- [ ] **Step 4: Update the provider to supply both contexts**

Replace the `return` in `src/features/resume/ResumeProvider.tsx` and its import from `./useResume`:
```tsx
import { ResumeStateContext, ResumeDispatchContext } from "./useResume";
```
```tsx
  return (
    <ResumeStateContext.Provider value={state}>
      <ResumeDispatchContext.Provider value={dispatch}>
        {children}
      </ResumeDispatchContext.Provider>
    </ResumeStateContext.Provider>
  );
```
(Leave the `useReducer` and auto-save `useEffect` exactly as they are.)

- [ ] **Step 5: Run the test to verify it passes, then the full suite**

Run: `npm test -- ResumeProvider` → Expected: PASS (4 tests).
Run: `npm test` → Expected: all green (App smoke test unaffected).

- [ ] **Step 6: Commit**

```bash
git add src/features/resume
git commit -m "refactor: split resume context into state and dispatch contexts"
# end the message with the trailer from Global Constraints
```

---

### Task 2: id and HTML-sanitize utilities

**Files:**
- Create: `src/lib/id.ts`
- Create: `src/lib/sanitizeHtml.ts`
- Test: `src/lib/id.test.ts`, `src/lib/sanitizeHtml.test.ts`

**Interfaces:**
- Consumes: `dompurify`.
- Produces:
  - `newId(): string` — a unique id for new items.
  - `sanitizeHtml(dirty: string): string` — returns HTML containing only the allowlisted tags, no attributes.

- [ ] **Step 1: Install DOMPurify**

Run: `npm install dompurify`
(DOMPurify v3 ships its own types; no `@types/dompurify` needed.)

- [ ] **Step 2: Write failing tests**

Create `src/lib/id.test.ts`:
```ts
import { newId } from "./id";

test("newId returns a non-empty string", () => {
  expect(newId().length).toBeGreaterThan(0);
});

test("newId returns distinct values", () => {
  expect(newId()).not.toBe(newId());
});
```

Create `src/lib/sanitizeHtml.test.ts`:
```ts
import { sanitizeHtml } from "./sanitizeHtml";

test("keeps allowlisted formatting tags", () => {
  const out = sanitizeHtml("<p>Hello <strong>world</strong></p><ul><li>a</li></ul>");
  expect(out).toContain("<strong>world</strong>");
  expect(out).toContain("<li>a</li>");
});

test("strips script tags", () => {
  const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
  expect(out).not.toContain("script");
  expect(out).toContain("<p>ok</p>");
});

test("strips event-handler and other attributes", () => {
  const out = sanitizeHtml('<p onclick="alert(1)" class="x">hi</p>');
  expect(out).not.toContain("onclick");
  expect(out).not.toContain("class");
  expect(out).toContain("hi");
});

test("strips disallowed tags like img but keeps text", () => {
  const out = sanitizeHtml('<img src=x onerror="alert(1)"><em>note</em>');
  expect(out).not.toContain("<img");
  expect(out).toContain("<em>note</em>");
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- "id|sanitizeHtml"`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement the utilities**

Create `src/lib/id.ts`:
```ts
/** Generates a unique identifier for a new resume item. */
export function newId(): string {
  return crypto.randomUUID();
}
```

Create `src/lib/sanitizeHtml.ts`:
```ts
import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li"];

/**
 * Sanitizes rich-text HTML down to the small formatting subset the resume
 * builder supports (bold/italic/lists). Strips scripts, event handlers, and
 * all attributes — the boundary defense against stored XSS before HTML ever
 * enters committed state.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- "id|sanitizeHtml"`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/id.ts src/lib/id.test.ts src/lib/sanitizeHtml.ts src/lib/sanitizeHtml.test.ts package.json package-lock.json
git commit -m "feat: add id generator and DOMPurify HTML sanitizer"
# end the message with the trailer from Global Constraints
```

---

### Task 3: `useSectionDraft` — generic draft lifecycle hook

The save-based core (S3-UI). Owns the in-progress draft as local state. Knows nothing about persistence, dispatch, or sections — so it is trivially testable and reusable.

**Files:**
- Create: `src/features/editor/useSectionDraft.ts`
- Test: `src/features/editor/useSectionDraft.test.ts`

**Interfaces:**
- Consumes: React `useState`.
- Produces:
  ```ts
  interface SectionDraftApi<T> {
    draft: T | null;          // null = no form open
    isEditing: boolean;       // true when editing an existing item
    startAdd(): void;         // open a fresh draft (isEditing=false)
    startEdit(item: T): void; // open a copy of an existing item (isEditing=true)
    updateDraft(patch: Partial<T>): void;
    cancel(): void;           // discard draft
  }
  function useSectionDraft<T>(makeEmpty: () => T): SectionDraftApi<T>
  ```

- [ ] **Step 1: Write failing tests**

Create `src/features/editor/useSectionDraft.test.ts`:
```ts
import { act, renderHook } from "@testing-library/react";
import { useSectionDraft } from "./useSectionDraft";

interface Foo {
  id: string;
  name: string;
}
const makeEmpty = (): Foo => ({ id: "new", name: "" });

test("starts with no draft", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  expect(result.current.draft).toBeNull();
  expect(result.current.isEditing).toBe(false);
});

test("startAdd opens a fresh draft (not editing)", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  expect(result.current.draft).toEqual({ id: "new", name: "" });
  expect(result.current.isEditing).toBe(false);
});

test("startEdit opens a copy of the item (editing) without aliasing", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  const item: Foo = { id: "1", name: "Ada" };
  act(() => result.current.startEdit(item));
  expect(result.current.draft).toEqual(item);
  expect(result.current.draft).not.toBe(item);
  expect(result.current.isEditing).toBe(true);
});

test("updateDraft merges a patch", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  act(() => result.current.updateDraft({ name: "Grace" }));
  expect(result.current.draft).toEqual({ id: "new", name: "Grace" });
});

test("updateDraft is a no-op when no draft is open", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.updateDraft({ name: "x" }));
  expect(result.current.draft).toBeNull();
});

test("cancel discards the draft", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  act(() => result.current.cancel());
  expect(result.current.draft).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- useSectionDraft`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the hook**

Create `src/features/editor/useSectionDraft.ts`:
```ts
import { useCallback, useState } from "react";

export interface SectionDraftApi<T> {
  draft: T | null;
  isEditing: boolean;
  startAdd(): void;
  startEdit(item: T): void;
  updateDraft(patch: Partial<T>): void;
  cancel(): void;
}

/**
 * Owns the in-progress draft for one section's form. The draft lives in local
 * state and is never committed here — the caller commits on Save. This is what
 * keeps typing from touching committed state (and the preview).
 */
export function useSectionDraft<T>(makeEmpty: () => T): SectionDraftApi<T> {
  const [draft, setDraft] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const startAdd = useCallback(() => {
    setDraft(makeEmpty());
    setIsEditing(false);
  }, [makeEmpty]);

  const startEdit = useCallback((item: T) => {
    setDraft({ ...item });
    setIsEditing(true);
  }, []);

  const updateDraft = useCallback((patch: Partial<T>) => {
    setDraft((current) => (current === null ? current : { ...current, ...patch }));
  }, []);

  const cancel = useCallback(() => {
    setDraft(null);
    setIsEditing(false);
  }, []);

  return { draft, isEditing, startAdd, startEdit, updateDraft, cancel };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- useSectionDraft`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/useSectionDraft.ts src/features/editor/useSectionDraft.test.ts
git commit -m "feat: add useSectionDraft hook for save-based draft lifecycle"
# end the message with the trailer from Global Constraints
```

---

### Task 4: `SectionEditor` — generic list + form shell

Presentational shell (S3-UI UI half): renders the saved-items list with Edit/Delete, an Add button, and — when a draft is open — the form (via a render prop) with Save/Cancel. Holds no state; all behavior comes from props.

**Files:**
- Create: `src/features/editor/SectionEditor.tsx`
- Test: `src/features/editor/SectionEditor.test.tsx`

**Interfaces:**
- Consumes: `SectionDraftApi` shape (draft/isEditing) conceptually, but takes primitives as props.
- Produces:
  ```ts
  interface SectionEditorProps<T extends { id: string }> {
    title: string;
    items: readonly T[];
    draft: T | null;
    isEditing: boolean;
    canSave: boolean;
    renderSummary: (item: T) => ReactNode;
    renderForm: () => ReactNode;
    onAdd: () => void;
    onEditItem: (item: T) => void;
    onDeleteItem: (id: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }
  function SectionEditor<T extends { id: string }>(props: SectionEditorProps<T>): JSX.Element
  ```

- [ ] **Step 1: Write failing tests**

Create `src/features/editor/SectionEditor.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionEditor } from "./SectionEditor";

interface Foo {
  id: string;
  name: string;
}

function setup(overrides: Partial<React.ComponentProps<typeof SectionEditor<Foo>>> = {}) {
  const handlers = {
    onAdd: vi.fn(),
    onEditItem: vi.fn(),
    onDeleteItem: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };
  render(
    <SectionEditor<Foo>
      title="Skills"
      items={[{ id: "1", name: "TS" }]}
      draft={null}
      isEditing={false}
      canSave={true}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => <input aria-label="name" />}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

test("renders the section title and saved items", () => {
  setup();
  expect(screen.getByRole("heading", { name: "Skills" })).toBeInTheDocument();
  expect(screen.getByText("TS")).toBeInTheDocument();
});

test("Add triggers onAdd", async () => {
  const h = setup();
  await userEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(h.onAdd).toHaveBeenCalledOnce();
});

test("Edit and Delete on a row trigger their handlers", async () => {
  const h = setup();
  await userEvent.click(screen.getByRole("button", { name: /edit/i }));
  expect(h.onEditItem).toHaveBeenCalledWith({ id: "1", name: "TS" });
  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  expect(h.onDeleteItem).toHaveBeenCalledWith("1");
});

test("shows the form and Save/Cancel when a draft is open", async () => {
  const h = setup({ draft: { id: "new", name: "" } });
  expect(screen.getByLabelText("name")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(h.onSave).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(h.onCancel).toHaveBeenCalledOnce();
});

test("Save is disabled when canSave is false", () => {
  setup({ draft: { id: "new", name: "" }, canSave: false });
  expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
});

test("does not show the Add button while a draft is open", () => {
  setup({ draft: { id: "new", name: "" } });
  expect(screen.queryByRole("button", { name: /^add/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- SectionEditor`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the shell**

Create `src/features/editor/SectionEditor.tsx`:
```tsx
import type { ReactNode } from "react";

export interface SectionEditorProps<T extends { id: string }> {
  title: string;
  items: readonly T[];
  draft: T | null;
  isEditing: boolean;
  canSave: boolean;
  renderSummary: (item: T) => ReactNode;
  renderForm: () => ReactNode;
  onAdd: () => void;
  onEditItem: (item: T) => void;
  onDeleteItem: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Generic save-based section shell: saved-items list + add/edit/delete + draft form. */
export function SectionEditor<T extends { id: string }>({
  title,
  items,
  draft,
  isEditing,
  canSave,
  renderSummary,
  renderForm,
  onAdd,
  onEditItem,
  onDeleteItem,
  onSave,
  onCancel,
}: SectionEditorProps<T>) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {renderSummary(item)}
            <button type="button" onClick={() => onEditItem(item)}>
              Edit
            </button>
            <button type="button" onClick={() => onDeleteItem(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {draft === null ? (
        <button type="button" onClick={onAdd}>
          Add {title}
        </button>
      ) : (
        <div>
          {renderForm()}
          <button type="button" onClick={onSave} disabled={!canSave}>
            {isEditing ? "Save changes" : "Save"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- SectionEditor`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/SectionEditor.tsx src/features/editor/SectionEditor.test.tsx
git commit -m "feat: add generic SectionEditor list/form shell"
# end the message with the trailer from Global Constraints
```

---

### Task 5: `RichTextField` — TipTap bold/italic/list editor

**Files:**
- Create: `src/features/editor/RichTextField.tsx`
- Test: `src/features/editor/RichTextField.test.tsx`

**Interfaces:**
- Consumes: `@tiptap/react`, `@tiptap/starter-kit`.
- Produces:
  ```ts
  interface RichTextFieldProps {
    value: string;                       // HTML
    onChange: (html: string) => void;
    ariaLabel: string;
  }
  function RichTextField(props: RichTextFieldProps): JSX.Element
  ```
- Note: TipTap/ProseMirror is heavy to drive in jsdom; this task's test is a mount smoke test (toolbar buttons + an editable region render). Rich-text *sanitization* is proven separately by pure functions in Task 6, and end-to-end typing is a Plan 3 manual/Playwright concern. This is the pragmatic testing boundary for a third-party contenteditable engine.

- [ ] **Step 1: Install TipTap**

Run: `npm install @tiptap/react @tiptap/starter-kit @tiptap/pm`

- [ ] **Step 2: Write the failing smoke test**

Create `src/features/editor/RichTextField.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { RichTextField } from "./RichTextField";

test("renders a labelled editor with formatting toolbar buttons", () => {
  render(<RichTextField value="<p>hi</p>" onChange={() => {}} ariaLabel="Description" />);
  expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /bullet list/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /numbered list/i })).toBeInTheDocument();
  expect(screen.getByLabelText("Description")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- RichTextField`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the component**

Create `src/features/editor/RichTextField.tsx`:
```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export interface RichTextFieldProps {
  value: string;
  onChange: (html: string) => void;
  ariaLabel: string;
}

// Trim StarterKit to the supported subset: bold, italic, bullet/ordered lists.
const starterKit = StarterKit.configure({
  heading: false,
  blockquote: false,
  codeBlock: false,
  code: false,
  horizontalRule: false,
  strike: false,
});

/** Rich-text field limited to bold/italic/lists; emits HTML via onChange. */
export function RichTextField({ value, onChange, ariaLabel }: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [starterKit],
    content: value,
    editorProps: { attributes: { "aria-label": ariaLabel, role: "textbox" } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Keep the editor in sync when the value is reset externally (e.g. Cancel,
  // switching which item is being edited).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return <div aria-label={ariaLabel} role="textbox" />;

  return (
    <div>
      <div role="toolbar" aria-label={`${ariaLabel} formatting`}>
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          aria-pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- RichTextField`
Expected: PASS. If jsdom raises a ProseMirror layout error on mount, add `immediatelyRender: false` to the `useEditor` options and re-run; do not weaken the assertions. If it still cannot mount in jsdom, report DONE_WITH_CONCERNS describing the exact error rather than deleting the test.

- [ ] **Step 6: Commit**

```bash
git add src/features/editor/RichTextField.tsx src/features/editor/RichTextField.test.tsx package.json package-lock.json
git commit -m "feat: add TipTap rich-text field limited to bold/italic/lists"
# end the message with the trailer from Global Constraints
```

---

### Task 6: Rich-text sanitize mappers + Contact & Summary forms (S4)

Singleton sections. Contact/Summary are single objects (not lists): the form shows current values, the user edits locally, Save commits via `SET_CONTACT`/`SET_SUMMARY`. Summary sanitizes its HTML at the save boundary. The sanitize mapping is a pure, directly-tested function (no TipTap needed to prove XSS defense).

**Files:**
- Create: `src/features/editor/sanitizeFields.ts`
- Create: `src/features/editor/sections/ContactForm.tsx`
- Create: `src/features/editor/sections/SummaryForm.tsx`
- Test: `src/features/editor/sanitizeFields.test.ts`, `src/features/editor/sections/ContactForm.test.tsx`, `src/features/editor/sections/SummaryForm.test.tsx`

**Interfaces:**
- Consumes: `sanitizeHtml` (Task 2), `useResumeState`/`useResumeDispatch` (Task 1), `Summary`, `ContactHeader` (schema).
- Produces:
  - `sanitizeDescription<T extends { description: string }>(item: T): T`
  - `sanitizeSummaryText(text: string): Summary`
  - `ContactForm()` and `SummaryForm()` components.

- [ ] **Step 1: Write failing tests for the sanitize mappers**

Create `src/features/editor/sanitizeFields.test.ts`:
```ts
import { sanitizeDescription, sanitizeSummaryText } from "./sanitizeFields";

test("sanitizeDescription strips scripts from the description field only", () => {
  const item = { id: "1", role: "Eng", description: '<p>ok</p><script>alert(1)</script>' };
  const out = sanitizeDescription(item);
  expect(out.description).not.toContain("script");
  expect(out.role).toBe("Eng");
  expect(out.id).toBe("1");
});

test("sanitizeSummaryText returns a Summary with sanitized text", () => {
  const out = sanitizeSummaryText('<em>hi</em><img src=x onerror="alert(1)">');
  expect(out.text).toContain("<em>hi</em>");
  expect(out.text).not.toContain("img");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- sanitizeFields`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the mappers**

Create `src/features/editor/sanitizeFields.ts`:
```ts
import { sanitizeHtml } from "../../lib/sanitizeHtml";
import type { Summary } from "../../lib/schema/resume";

/** Returns a copy of an item with its rich-text `description` sanitized. */
export function sanitizeDescription<T extends { description: string }>(item: T): T {
  return { ...item, description: sanitizeHtml(item.description) };
}

/** Builds a Summary with sanitized rich-text. */
export function sanitizeSummaryText(text: string): Summary {
  return { text: sanitizeHtml(text) };
}
```

- [ ] **Step 4: Write failing tests for the forms**

Create `src/features/editor/sections/ContactForm.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { useResumeState } from "../../resume/useResume";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function CommittedName() {
  return <span data-testid="committed-name">{useResumeState().committed.contact.name}</span>;
}

test("typing does not change committed state until Save", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
      <CommittedName />
    </ResumeProvider>,
  );
  await userEvent.type(screen.getByLabelText(/name/i), "Ada");
  expect(screen.getByTestId("committed-name").textContent).toBe("");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(screen.getByTestId("committed-name").textContent).toBe("Ada");
});
```

Create `src/features/editor/sections/SummaryForm.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SummaryForm } from "./SummaryForm";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { useResumeState } from "../../resume/useResume";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function CommittedSummary() {
  return <span data-testid="committed-summary">{useResumeState().committed.summary.text}</span>;
}

test("renders a Save control and the summary rich-text field", () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SummaryForm />
      <CommittedSummary />
    </ResumeProvider>,
  );
  expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  expect(screen.getByLabelText("Summary text")).toBeInTheDocument();
});
```

- [ ] **Step 5: Run to verify they fail**

Run: `npm test -- "ContactForm|SummaryForm"`
Expected: FAIL — modules not found.

- [ ] **Step 6: Implement ContactForm**

Create `src/features/editor/sections/ContactForm.tsx`:
```tsx
import { useState } from "react";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import type { ContactHeader } from "../../../lib/schema/resume";

const FIELDS: ReadonlyArray<{ key: keyof ContactHeader; label: string; type: string }> = [
  { key: "name", label: "Name", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "location", label: "Location", type: "text" },
];

/** Singleton Contact/Header form: edits a local draft, commits on Save. */
export function ContactForm() {
  const committed = useResumeState().committed.contact;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<ContactHeader>(committed);

  return (
    <section aria-label="Contact">
      <h2>Contact</h2>
      {FIELDS.map(({ key, label, type }) => (
        <label key={key}>
          {label}
          <input
            type={type}
            value={draft[key]}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
          />
        </label>
      ))}
      <button type="button" onClick={() => dispatch({ type: "SET_CONTACT", contact: draft })}>
        Save
      </button>
    </section>
  );
}
```

- [ ] **Step 7: Implement SummaryForm**

Create `src/features/editor/sections/SummaryForm.tsx`:
```tsx
import { useState } from "react";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { RichTextField } from "../RichTextField";
import { sanitizeSummaryText } from "../sanitizeFields";

/** Singleton Summary form: rich-text draft, sanitized on Save. */
export function SummaryForm() {
  const committed = useResumeState().committed.summary;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<string>(committed.text);

  return (
    <section aria-label="Summary">
      <h2>Summary</h2>
      <RichTextField value={draft} onChange={setDraft} ariaLabel="Summary text" />
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_SUMMARY", summary: sanitizeSummaryText(draft) })}
      >
        Save
      </button>
    </section>
  );
}
```

- [ ] **Step 8: Run tests to verify they pass, then the full suite**

Run: `npm test -- "sanitizeFields|ContactForm|SummaryForm"` → Expected: PASS.
Run: `npm test` → Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add src/features/editor/sanitizeFields.ts src/features/editor/sanitizeFields.test.ts src/features/editor/sections/ContactForm.tsx src/features/editor/sections/ContactForm.test.tsx src/features/editor/sections/SummaryForm.tsx src/features/editor/sections/SummaryForm.test.tsx
git commit -m "feat: add Contact and Summary forms with boundary sanitization"
# end the message with the trailer from Global Constraints
```

---

### Task 7: Simple repeatable sections (Skills, Certifications, Languages, Links)

Four repeatable sections with plain-text fields (no rich text), each built on `useSectionDraft` + `SectionEditor`, dispatching with a **literal** section string.

**Files:**
- Create: `src/features/editor/sections/SkillsSection.tsx`
- Create: `src/features/editor/sections/CertificationsSection.tsx`
- Create: `src/features/editor/sections/LanguagesSection.tsx`
- Create: `src/features/editor/sections/LinksSection.tsx`
- Test: `src/features/editor/sections/SkillsSection.test.tsx` (thorough), `src/features/editor/sections/repeatableSmoke.test.tsx` (the other three)

**Interfaces:**
- Consumes: `useResumeState`, `useResumeDispatch`, `useSectionDraft`, `SectionEditor`, `newId`, item types.
- Produces: `SkillsSection()`, `CertificationsSection()`, `LanguagesSection()`, `LinksSection()`.

- [ ] **Step 1: Write the thorough SkillsSection test (failing)**

Create `src/features/editor/sections/SkillsSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsSection } from "./SkillsSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function renderSection() {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SkillsSection />
    </ResumeProvider>,
  );
}

test("add flow: typing does not add to the list until Save", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  await userEvent.type(screen.getByLabelText(/skill name/i), "TypeScript");
  expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByText("TypeScript")).toBeInTheDocument();
});

test("delete removes a saved skill", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  await userEvent.type(screen.getByLabelText(/skill name/i), "Go");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  expect(screen.queryByText("Go")).not.toBeInTheDocument();
});

test("Save is disabled until the name is non-empty", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  expect(screen.getByRole("button", { name: /^save$/i })).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/skill name/i), "Rust");
  expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- SkillsSection`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement SkillsSection**

Create `src/features/editor/sections/SkillsSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { SkillItem } from "../../../lib/schema/resume";

const makeEmpty = (): SkillItem => ({ id: newId(), name: "" });

/** Repeatable Skills section. */
export function SkillsSection() {
  const items = useResumeState().committed.skills;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "skills", item: draft });
    cancel();
  };

  return (
    <SectionEditor<SkillItem>
      title="Skills"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => (
        <label>
          Skill name
          <input
            value={draft?.name ?? ""}
            onChange={(e) => updateDraft({ name: e.target.value })}
          />
        </label>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "skills", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 4: Implement CertificationsSection**

Create `src/features/editor/sections/CertificationsSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { CertificationItem } from "../../../lib/schema/resume";

const makeEmpty = (): CertificationItem => ({ id: newId(), name: "", issuer: "", date: "" });

/** Repeatable Certifications section. */
export function CertificationsSection() {
  const items = useResumeState().committed.certifications;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "certifications", item: draft });
    cancel();
  };

  return (
    <SectionEditor<CertificationItem>
      title="Certifications"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => (
        <span>
          {item.name}
          {item.issuer ? ` — ${item.issuer}` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Certification name
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label>
            Issuer
            <input
              value={draft?.issuer ?? ""}
              onChange={(e) => updateDraft({ issuer: e.target.value })}
            />
          </label>
          <label>
            Date
            <input
              value={draft?.date ?? ""}
              onChange={(e) => updateDraft({ date: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "certifications", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 5: Implement LanguagesSection**

Create `src/features/editor/sections/LanguagesSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LanguageItem } from "../../../lib/schema/resume";

const makeEmpty = (): LanguageItem => ({ id: newId(), name: "", proficiency: "" });

/** Repeatable Languages section. */
export function LanguagesSection() {
  const items = useResumeState().committed.languages;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "languages", item: draft });
    cancel();
  };

  return (
    <SectionEditor<LanguageItem>
      title="Languages"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => (
        <span>
          {item.name}
          {item.proficiency ? ` (${item.proficiency})` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Language
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label>
            Proficiency
            <input
              value={draft?.proficiency ?? ""}
              onChange={(e) => updateDraft({ proficiency: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "languages", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 6: Implement LinksSection**

Create `src/features/editor/sections/LinksSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LinkItem } from "../../../lib/schema/resume";

const makeEmpty = (): LinkItem => ({ id: newId(), label: "", url: "" });

/** Repeatable Social/Portfolio Links section. */
export function LinksSection() {
  const items = useResumeState().committed.links;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "links", item: draft });
    cancel();
  };

  return (
    <SectionEditor<LinkItem>
      title="Links"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.url.trim().length > 0}
      renderSummary={(item) => <span>{item.label || item.url}</span>}
      renderForm={() => (
        <>
          <label>
            Label
            <input
              value={draft?.label ?? ""}
              onChange={(e) => updateDraft({ label: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              value={draft?.url ?? ""}
              onChange={(e) => updateDraft({ url: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "links", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 7: Write a smoke test for the other three sections (failing until Step 4–6 exist)**

Create `src/features/editor/sections/repeatableSmoke.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { CertificationsSection } from "./CertificationsSection";
import { LanguagesSection } from "./LanguagesSection";
import { LinksSection } from "./LinksSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test.each([
  ["Certifications", <CertificationsSection key="c" />],
  ["Languages", <LanguagesSection key="l" />],
  ["Links", <LinksSection key="k" />],
])("%s section renders its heading and an Add button", (title, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: new RegExp(`add ${title}`, "i") })).toBeInTheDocument();
});
```

- [ ] **Step 8: Run tests to verify they pass, then the full suite**

Run: `npm test -- "SkillsSection|repeatableSmoke"` → Expected: PASS.
Run: `npm test` → Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add src/features/editor/sections/SkillsSection.tsx src/features/editor/sections/CertificationsSection.tsx src/features/editor/sections/LanguagesSection.tsx src/features/editor/sections/LinksSection.tsx src/features/editor/sections/SkillsSection.test.tsx src/features/editor/sections/repeatableSmoke.test.tsx
git commit -m "feat: add plain-text repeatable sections (skills, certs, languages, links)"
# end the message with the trailer from Global Constraints
```

---

### Task 8: Rich-text repeatable sections (Experience, Education, Projects)

Three repeatable sections whose entries include a rich-text `description`, sanitized at Save via `sanitizeDescription`.

**Files:**
- Create: `src/features/editor/sections/ExperienceSection.tsx`
- Create: `src/features/editor/sections/EducationSection.tsx`
- Create: `src/features/editor/sections/ProjectsSection.tsx`
- Test: `src/features/editor/sections/ExperienceSection.test.tsx`, `src/features/editor/sections/richSectionsSmoke.test.tsx`

**Interfaces:**
- Consumes: `useResumeState`, `useResumeDispatch`, `useSectionDraft`, `SectionEditor`, `RichTextField`, `sanitizeDescription`, `newId`, item types.
- Produces: `ExperienceSection()`, `EducationSection()`, `ProjectsSection()`.

- [ ] **Step 1: Write the ExperienceSection test (failing)**

Create `src/features/editor/sections/ExperienceSection.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperienceSection } from "./ExperienceSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test("add flow: fill text fields, Save commits the entry to the list", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /add experience/i }));
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
  expect(screen.queryByText(/Acme/)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByText(/Acme/)).toBeInTheDocument();
});

test("Save is disabled until company or role is provided", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /add experience/i }));
  expect(screen.getByRole("button", { name: /^save$/i })).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- ExperienceSection`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement ExperienceSection**

Create `src/features/editor/sections/ExperienceSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { ExperienceItem } from "../../../lib/schema/resume";

const makeEmpty = (): ExperienceItem => ({
  id: newId(),
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  current: false,
  location: "",
  description: "",
});

/** Repeatable Experience section with a rich-text description. */
export function ExperienceSection() {
  const items = useResumeState().committed.experience;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "experience", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<ExperienceItem>
      title="Experience"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={
        draft !== null && (draft.company.trim().length > 0 || draft.role.trim().length > 0)
      }
      renderSummary={(item) => (
        <span>
          {item.role}
          {item.company ? ` @ ${item.company}` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Company
            <input
              value={draft?.company ?? ""}
              onChange={(e) => updateDraft({ company: e.target.value })}
            />
          </label>
          <label>
            Role
            <input
              value={draft?.role ?? ""}
              onChange={(e) => updateDraft({ role: e.target.value })}
            />
          </label>
          <label>
            Start date
            <input
              value={draft?.startDate ?? ""}
              onChange={(e) => updateDraft({ startDate: e.target.value })}
            />
          </label>
          <label>
            End date
            <input
              value={draft?.endDate ?? ""}
              onChange={(e) => updateDraft({ endDate: e.target.value })}
            />
          </label>
          <label>
            Currently here
            <input
              type="checkbox"
              checked={draft?.current ?? false}
              onChange={(e) => updateDraft({ current: e.target.checked })}
            />
          </label>
          <label>
            Location
            <input
              value={draft?.location ?? ""}
              onChange={(e) => updateDraft({ location: e.target.value })}
            />
          </label>
          <RichTextField
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Experience description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "experience", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 4: Implement EducationSection**

Create `src/features/editor/sections/EducationSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { EducationItem } from "../../../lib/schema/resume";

const makeEmpty = (): EducationItem => ({
  id: newId(),
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
});

/** Repeatable Education section with a rich-text description. */
export function EducationSection() {
  const items = useResumeState().committed.education;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "education", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<EducationItem>
      title="Education"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.institution.trim().length > 0}
      renderSummary={(item) => (
        <span>
          {item.degree || item.field || "Education"}
          {item.institution ? ` — ${item.institution}` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Institution
            <input
              value={draft?.institution ?? ""}
              onChange={(e) => updateDraft({ institution: e.target.value })}
            />
          </label>
          <label>
            Degree
            <input
              value={draft?.degree ?? ""}
              onChange={(e) => updateDraft({ degree: e.target.value })}
            />
          </label>
          <label>
            Field of study
            <input
              value={draft?.field ?? ""}
              onChange={(e) => updateDraft({ field: e.target.value })}
            />
          </label>
          <label>
            Start date
            <input
              value={draft?.startDate ?? ""}
              onChange={(e) => updateDraft({ startDate: e.target.value })}
            />
          </label>
          <label>
            End date
            <input
              value={draft?.endDate ?? ""}
              onChange={(e) => updateDraft({ endDate: e.target.value })}
            />
          </label>
          <RichTextField
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Education description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "education", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 5: Implement ProjectsSection**

Create `src/features/editor/sections/ProjectsSection.tsx`:
```tsx
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { ProjectItem } from "../../../lib/schema/resume";

const makeEmpty = (): ProjectItem => ({ id: newId(), name: "", url: "", description: "" });

/** Repeatable Projects section with a rich-text description. */
export function ProjectsSection() {
  const items = useResumeState().committed.projects;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "projects", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<ProjectItem>
      title="Projects"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => (
        <>
          <label>
            Project name
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              value={draft?.url ?? ""}
              onChange={(e) => updateDraft({ url: e.target.value })}
            />
          </label>
          <RichTextField
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Project description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "projects", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
```

- [ ] **Step 6: Write a smoke test for Education & Projects (failing until Steps 4–5)**

Create `src/features/editor/sections/richSectionsSmoke.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { EducationSection } from "./EducationSection";
import { ProjectsSection } from "./ProjectsSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test.each([
  ["Education", <EducationSection key="e" />],
  ["Projects", <ProjectsSection key="p" />],
])("%s section renders its heading and an Add button", (title, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: new RegExp(`add ${title}`, "i") })).toBeInTheDocument();
});
```

- [ ] **Step 7: Run tests to verify they pass, then the full suite**

Run: `npm test -- "ExperienceSection|richSectionsSmoke"` → Expected: PASS.
Run: `npm test` → Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add src/features/editor/sections/ExperienceSection.tsx src/features/editor/sections/EducationSection.tsx src/features/editor/sections/ProjectsSection.tsx src/features/editor/sections/ExperienceSection.test.tsx src/features/editor/sections/richSectionsSmoke.test.tsx
git commit -m "feat: add rich-text repeatable sections (experience, education, projects)"
# end the message with the trailer from Global Constraints
```

---

### Task 9: Compose the Editor and wire it into the app

**Files:**
- Create: `src/features/editor/Editor.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/editor/Editor.test.tsx`

**Interfaces:**
- Consumes: all nine section components.
- Produces: `Editor()` — stacks the nine sections in resume order. Must run inside a `ResumeProvider`.

- [ ] **Step 1: Write the failing test**

Create `src/features/editor/Editor.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Editor } from "./Editor";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";

test("renders every section heading in order", () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Editor />
    </ResumeProvider>,
  );
  const expected = [
    "Contact",
    "Summary",
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Certifications",
    "Languages",
    "Links",
  ];
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual(expected);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- "editor/Editor"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Editor**

Create `src/features/editor/Editor.tsx`:
```tsx
import { ContactForm } from "./sections/ContactForm";
import { SummaryForm } from "./sections/SummaryForm";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { LinksSection } from "./sections/LinksSection";

/** The left-pane editor: all nine resume sections in order. */
export function Editor() {
  return (
    <>
      <ContactForm />
      <SummaryForm />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificationsSection />
      <LanguagesSection />
      <LinksSection />
    </>
  );
}
```

- [ ] **Step 4: Wire the Editor into App**

Modify `src/App.tsx` — render `<Editor />` inside the editor pane, keeping both panes and the provider:
```tsx
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";
import { Editor } from "./features/editor/Editor";

const persistence = new LocalStoragePersistence();

export default function App() {
  return (
    <ResumeProvider persistence={persistence}>
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane">
          <Editor />
        </section>
        <section aria-label="Preview" className="preview-pane" />
      </main>
    </ResumeProvider>
  );
}
```

- [ ] **Step 5: Run the editor test, then the full suite**

Run: `npm test -- "editor/Editor"` → Expected: PASS.
Run: `npm test` → Expected: all green (App smoke test still passes — the "Editor" region now has content).
Run: `npm run lint && npx tsc --noEmit` → Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/features/editor/Editor.tsx src/features/editor/Editor.test.tsx src/App.tsx
git commit -m "feat: compose editor and mount it in the app shell"
# end the message with the trailer from Global Constraints
```

---

## Self-Review

**Spec coverage (S3-UI, S4, S5, S6):**
- S3-UI (save-based form framework): `useSectionDraft` (Task 3) + `SectionEditor` (Task 4). Add/Edit/Delete/Save/Cancel; typing doesn't touch committed state (Task 3 tests + Task 7 SkillsSection "typing does not add until Save").
- S4 (Contact + Summary): Task 6.
- S5 (nine sections): Contact/Summary (Task 6) + 4 simple repeatable (Task 7) + 3 rich repeatable (Task 8), composed in Task 9. All nine present, each with add/edit/delete on repeatables.
- S6 (rich text bold/italic/lists + sanitization): `RichTextField` (Task 5) + `sanitizeHtml`/`sanitizeDescription`/`sanitizeSummaryText` (Tasks 2, 6). Sanitization is boundary-enforced at Save and unit-tested on pure functions.
- Deferred-finding folded in: context split (Task 1). Editing model "typing never changes preview" holds because only Save/Delete dispatch.
- Correctly out of scope: template switcher (S11), preview/render (S7–S9), export (S12), import (S13), reorder — none appear here.

**Placeholder scan:** none — every code step has complete, runnable code. The only prose-in-step is the commit-trailer reminder, which points to the exact two lines in Global Constraints (not a logic placeholder).

**Type consistency:** hooks `useResumeState`/`useResumeDispatch` defined in Task 1 and consumed unchanged in Tasks 6–8. `useSectionDraft` API (`draft/isEditing/startAdd/startEdit/updateDraft/cancel`) defined in Task 3, consumed identically in Tasks 7–8. `SectionEditor` prop names (Task 4) match every usage. `sanitizeDescription`/`sanitizeSummaryText` (Task 6) match usages in Tasks 6–8. All `SAVE_ITEM`/`DELETE_ITEM` dispatches use literal section strings matching `RepeatableSection`. Item field names match the schema read from `src/lib/schema/resume.ts`.

**Testing-boundary note:** TipTap/ProseMirror interaction isn't driven in jsdom (Task 5 is a mount smoke test); rich-text XSS defense is proven via pure `sanitize*` functions instead, so coverage of the security-critical path does not depend on the contenteditable engine. End-to-end rich-text typing is a Plan 3 manual/Playwright check.

## Next plan (write when this lands)
- **Plan 3 — Render & preview (S7, S8, S9):** T1 template render, Paged.js pagination, live Paged.js DOM preview. When rendering `description`/`summary` HTML, treat stored HTML as already-sanitized (Task 6 boundary) but keep render escaping defense-in-depth; see `[[foundation-deferred-findings]]`.
