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
