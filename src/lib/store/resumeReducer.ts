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
