import { render, screen } from "@testing-library/react";
import { EducationSection } from "./EducationSection";
import { ProjectsSection } from "./ProjectsSection";
import { SECTIONS } from "../sectionMeta";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test.each([
  ["Education", "education", <EducationSection key="e" />],
  ["Projects", "project", <ProjectsSection key="p" />],
])("%s section renders its heading and an Add button", (title, noun, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  const headline = SECTIONS.find((section) => section.name === title)?.headline;
  expect(screen.getByRole("region", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: headline })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: `Add ${noun}` })).toBeInTheDocument();
});
