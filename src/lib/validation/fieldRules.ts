import { toSafeHref } from "../safeUrl";

/** A field rule returns the message telling the writer how to fix the value,
 *  or null when it is fine. Every rule here accepts an empty value: whether a
 *  field is required is the section's call, not the format's. */
export type FieldRule = (value: string) => string | null;

export interface MonthYear {
  year: number;
  /** 1–12. */
  month: number;
}

export const MESSAGES = {
  jobTitleRequired: "Add a job title.",
  companyRequired: "Add a company.",
  startDateRequired: "Choose a start month and year.",
  endDateRequired: "Choose an end month and year, or tick “I currently work here”.",
  institutionRequired: "Add a school or university.",
  skillRequired: "Add a skill.",
  languageRequired: "Add a language.",
  certificationRequired: "Add a certification name.",
  projectRequired: "Add a project name.",
  linkRequired: "Add a web address.",
  email: "Enter a full email address, like name@example.com.",
  phoneCharacters: "Use digits, spaces and + ( ) - . only.",
  phoneLength: "Enter 7 to 15 digits.",
  monthYear: "Use month and year, like 03/2020 or Mar 2020.",
  endBeforeStart: "End date can’t be before the start date.",
  webAddress: "Enter a web address, like github.com/you.",
};

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const NUMERIC_MONTH_YEAR = /^(\d{1,2})\s*\/\s*(\d{4})$/;
const NAMED_MONTH_YEAR = /^([a-z]+)\.?,?\s+(\d{4})$/i;
// One "@", no spaces, and a dot-separated domain ending in 2+ letters.
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const PHONE_CHARACTERS = /^\+?[\d\s().-]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

function monthFromName(name: string): number | null {
  const lower = name.toLowerCase();
  // "Sept" is the one common abbreviation longer than three letters.
  if (lower === "sept") return 9;
  if (lower.length < 3) return null;
  const index = MONTH_NAMES.findIndex((month) => month.startsWith(lower));
  return index === -1 ? null : index + 1;
}

function readMonthAndYear(trimmed: string): { month: number | null; year: number } | null {
  const numeric = NUMERIC_MONTH_YEAR.exec(trimmed);
  if (numeric !== null) return { month: Number(numeric[1]), year: Number(numeric[2]) };
  const named = NAMED_MONTH_YEAR.exec(trimmed);
  if (named === null || named[1] === undefined) return null;
  return { month: monthFromName(named[1]), year: Number(named[2]) };
}

/** Reads an en-US month and year — "03/2020", "3/2020", "Mar 2020",
 *  "March 2020" — or null when the value is not one. */
export function parseMonthYear(raw: string): MonthYear | null {
  const parts = readMonthAndYear(raw.trim());
  if (parts === null || parts.month === null) return null;
  if (parts.month < 1 || parts.month > 12) return null;
  return { year: parts.year, month: parts.month };
}

/** "Jan 2022": the form the month picker writes, and one `parseMonthYear` reads. */
export function formatMonthYear({ year, month }: MonthYear): string {
  const name = MONTH_NAMES[month - 1] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1, 3)} ${year}`;
}

export function isMonthYearBefore(earlier: MonthYear, later: MonthYear): boolean {
  return earlier.year * 12 + earlier.month < later.year * 12 + later.month;
}

export const validateMonthYear: FieldRule = (value) => {
  if (value.trim().length === 0) return null;
  return parseMonthYear(value) === null ? MESSAGES.monthYear : null;
};

export const validateEmail: FieldRule = (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return EMAIL.test(trimmed) ? null : MESSAGES.email;
};

export const validatePhone: FieldRule = (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (!PHONE_CHARACTERS.test(trimmed)) return MESSAGES.phoneCharacters;
  const digitCount = trimmed.replace(/\D/g, "").length;
  if (digitCount < MIN_PHONE_DIGITS || digitCount > MAX_PHONE_DIGITS) return MESSAGES.phoneLength;
  return null;
};

/** A link the resume can print: an http(s) or mailto address whose host has
 *  a dot, so "github" alone (which a browser would take as https://github/)
 *  is caught while it is still a typo. */
export const validateWebAddress: FieldRule = (value) => {
  if (value.trim().length === 0) return null;
  const href = toSafeHref(value);
  if (href === null) return MESSAGES.webAddress;
  const url = new URL(href);
  if (url.protocol === "mailto:") return validateEmail(url.pathname);
  return url.hostname.includes(".") ? null : MESSAGES.webAddress;
};
