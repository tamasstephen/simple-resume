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
