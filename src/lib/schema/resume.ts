import { z } from "zod";

export const SCHEMA_VERSION = 2 as const;

export const templateSchema = z.enum(["minimal", "executive", "ats"]);
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
    template: "minimal",
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
