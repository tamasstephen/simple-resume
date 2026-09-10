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

// Distributes SAVE_ITEM over each repeatable section so the section and its
// item stay bound to the same concrete element type at compile time (e.g.
// dispatching a SkillItem into "experience" is a type error, not a silent
// data-loss bug at runtime).
export type SaveItemAction = {
  [S in RepeatableSection]: { type: "SAVE_ITEM"; section: S; item: Resume[S][number] };
}[RepeatableSection];

export type ResumeAction =
  | SaveItemAction
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

// Narrowing on `action.section` (a discriminant of SaveItemAction) narrows
// `action.item` to the matching concrete item type in each branch, so every
// upsertById call below is fully type-checked without a cast — TS's
// correlated-union limitation only bites if we try to handle this
// generically over `action.section`'s type instead of switching on it.
function applySaveItem(committed: Resume, action: SaveItemAction): Resume {
  switch (action.section) {
    case "experience":
      return { ...committed, experience: upsertById(committed.experience, action.item) };
    case "education":
      return { ...committed, education: upsertById(committed.education, action.item) };
    case "skills":
      return { ...committed, skills: upsertById(committed.skills, action.item) };
    case "projects":
      return { ...committed, projects: upsertById(committed.projects, action.item) };
    case "certifications":
      return {
        ...committed,
        certifications: upsertById(committed.certifications, action.item),
      };
    case "languages":
      return { ...committed, languages: upsertById(committed.languages, action.item) };
    case "links":
      return { ...committed, links: upsertById(committed.links, action.item) };
  }
}

export function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case "SAVE_ITEM":
      return { committed: applySaveItem(state.committed, action) };
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
