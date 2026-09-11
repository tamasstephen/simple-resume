import { render, screen } from "@testing-library/react";
import { Editor } from "./Editor";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";

test("renders every section heading in order", () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Editor />
    </ResumeProvider>,
  );
  const expected = [
    "Contact",
    "Summary",
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Certifications",
    "Languages",
    "Links",
  ];
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual(expected);
});
