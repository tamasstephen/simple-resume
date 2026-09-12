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
    "Contact",
    "Links",
    "Summary",
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Certifications",
    "Languages",
  ];
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual(expected);
});
