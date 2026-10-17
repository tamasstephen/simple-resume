import { SECTIONS, getSectionMeta, sectionAnchor } from "./sectionMeta";

test("lists the sections in the editor's document order", () => {
  expect(SECTIONS.map((section) => section.id)).toEqual([
    "contact",
    "links",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
  ]);
});

test("numbers the sections 01 to 09", () => {
  expect(SECTIONS.map((section) => section.number)).toEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
  ]);
});

test("looks a section up by id", () => {
  expect(getSectionMeta("experience").headline).toBe("Where you’ve worked");
});

test("derives the anchor id from the section id", () => {
  expect(sectionAnchor("links")).toBe("section-links");
});
