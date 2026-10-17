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

// The refined toolbar shows glyphs (B, I, list icons); each still needs a
// spoken name.
test("names every formatting control, whatever glyph it shows", () => {
  render(<RichTextField value="" onChange={() => {}} ariaLabel="Description" />);
  const toolbar = screen.getByRole("toolbar", { name: "Description formatting" });
  expect(
    [...toolbar.querySelectorAll("button")].map((button) => button.getAttribute("aria-label")),
  ).toEqual([
    "Description bold",
    "Description italic",
    "Description bullet list",
    "Description numbered list",
  ]);
});
