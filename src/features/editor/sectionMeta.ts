export type SectionId =
  | "contact"
  | "links"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export interface SectionMeta {
  id: SectionId;
  number: string;
  name: string;
  headline: string;
  description: string;
}

/** Every editor section in document order — the rail, the headings and the
 *  numbering all read from this one list. */
export const SECTIONS: readonly SectionMeta[] = [
  {
    id: "contact",
    number: "01",
    name: "Contact",
    headline: "How to reach you",
    description: "Your name and title lead the page; the rest prints on one line beneath.",
  },
  {
    id: "links",
    number: "02",
    name: "Links",
    headline: "Where to find you online",
    description: "Portfolio, GitHub, LinkedIn — whatever helps someone see your work.",
  },
  {
    id: "summary",
    number: "03",
    name: "Summary",
    headline: "Your story in brief",
    description: "Two or three sentences: what you do and what you’re best at.",
  },
  {
    id: "experience",
    number: "04",
    name: "Experience",
    headline: "Where you’ve worked",
    description: "Newest first. Two to four bullet points per role read best on paper.",
  },
  {
    id: "education",
    number: "05",
    name: "Education",
    headline: "What you studied",
    description: "Degrees, schools and years. Newest first.",
  },
  {
    id: "skills",
    number: "06",
    name: "Skills",
    headline: "What you’re good at",
    description: "One skill per tag. They print as a single line.",
  },
  {
    id: "projects",
    number: "07",
    name: "Projects",
    headline: "Things you’ve built",
    description: "Side projects, open source, or notable work outside a job.",
  },
  {
    id: "certifications",
    number: "08",
    name: "Certifications",
    headline: "Proof on paper",
    description: "Optional — skip it if it doesn’t apply.",
  },
  {
    id: "languages",
    number: "09",
    name: "Languages",
    headline: "Languages you speak",
    description: "Add a level if it helps, like “German — C1”.",
  },
];

export function getSectionMeta(id: SectionId): SectionMeta {
  const meta = SECTIONS.find((section) => section.id === id);
  if (meta === undefined) throw new Error(`Unknown section id: ${id}`);
  return meta;
}

export function sectionAnchor(id: SectionId): string {
  return `section-${id}`;
}
