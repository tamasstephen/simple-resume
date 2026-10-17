import type { Resume } from "../../lib/schema/resume";
import {
  countErrors,
  validateCertification,
  validateContact,
  validateEducation,
  validateExperience,
  validateLink,
  validateProject,
  type Validator,
} from "../../lib/validation/sectionRules";
import type { SectionId } from "./sectionMeta";

function countItemErrors<T>({ items, validate }: { items: readonly T[]; validate: Validator<T> }) {
  return items.reduce((total, item) => total + countErrors(validate(item)), 0);
}

/** Invalid fields per section in saved data — entries saved before a rule
 *  existed, or imported — for the rail's attention badges. Sections without
 *  rules are absent. */
export function countSectionErrors(resume: Resume): Partial<Record<SectionId, number>> {
  return {
    contact: countErrors(validateContact(resume.contact)),
    links: countItemErrors({ items: resume.links, validate: validateLink }),
    experience: countItemErrors({ items: resume.experience, validate: validateExperience }),
    education: countItemErrors({ items: resume.education, validate: validateEducation }),
    projects: countItemErrors({ items: resume.projects, validate: validateProject }),
    certifications: countItemErrors({
      items: resume.certifications,
      validate: validateCertification,
    }),
  };
}
