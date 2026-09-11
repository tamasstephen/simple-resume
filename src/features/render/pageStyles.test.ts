import { pageStyles } from "./pageStyles";

test("declares A4 page, avoids breaking entries, and numbers pages", () => {
  expect(pageStyles).toContain("size: A4");
  expect(pageStyles).toContain("break-inside: avoid");
  expect(pageStyles).toContain("counter(page)");
});
