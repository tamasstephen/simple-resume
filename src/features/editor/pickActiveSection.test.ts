import { pickActiveSection, type SectionPosition } from "./pickActiveSection";

const POSITIONS: readonly SectionPosition[] = [
  { id: "contact", top: -400 },
  { id: "links", top: 120 },
  { id: "summary", top: 500 },
];

test("the last section above the reading line is active", () => {
  expect(pickActiveSection({ positions: POSITIONS, readingLine: 300, isAtEnd: false })).toBe(
    "links",
  );
});

test("a section exactly on the reading line counts as reached", () => {
  expect(pickActiveSection({ positions: POSITIONS, readingLine: 120, isAtEnd: false })).toBe(
    "links",
  );
});

test("the first section is active before any has reached the line", () => {
  const below: SectionPosition[] = [
    { id: "contact", top: 200 },
    { id: "links", top: 600 },
  ];
  expect(pickActiveSection({ positions: below, readingLine: 100, isAtEnd: false })).toBe("contact");
});

test("at the end of the scroll the last section wins even below the line", () => {
  expect(pickActiveSection({ positions: POSITIONS, readingLine: 300, isAtEnd: true })).toBe(
    "summary",
  );
});

test("no sections means no active section", () => {
  expect(pickActiveSection({ positions: [], readingLine: 300, isAtEnd: true })).toBeNull();
});
