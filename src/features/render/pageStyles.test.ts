import { pageStyles } from "./pageStyles";

test("declares A4 page, avoids breaking entries, and numbers pages", () => {
  expect(pageStyles).toContain("size: A4");
  expect(pageStyles).toContain("break-inside: avoid");
  expect(pageStyles).toContain("counter(page)");
});

// Regression: a bare section title is a legal break point for Paged.js, so
// "Projects"/"Skills"/"Languages" could be stranded alone at the bottom of a
// page with their content on the next one (reproduced in 20 of 125 content
// permutations in a live Paged.js sweep).
test("keeps a section title on the same page as the content it introduces", () => {
  const titleRule = /\.resume-section-title\s*\{[^}]*\}/.exec(pageStyles)?.[0] ?? "";
  expect(titleRule).toContain("break-after: avoid");
});

// Header links are anchors now; the browser default (blue, underlined) would
// break the document's monochrome print palette.
test("styles header link anchors in the document ink, not browser blue", () => {
  const linkRule = /\.resume-link\s*\{[^}]*\}/.exec(pageStyles)?.[0] ?? "";
  expect(linkRule).toContain("color: inherit");
  expect(linkRule).toContain("text-decoration: underline");
});

/** Reads a length declaration (in pt) out of the stylesheet's rule for a selector. */
function declaredPt(selector: string, property: string): number | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(pageStyles)?.[1];
  if (rule === undefined) return null;
  const value = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([\\d.]+)pt`).exec(rule)?.[1];
  return value === undefined ? null : Number(value);
}

// Vertical rhythm has to encode grouping. Rich-text paragraphs previously had
// no margin of their own, so they fell back to the UA's 1em (14px) and left a
// bigger gap between two paragraphs of one job than between two jobs.
test("spaces paragraphs tighter than entries, and entries tighter than sections", () => {
  const paragraph = declaredPt(".resume-rich p", "margin-bottom");
  const entry = declaredPt(".resume-entry", "margin-bottom");
  const section = declaredPt(".resume-section", "margin-top");
  expect(paragraph).toBeGreaterThan(0);
  expect(paragraph).toBeLessThan(entry ?? 0);
  expect(entry).toBeLessThan(section ?? 0);
});
