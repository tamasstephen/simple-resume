import { render, screen } from "@testing-library/react";
import { EducationSection } from "./EducationSection";
import { ProjectsSection } from "./ProjectsSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test.each([
  ["Education", <EducationSection key="e" />],
  ["Projects", <ProjectsSection key="p" />],
])("%s section renders its heading and an Add button", (title, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: new RegExp(`add ${title}`, "i") })).toBeInTheDocument();
});
