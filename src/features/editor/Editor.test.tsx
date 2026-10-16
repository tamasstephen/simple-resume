import { render, screen } from "@testing-library/react";
import { Editor } from "./Editor";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";

// Links render in the resume header (next to email/phone), so the editor
// lists them right after Contact — the editor order mirrors the document.
test("renders every section heading in order", () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Editor />
    </ResumeProvider>,
  );
  const expected = [
    "How to reach you",
    "Where to find you online",
    "Your story in brief",
    "Where you’ve worked",
    "What you studied",
    "What you’re good at",
    "Things you’ve built",
    "Proof on paper",
    "Languages you speak",
  ];
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual(expected);
});
