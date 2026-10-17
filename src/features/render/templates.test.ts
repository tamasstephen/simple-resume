import { TEMPLATE_IDS, TEMPLATES } from "./templates";

// Selectors of the top-level rules, skipping @page blocks and comments.
function ruleSelectors(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < withoutComments.length; index += 1) {
    const char = withoutComments[index];
    if (char === "{" && depth++ === 0) {
      selectors.push(withoutComments.slice(start, index).trim());
    }
    if (char === "}" && --depth === 0) start = index + 1;
  }
  return selectors.filter((selector) => !selector.startsWith("@"));
}

// A switch leaves the previous template's styles in the document while the
// next one paginates; an unscoped rule would restyle the new markup, skew
// Paged.js's measurements and push content into an invisible overflow column.
test.each(TEMPLATE_IDS)("every %s style rule is scoped to its own root", (id) => {
  const root = `.resume-root--${id}`;
  const selectors = ruleSelectors(TEMPLATES[id].pageStyles).flatMap((selector) =>
    selector.split(",").map((part) => part.trim()),
  );
  expect(selectors.length).toBeGreaterThan(0);
  for (const selector of selectors) {
    expect(selector === root || selector.startsWith(`${root} `)).toBe(true);
  }
});
