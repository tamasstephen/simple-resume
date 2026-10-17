import { countSectionErrors } from "./sectionErrors";
import { emptyResume } from "../../lib/schema/resume";

test("an empty resume has nothing to fix", () => {
  const counts = countSectionErrors(emptyResume());
  expect(Object.values(counts).every((count) => count === 0)).toBe(true);
});

test("counts invalid fields across a section's saved entries", () => {
  const resume = emptyResume();
  resume.contact.email = "yep@";
  resume.experience = [
    {
      id: "1",
      company: "Lumen Studio",
      role: "Frontend Developer",
      startDate: "",
      endDate: "2018-06",
      current: false,
      location: "",
      description: "",
    },
  ];
  expect(countSectionErrors(resume)).toMatchObject({ contact: 1, experience: 2, links: 0 });
});
