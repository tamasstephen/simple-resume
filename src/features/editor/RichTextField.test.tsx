import { render, screen } from "@testing-library/react";
import { RichTextField } from "./RichTextField";

test("renders a labelled editor with formatting toolbar buttons", () => {
  render(<RichTextField value="<p>hi</p>" onChange={() => {}} ariaLabel="Description" />);
  expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /bullet list/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /numbered list/i })).toBeInTheDocument();
  expect(screen.getByLabelText("Description")).toBeInTheDocument();
});

// Four buttons, one vocabulary: "B / I / • List / 1. List" mixed single
// letters with glyph-prefixed words and read like debug labels.
test("labels every formatting control with a word", () => {
  render(<RichTextField value="" onChange={() => {}} ariaLabel="Description" />);
  const toolbar = screen.getByRole("toolbar", { name: "Description formatting" });
  expect([...toolbar.querySelectorAll("button")].map((b) => b.textContent)).toEqual([
    "Bold",
    "Italic",
    "Bullets",
    "Numbers",
  ]);
});
