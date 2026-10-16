import css from "./index.css?raw";

test("drops the retired paper-and-ink tokens and the serif face", () => {
  expect(css).not.toMatch(/--paper|--ink\b|--font-serif|IBM Plex Serif/);
});

test("styles the editor from the shared design-system tokens", () => {
  expect(css).toContain("var(--color-text)");
  expect(css).toContain("var(--radius-control)");
  expect(css).toContain("var(--color-focus)");
});

test("still resets #root for print", () => {
  expect(css).toMatch(/@media print\s*{\s*#root\s*{[^}]*display:\s*block/);
});
