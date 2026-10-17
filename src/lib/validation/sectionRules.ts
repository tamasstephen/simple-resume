import type {
  CertificationItem,
  ContactHeader,
  EducationItem,
  ExperienceItem,
  LinkItem,
  ProjectItem,
} from "../schema/resume";
import {
  MESSAGES,
  isMonthYearBefore,
  parseMonthYear,
  validateEmail,
  validateMonthYear,
  validatePhone,
  validateWebAddress,
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
});

export const validateExperience: Validator<ExperienceItem> = (item) => ({
  startDate:
    item.startDate.trim().length === 0
      ? MESSAGES.startDateRequired
      : validateMonthYear(item.startDate),
  endDate: item.current ? null : validateDateRange(item),
});

export const validateEducation: Validator<EducationItem> = (item) => ({
  startDate: validateMonthYear(item.startDate),
  endDate: validateDateRange(item),
});

export const validateCertification: Validator<CertificationItem> = (item) => ({
  date: validateMonthYear(item.date),
});

export const validateProject: Validator<ProjectItem> = (item) => ({
  url: validateWebAddress(item.url),
});

export const validateLink: Validator<LinkItem> = (item) => ({ url: validateWebAddress(item.url) });
