import { resumeSchema, emptyResume, SCHEMA_VERSION } from "./resume";

test("emptyResume is a valid resume with defaults", () => {
  const resume = emptyResume();
  expect(resume.schemaVersion).toBe(SCHEMA_VERSION);
  expect(resume.template).toBe("minimal");
  expect(resume.experience).toEqual([]);
  expect(resumeSchema.safeParse(resume).success).toBe(true);
});

test("rejects an invalid template value", () => {
  const bad = { ...emptyResume(), template: "fancy" };
  expect(resumeSchema.safeParse(bad).success).toBe(false);
});

test("rejects a non-string contact email type", () => {
  const bad = { ...emptyResume(), contact: { ...emptyResume().contact, email: 42 } };
  expect(resumeSchema.safeParse(bad).success).toBe(false);
});

test("accepts a populated experience item", () => {
  const resume = {
    ...emptyResume(),
    experience: [
      {
        id: "e1",
        company: "Acme",
        role: "Engineer",
        startDate: "2020",
        endDate: "2022",
        current: false,
        location: "Remote",
        description: "<p>Built things</p>",
      },
    ],
  };
  expect(resumeSchema.safeParse(resume).success).toBe(true);
});
