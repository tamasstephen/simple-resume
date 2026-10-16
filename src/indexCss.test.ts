import css from "./index.css?raw";
import tokens from "./styles/tokens.css?raw";

test("drops the retired paper-and-ink tokens and the serif face", () => {
  expect(css).not.toMatch(/--paper|--ink\b|--font-serif|IBM Plex Serif/);
});

test("styles the editor from the shared design-system tokens", () => {
  expect(css).toContain("var(--color-text)");
  expect(css).toContain("var(--radius-control)");
  expect(css).toContain("var(--color-focus)");
  expect(css).toContain("color-mix(in srgb, var(--color-focus) 20%, transparent)");
});

test("defines no colour tokens of its own", () => {
  expect(css).not.toMatch(/--color-[a-z-]+\s*:/);
});

test("still resets #root for print", () => {
  expect(css).toMatch(/@media print\s*{\s*#root\s*{[^}]*display:\s*block/);
});

test("tokens.css carries the design-system colours the editor needs", () => {
  const names = [
    "--color-text-disabled",
    "--color-focus",
    "--color-danger",
    "--color-danger-surface",
    "--color-warning",
    "--color-warning-surface",
    "--color-scrim",
  ];
  names.forEach((name) => expect(tokens).toMatch(new RegExp(`${name}\\s*:`)));
});
