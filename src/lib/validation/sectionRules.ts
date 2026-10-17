import type {
  CertificationItem,
  ContactHeader,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  LinkItem,
  ProjectItem,
  SkillItem,
} from "../schema/resume";
import {
  MESSAGES,
  isMonthYearBefore,
  parseMonthYear,
  validateEmail,
  validateMonthYear,
  validatePhone,
  validateWebAddress,
  type FieldRule,
} from "./fieldRules";

/** Fix-it message per field; null or a missing entry means the field is valid. */
export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string | null>>;

export type Validator<T> = (item: T) => FieldErrors<T>;

export function countErrors<T>(errors: FieldErrors<T>): number {
  return Object.values(errors).filter((message) => typeof message === "string").length;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return countErrors(errors) > 0;
}

/** `message` when the value is blank, else the format `rule`'s verdict. */
function required({
  value,
  message,
  rule,
}: {
  value: string;
  message: string;
  rule?: FieldRule;
}): string | null {
  if (value.trim().length === 0) return message;
  return rule === undefined ? null : rule(value);
}

/** The end-date message: its own format first, then its order against a
 *  start date that parsed. */
function validateDateRange({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): string | null {
  const formatError = validateMonthYear(endDate);
  if (formatError !== null) return formatError;
  const start = parseMonthYear(startDate);
  const end = parseMonthYear(endDate);
  if (start === null || end === null) return null;
  return isMonthYearBefore(end, start) ? MESSAGES.endBeforeStart : null;
}

export const validateContact: Validator<ContactHeader> = (contact) => ({
  email: validateEmail(contact.email),
  phone: validatePhone(contact.phone),
  website: validateWebAddress(contact.website),
});

export const validateExperience: Validator<ExperienceItem> = (item) => ({
  role: required({ value: item.role, message: MESSAGES.jobTitleRequired }),
  company: required({ value: item.company, message: MESSAGES.companyRequired }),
  startDate: required({
    value: item.startDate,
    message: MESSAGES.startDateRequired,
    rule: validateMonthYear,
  }),
  // A current role prints "Present"; any other needs to say when it ended.
  endDate: item.current
    ? null
    : required({
        value: item.endDate,
        message: MESSAGES.endDateRequired,
        rule: () => validateDateRange(item),
      }),
});

export const validateEducation: Validator<EducationItem> = (item) => ({
  institution: required({ value: item.institution, message: MESSAGES.institutionRequired }),
  startDate: validateMonthYear(item.startDate),
  endDate: validateDateRange(item),
});

export const validateSkill: Validator<SkillItem> = (item) => ({
  name: required({ value: item.name, message: MESSAGES.skillRequired }),
});

export const validateLanguage: Validator<LanguageItem> = (item) => ({
  name: required({ value: item.name, message: MESSAGES.languageRequired }),
});

export const validateCertification: Validator<CertificationItem> = (item) => ({
  name: required({ value: item.name, message: MESSAGES.certificationRequired }),
  date: validateMonthYear(item.date),
});

export const validateProject: Validator<ProjectItem> = (item) => ({
  name: required({ value: item.name, message: MESSAGES.projectRequired }),
  url: validateWebAddress(item.url),
});

export const validateLink: Validator<LinkItem> = (item) => ({
  url: required({ value: item.url, message: MESSAGES.linkRequired, rule: validateWebAddress }),
});
