import { MESSAGES } from "./fieldRules";
import {
  countErrors,
  hasErrors,
  validateContact,
  validateEducation,
  validateExperience,
  validateLink,
} from "./sectionRules";
import type { ExperienceItem } from "../schema/resume";

const ROLE: ExperienceItem = {
  id: "1",
  company: "Lumen Studio",
  role: "Frontend Developer",
  startDate: "03/2016",
  endDate: "Jun 2018",
  current: false,
  location: "",
  description: "",
};

test("a complete role has no errors", () => {
  expect(hasErrors(validateExperience(ROLE))).toBe(false);
});

test("a role needs a start date to print", () => {
  expect(validateExperience({ ...ROLE, startDate: " " }).startDate).toBe(
    MESSAGES.startDateRequired,
  );
});

test("an end date before the start date is flagged on the end date", () => {
  const errors = validateExperience({ ...ROLE, startDate: "Jul 2018", endDate: "06/2018" });
  expect(errors.endDate).toBe(MESSAGES.endBeforeStart);
  expect(countErrors(errors)).toBe(1);
});

test("a current role ignores whatever is left in the end date", () => {
  expect(hasErrors(validateExperience({ ...ROLE, current: true, endDate: "soon" }))).toBe(false);
});

test("a malformed end date reports its format, not the order", () => {
  expect(validateExperience({ ...ROLE, endDate: "2018-06" }).endDate).toBe(MESSAGES.monthYear);
});

test("education dates are optional but checked when present", () => {
  const base = { id: "1", institution: "TU Berlin", degree: "", field: "", description: "" };
  expect(hasErrors(validateEducation({ ...base, startDate: "", endDate: "" }))).toBe(false);
  expect(validateEducation({ ...base, startDate: "2015", endDate: "" }).startDate).toBe(
    MESSAGES.monthYear,
  );
});

test("contact flags an unfinished email and a phone with letters", () => {
  const errors = validateContact({
    name: "Ada",
    title: "",
    email: "yep@",
    phone: "call me",
    location: "",
  });
  expect(errors).toEqual({ email: MESSAGES.email, phone: MESSAGES.phoneCharacters });
  expect(countErrors(errors)).toBe(2);
});

test("a link needs a real web address", () => {
  expect(validateLink({ id: "1", label: "GitHub", url: "github" }).url).toBe(MESSAGES.webAddress);
});
