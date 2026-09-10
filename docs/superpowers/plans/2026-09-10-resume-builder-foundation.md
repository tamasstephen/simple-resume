# Resume Builder — Foundation & Data Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the React + TypeScript project and a fully-tested, headless resume data core — typed schema, a swappable persistence layer with auto-save, and a save-based editing store — so later plans can build the editor UI and rendering on a solid, verified base.

**Architecture:** Zod schemas are the single source of truth for resume data; TypeScript types are derived via `z.infer`. Persistence hides behind a `PersistenceProvider` interface with an in-memory implementation (for tests) and a localStorage implementation (for the app), so no UI code ever touches storage directly (PRD FR14). Editing follows a **save-based** model: a pure reducer keeps committed resume data separate from an in-progress draft, and only explicit `SAVE_DRAFT`/`DELETE_ITEM` actions mutate committed data (PRD FR3). Preview/rendering and per-section forms are intentionally out of scope for this plan.

**Tech Stack:** Vite, React 19, TypeScript (strict), Zod, Vitest, React Testing Library, jsdom, ESLint, Prettier.

## Global Constraints

- Language: TypeScript in `strict` mode. No `any`; no `as` type assertions — use Zod parsing/`z.infer` and type guards (repo rule).
- Runtime: fully client-side; no backend in this plan.
- Node 18+, npm 9+ (parity with the previous project).
- Persistence access only through the `PersistenceProvider` interface — no direct `localStorage`/`window.localStorage` calls outside `LocalStoragePersistence`.
- Test framework: Vitest + React Testing Library (`jsdom` environment).
- Storage key for persisted state: `"resume-builder:v1"`.
- Schema version constant: `SCHEMA_VERSION = 1`.
- Templates enum values: `"ats"` and `"designed"`; default `"ats"`.
- Commit after every task (frequent commits). Conventional Commit messages.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `.eslintrc.cjs`, `.prettierrc`, `vitest.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Create: `src/setupTests.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a running app shell and a green test command `npm test`. Folder convention: `src/lib/` (framework-agnostic logic), `src/features/` (feature slices), `src/templates/` (render templates, later), `src/types/` (shared types).

- [ ] **Step 1: Scaffold the Vite React-TS project**

Run:
```bash
npm create vite@latest . -- --template react-ts
npm install
```
Expected: project files created; `npm run dev` serves a default app.

- [ ] **Step 2: Add dev/test/lint dependencies**

Run:
```bash
npm install zod
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-import prettier
```
Expected: dependencies added to `package.json`.

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
```

Create `src/setupTests.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Enable strict TypeScript**

In `tsconfig.json`, ensure `compilerOptions` includes:
```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
}
```

- [ ] **Step 5: Add npm scripts**

In `package.json` `"scripts"`:
```jsonc
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint 'src/**/*.{ts,tsx}'",
  "format": "prettier --write 'src/**/*.{ts,tsx,css}'"
}
```

- [ ] **Step 6: Replace App with the two-pane shell**

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section aria-label="Editor" className="editor-pane" />
      <section aria-label="Preview" className="preview-pane" />
    </main>
  );
}
```

- [ ] **Step 7: Write the smoke test**

Create `src/App.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders editor and preview panes", () => {
  render(<App />);
  expect(screen.getByRole("region", { name: "Editor" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument();
});
```

- [ ] **Step 8: Run the test**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React-TS project with Vitest and strict TS"
```

---

### Task 2: Resume schema & derived types

**Files:**
- Create: `src/lib/schema/resume.ts`
- Test: `src/lib/schema/resume.test.ts`

**Interfaces:**
- Consumes: `zod`.
- Produces:
  - `SCHEMA_VERSION: 1`
  - `templateSchema` → `Template = "ats" | "designed"`
  - `resumeSchema` (Zod object) and `Resume = z.infer<typeof resumeSchema>`
  - `emptyResume(): Resume` factory (valid empty document, `template: "ats"`, all lists `[]`).
  - Section item types via `z.infer`: `ExperienceItem`, `EducationItem`, `SkillItem`, `ProjectItem`, `CertificationItem`, `LanguageItem`, `LinkItem`, and `ContactHeader`, `Summary`.

- [ ] **Step 1: Write failing tests for the schema**

Create `src/lib/schema/resume.test.ts`:
```ts
import { resumeSchema, emptyResume, SCHEMA_VERSION } from "./resume";

test("emptyResume is a valid resume with defaults", () => {
  const resume = emptyResume();
  expect(resume.schemaVersion).toBe(SCHEMA_VERSION);
  expect(resume.template).toBe("ats");
  expect(resume.experience).toEqual([]);
  expect(resumeSchema.safeParse(resume).success).toBe(true);
});

test("rejects an invalid template value", () => {
  const bad = { ...emptyResume(), template: "fancy" };
  expect(resumeSchema.safeParse(bad).success).toBe(false);
});

test("rejects a non-string contact email type", () => {
  const bad = { ...emptyResume(), contact: { ...emptyResume().contact, email: 42 } };
  expect(resumeSchema.safeParse(bad).success).toBe(false);
});

test("accepts a populated experience item", () => {
  const resume = {
    ...emptyResume(),
    experience: [
      { id: "e1", company: "Acme", role: "Engineer", startDate: "2020", endDate: "2022", current: false, location: "Remote", description: "<p>Built things</p>" },
    ],
  };
  expect(resumeSchema.safeParse(resume).success).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- resume`
Expected: FAIL — cannot resolve `./resume`.

- [ ] **Step 3: Implement the schema**

Create `src/lib/schema/resume.ts`:
```ts
import { z } from "zod";

export const SCHEMA_VERSION = 1 as const;

export const templateSchema = z.enum(["ats", "designed"]);
export type Template = z.infer<typeof templateSchema>;

const idSchema = z.string().min(1);
const richText = z.string(); // sanitized HTML string (sanitization added in the rich-text story)

export const contactHeaderSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
});
export type ContactHeader = z.infer<typeof contactHeaderSchema>;

export const summarySchema = z.object({ text: richText });
export type Summary = z.infer<typeof summarySchema>;

export const experienceItemSchema = z.object({
  id: idSchema,
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  location: z.string(),
  description: richText,
});
export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const educationItemSchema = z.object({
  id: idSchema,
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: richText,
});
export type EducationItem = z.infer<typeof educationItemSchema>;

export const skillItemSchema = z.object({ id: idSchema, name: z.string() });
export type SkillItem = z.infer<typeof skillItemSchema>;

export const projectItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  url: z.string(),
  description: richText,
});
export type ProjectItem = z.infer<typeof projectItemSchema>;

export const certificationItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});
export type CertificationItem = z.infer<typeof certificationItemSchema>;

export const languageItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  proficiency: z.string(),
});
export type LanguageItem = z.infer<typeof languageItemSchema>;

export const linkItemSchema = z.object({ id: idSchema, label: z.string(), url: z.string() });
export type LinkItem = z.infer<typeof linkItemSchema>;

export const resumeSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  template: templateSchema,
  contact: contactHeaderSchema,
  summary: summarySchema,
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skills: z.array(skillItemSchema),
  projects: z.array(projectItemSchema),
  certifications: z.array(certificationItemSchema),
  languages: z.array(languageItemSchema),
  links: z.array(linkItemSchema),
});
export type Resume = z.infer<typeof resumeSchema>;

export function emptyResume(): Resume {
  return {
    schemaVersion: SCHEMA_VERSION,
    template: "ats",
    contact: { name: "", title: "", email: "", phone: "", location: "" },
    summary: { text: "" },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    links: [],
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- resume`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema/resume.ts src/lib/schema/resume.test.ts
git commit -m "feat: add Zod resume schema and derived types"
```

---

### Task 3: Persistence abstraction (in-memory + localStorage)

**Files:**
- Create: `src/lib/persistence/PersistenceProvider.ts`
- Create: `src/lib/persistence/InMemoryPersistence.ts`
- Create: `src/lib/persistence/LocalStoragePersistence.ts`
- Test: `src/lib/persistence/persistence.test.ts`

**Interfaces:**
- Consumes: `resumeSchema`, `Resume` (Task 2).
- Produces:
  - `interface PersistenceProvider { load(): Resume | null; save(resume: Resume): void; clear(): void; }`
  - `class InMemoryPersistence implements PersistenceProvider`
  - `class LocalStoragePersistence implements PersistenceProvider` (constructor: `(storage: Storage = window.localStorage, key = "resume-builder:v1")`)
  - `LocalStoragePersistence.isAvailable(storage?: Storage): boolean`
  - `load()` returns `null` when nothing stored OR stored JSON fails `resumeSchema` validation (never throws on bad data).

- [ ] **Step 1: Write failing tests**

Create `src/lib/persistence/persistence.test.ts`:
```ts
import { InMemoryPersistence } from "./InMemoryPersistence";
import { LocalStoragePersistence } from "./LocalStoragePersistence";
import { emptyResume } from "../schema/resume";

describe("InMemoryPersistence", () => {
  test("returns null before any save", () => {
    expect(new InMemoryPersistence().load()).toBeNull();
  });

  test("round-trips a saved resume", () => {
    const store = new InMemoryPersistence();
    const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Ada" } };
    store.save(resume);
    expect(store.load()).toEqual(resume);
  });

  test("clear removes stored data", () => {
    const store = new InMemoryPersistence();
    store.save(emptyResume());
    store.clear();
    expect(store.load()).toBeNull();
  });
});

describe("LocalStoragePersistence", () => {
  beforeEach(() => window.localStorage.clear());

  test("round-trips through window.localStorage", () => {
    const store = new LocalStoragePersistence();
    const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Grace" } };
    store.save(resume);
    expect(new LocalStoragePersistence().load()).toEqual(resume);
  });

  test("returns null when stored JSON is invalid against the schema", () => {
    window.localStorage.setItem("resume-builder:v1", JSON.stringify({ nope: true }));
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("returns null when stored value is not JSON", () => {
    window.localStorage.setItem("resume-builder:v1", "{not json");
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("isAvailable reports true in jsdom", () => {
    expect(LocalStoragePersistence.isAvailable()).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- persistence`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the interface**

Create `src/lib/persistence/PersistenceProvider.ts`:
```ts
import type { Resume } from "../schema/resume";

export interface PersistenceProvider {
  load(): Resume | null;
  save(resume: Resume): void;
  clear(): void;
}
```

- [ ] **Step 4: Implement InMemoryPersistence**

Create `src/lib/persistence/InMemoryPersistence.ts`:
```ts
import type { Resume } from "../schema/resume";
import type { PersistenceProvider } from "./PersistenceProvider";

export class InMemoryPersistence implements PersistenceProvider {
  private stored: Resume | null = null;

  load(): Resume | null {
    return this.stored;
  }

  save(resume: Resume): void {
    this.stored = resume;
  }

  clear(): void {
    this.stored = null;
  }
}
```

- [ ] **Step 5: Implement LocalStoragePersistence**

Create `src/lib/persistence/LocalStoragePersistence.ts`:
```ts
import { resumeSchema, type Resume } from "../schema/resume";
import type { PersistenceProvider } from "./PersistenceProvider";

const DEFAULT_KEY = "resume-builder:v1";

export class LocalStoragePersistence implements PersistenceProvider {
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly key: string = DEFAULT_KEY,
  ) {}

  static isAvailable(storage: Storage = window.localStorage): boolean {
    try {
      const probe = "__resume_probe__";
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  load(): Resume | null {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    const result = resumeSchema.safeParse(parsed);
    return result.success ? result.data : null;
  }

  save(resume: Resume): void {
    this.storage.setItem(this.key, JSON.stringify(resume));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- persistence`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/persistence
git commit -m "feat: add swappable persistence layer with schema-validated localStorage"
```

---

### Task 4: Save-based resume store (reducer)

**Files:**
- Create: `src/lib/store/resumeReducer.ts`
- Create: `src/lib/store/repeatableSections.ts`
- Test: `src/lib/store/resumeReducer.test.ts`

**Interfaces:**
- Consumes: `Resume`, `emptyResume`, and item types (Task 2).
- Produces:
  - `type RepeatableSection = "experience" | "education" | "skills" | "projects" | "certifications" | "languages" | "links"`
  - `interface ResumeState { committed: Resume; }`
  - `type ResumeAction` (discriminated union):
    - `{ type: "SAVE_ITEM"; section: RepeatableSection; item: SectionItem }` — upsert by `id` (replace if `id` exists, else append). This is the single commit path used by both "add new" and "edit existing" (PRD FR3/FR4).
    - `{ type: "DELETE_ITEM"; section: RepeatableSection; id: string }`
    - `{ type: "SET_CONTACT"; contact: ContactHeader }`
    - `{ type: "SET_SUMMARY"; summary: Summary }`
    - `{ type: "SELECT_TEMPLATE"; template: Template }`
    - `{ type: "REPLACE_ALL"; resume: Resume }` — used by load/import.
  - `function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState` — pure, returns new state.
  - `function initialState(resume?: Resume): ResumeState`
- Note: the reducer never touches persistence or draft/form buffers. Draft-vs-committed separation lives in the (later) UI form component: fields are local component state; the reducer is invoked **only** on Save/Delete — that is what guarantees "typing does not change the preview" (PRD AC). This task proves the commit semantics in isolation.

- [ ] **Step 1: Write failing tests**

Create `src/lib/store/resumeReducer.test.ts`:
```ts
import { resumeReducer, initialState } from "./resumeReducer";
import type { ExperienceItem } from "../schema/resume";

const expItem = (id: string, company: string): ExperienceItem => ({
  id, company, role: "Eng", startDate: "2020", endDate: "2021", current: false, location: "", description: "",
});

test("SAVE_ITEM appends a new item", () => {
  const state = initialState();
  const next = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("1", "Acme") });
  expect(next.committed.experience).toHaveLength(1);
  expect(next.committed.experience[0]?.company).toBe("Acme");
});

test("SAVE_ITEM with an existing id replaces in place (edit), preserving order", () => {
  let state = initialState();
  state = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("1", "Acme") });
  state = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("2", "Beta") });
  const next = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("1", "Acme Corp") });
  expect(next.committed.experience.map((e) => e.id)).toEqual(["1", "2"]);
  expect(next.committed.experience[0]?.company).toBe("Acme Corp");
});

test("DELETE_ITEM removes by id", () => {
  let state = initialState();
  state = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("1", "Acme") });
  const next = resumeReducer(state, { type: "DELETE_ITEM", section: "experience", id: "1" });
  expect(next.committed.experience).toHaveLength(0);
});

test("SELECT_TEMPLATE updates template without touching data", () => {
  let state = initialState();
  state = resumeReducer(state, { type: "SAVE_ITEM", section: "skills", item: { id: "s1", name: "TS" } });
  const next = resumeReducer(state, { type: "SELECT_TEMPLATE", template: "designed" });
  expect(next.committed.template).toBe("designed");
  expect(next.committed.skills).toHaveLength(1);
});

test("reducer does not mutate the previous state", () => {
  const state = initialState();
  const next = resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: expItem("1", "Acme") });
  expect(state.committed.experience).toHaveLength(0);
  expect(next).not.toBe(state);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- resumeReducer`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the section-key helper**

Create `src/lib/store/repeatableSections.ts`:
```ts
export const REPEATABLE_SECTIONS = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "links",
] as const;

export type RepeatableSection = (typeof REPEATABLE_SECTIONS)[number];
```

- [ ] **Step 4: Implement the reducer**

Create `src/lib/store/resumeReducer.ts`:
```ts
import {
  emptyResume,
  type Resume,
  type ContactHeader,
  type Summary,
  type Template,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type ProjectItem,
  type CertificationItem,
  type LanguageItem,
  type LinkItem,
} from "../schema/resume";
import type { RepeatableSection } from "./repeatableSections";

export type SectionItem =
  | ExperienceItem
  | EducationItem
  | SkillItem
  | ProjectItem
  | CertificationItem
  | LanguageItem
  | LinkItem;

export interface ResumeState {
  committed: Resume;
}

export type ResumeAction =
  | { type: "SAVE_ITEM"; section: RepeatableSection; item: SectionItem }
  | { type: "DELETE_ITEM"; section: RepeatableSection; id: string }
  | { type: "SET_CONTACT"; contact: ContactHeader }
  | { type: "SET_SUMMARY"; summary: Summary }
  | { type: "SELECT_TEMPLATE"; template: Template }
  | { type: "REPLACE_ALL"; resume: Resume };

export function initialState(resume: Resume = emptyResume()): ResumeState {
  return { committed: resume };
}

function upsertById<T extends { id: string }>(list: readonly T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [...list, item];
  const copy = list.slice();
  copy[index] = item;
  return copy;
}

export function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case "SAVE_ITEM": {
      const current = state.committed[action.section];
      const updated = upsertById(current, action.item);
      return { committed: { ...state.committed, [action.section]: updated } };
    }
    case "DELETE_ITEM": {
      const current = state.committed[action.section];
      const updated = current.filter((entry) => entry.id !== action.id);
      return { committed: { ...state.committed, [action.section]: updated } };
    }
    case "SET_CONTACT":
      return { committed: { ...state.committed, contact: action.contact } };
    case "SET_SUMMARY":
      return { committed: { ...state.committed, summary: action.summary } };
    case "SELECT_TEMPLATE":
      return { committed: { ...state.committed, template: action.template } };
    case "REPLACE_ALL":
      return { committed: action.resume };
  }
}
```

Note on types: `SAVE_ITEM`/`DELETE_ITEM` accept the section-item union; the reducer writes to the section keyed by `action.section`. Cross-section correctness (e.g. saving a `SkillItem` into `experience`) is enforced at the call site by the typed form components in the editor plan, where each section binds one concrete item type.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- resumeReducer`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/store
git commit -m "feat: add pure save-based resume reducer with upsert/delete semantics"
```

---

### Task 5: Resume context with auto-save wiring

**Files:**
- Create: `src/features/resume/ResumeProvider.tsx`
- Create: `src/features/resume/useResume.ts`
- Test: `src/features/resume/ResumeProvider.test.tsx`

**Interfaces:**
- Consumes: `resumeReducer`, `initialState`, `ResumeState`, `ResumeAction` (Task 4); `PersistenceProvider`, `LocalStoragePersistence` (Task 3); `emptyResume` (Task 2).
- Produces:
  - `<ResumeProvider persistence={PersistenceProvider}>` — loads initial state from `persistence.load() ?? emptyResume()`, and calls `persistence.save(state.committed)` in an effect whenever `committed` changes (auto-save, PRD FR12).
  - `useResume(): { state: ResumeState; dispatch: Dispatch<ResumeAction> }` — throws a clear error if used outside the provider.

- [ ] **Step 1: Write failing tests**

Create `src/features/resume/ResumeProvider.test.tsx`:
```tsx
import { render, screen, act } from "@testing-library/react";
import { ResumeProvider } from "./ResumeProvider";
import { useResume } from "./useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";

function Probe() {
  const { state, dispatch } = useResume();
  return (
    <div>
      <span data-testid="count">{state.committed.experience.length}</span>
      <span data-testid="skills">{state.committed.skills.length}</span>
      <button
        onClick={() =>
          dispatch({
            type: "SAVE_ITEM",
            section: "experience",
            item: { id: "1", company: "Acme", role: "Eng", startDate: "2020", endDate: "2021", current: false, location: "", description: "" },
          })
        }
      >
        add
      </button>
    </div>
  );
}

test("loads initial state from persistence", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), skills: [{ id: "s1", name: "TS" }] });
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  expect(screen.getByTestId("skills").textContent).toBe("1"); // seeded skill loaded from persistence
});

test("auto-saves committed changes to persistence", async () => {
  const persistence = new InMemoryPersistence();
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  await act(async () => {
    screen.getByText("add").click();
  });
  expect(persistence.load()?.experience).toHaveLength(1);
});

test("useResume throws outside a provider", () => {
  function Orphan() {
    useResume();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- ResumeProvider`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the context + hook**

Create `src/features/resume/useResume.ts`:
```ts
import { createContext, useContext, type Dispatch } from "react";
import type { ResumeState, ResumeAction } from "../../lib/store/resumeReducer";

export interface ResumeContextValue {
  state: ResumeState;
  dispatch: Dispatch<ResumeAction>;
}

export const ResumeContext = createContext<ResumeContextValue | null>(null);

export function useResume(): ResumeContextValue {
  const value = useContext(ResumeContext);
  if (value === null) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return value;
}
```

Create `src/features/resume/ResumeProvider.tsx`:
```tsx
import { useEffect, useReducer, type ReactNode } from "react";
import { resumeReducer, initialState } from "../../lib/store/resumeReducer";
import { emptyResume } from "../../lib/schema/resume";
import type { PersistenceProvider } from "../../lib/persistence/PersistenceProvider";
import { ResumeContext } from "./useResume";

interface ResumeProviderProps {
  persistence: PersistenceProvider;
  children: ReactNode;
}

export function ResumeProvider({ persistence, children }: ResumeProviderProps) {
  const [state, dispatch] = useReducer(
    resumeReducer,
    undefined,
    () => initialState(persistence.load() ?? emptyResume()),
  );

  useEffect(() => {
    persistence.save(state.committed);
  }, [state.committed, persistence]);

  return <ResumeContext.Provider value={{ state, dispatch }}>{children}</ResumeContext.Provider>;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ResumeProvider`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the provider into App**

Modify `src/App.tsx`:
```tsx
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";

const persistence = new LocalStoragePersistence();

export default function App() {
  return (
    <ResumeProvider persistence={persistence}>
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane" />
        <section aria-label="Preview" className="preview-pane" />
      </main>
    </ResumeProvider>
  );
}
```

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS (all tests from Tasks 1–5).

- [ ] **Step 7: Commit**

```bash
git add src/features/resume src/App.tsx
git commit -m "feat: add resume context provider with persistence-backed auto-save"
```

---

## Self-Review

**Spec coverage (this plan's slice = S1–S3):**
- PRD FR12 (auto-save/restore) → Task 5. FR14 (persistence behind interface) → Task 3 + Task 5 (UI depends only on `PersistenceProvider`). FR3/FR4 commit semantics (save-based) → Task 4. FR15 (React + TS) → Task 1. Data model for all 9 sections → Task 2. Edge case "invalid stored/imported JSON preserves state / returns null" foundation → Task 3 (`load()` returns null on invalid). Storage-unavailable detection helper (`isAvailable`) → Task 3 (UI surfacing deferred to S14).
- Deferred to later plans (correctly out of scope): per-section forms (S4/S5), rich-text + sanitization (S6), templates/render/Paged.js (S7/S8), preview pane (S9), two-column (S10), template switcher UI (S11 — reducer action `SELECT_TEMPLATE` already provided), PDF export (S12), JSON import/export UI (S13 — `REPLACE_ALL` action + schema already provided), edge-case UX pass (S14).

**Placeholder scan:** none — every code step contains complete, runnable code.

**Type consistency:** `PersistenceProvider.{load,save,clear}` identical across Tasks 3/5. `ResumeState`/`ResumeAction`/`resumeReducer`/`initialState` names match between Tasks 4 and 5. `RepeatableSection` defined once (Task 4) and reused. `resumeSchema`/`Resume`/`emptyResume`/`SCHEMA_VERSION` defined in Task 2 and consumed unchanged downstream. `Template` union reused in the reducer's `SELECT_TEMPLATE`.

## Next plans (write when this one lands)
- **Plan 2 — Editor UI (S3 UI, S4, S5, S6):** generic save-based section form component (draft = local state), the nine section forms, rich-text field + sanitization.
- **Plan 3 — Render & preview (S7, S8, S9):** T1 template render, Paged.js pagination, live Paged.js DOM preview.
- **Plan 4 — Export, portability, second template, polish (S12, S13, S10, S11, S14):** native print export, JSON import/export UI, T2 two-column (after SP-2 spike), template switcher, edge-case pass.
