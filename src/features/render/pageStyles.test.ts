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

// The links line is a second line of the contact block, not a row of its own:
// same size, same ink, no gap between them.
test("gives the links line the contact line's treatment", () => {
  const shared = /\.resume-contact,\s*\.resume-links\s*\{([^}]*)\}/.exec(pageStyles)?.[1] ?? "";
  expect(shared).toContain("margin: 0");
});

// A user's bold inside a description renders at body size and weight 700.
// Arial ships only 400 and 700, so an entry title cannot out-rank it by
// weight — it has to be bigger.
test("sets entry titles larger than body text so in-body bold cannot rival them", () => {
  const body = declaredPt(".resume-root", "font-size");
  const entryTitle = declaredPt(".resume-entry-title", "font-size");
  expect(body).toBeGreaterThan(0);
  expect(entryTitle).toBeGreaterThan(body ?? 0);
});

test("leaves a certification name at body size, bold only", () => {
  const rule = /\.resume-cert-name\s*\{([^}]*)\}/.exec(pageStyles)?.[1] ?? "";
  expect(rule).toContain("font-weight: 700");
  expect(declaredPt(".resume-cert-name", "font-size")).toBeNull();
});
