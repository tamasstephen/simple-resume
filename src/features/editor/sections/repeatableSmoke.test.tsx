import { render, screen } from "@testing-library/react";
import { CertificationsSection } from "./CertificationsSection";
import { LanguagesSection } from "./LanguagesSection";
import { LinksSection } from "./LinksSection";
import { SECTIONS } from "../sectionMeta";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

// The heading names the section; the add action names one item.
test.each([
  ["Certifications", "certification", <CertificationsSection key="c" />],
  ["Languages", "language", <LanguagesSection key="l" />],
  ["Links", "link", <LinksSection key="k" />],
])("%s section renders its heading and an Add button", (title, noun, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  const headline = SECTIONS.find((section) => section.name === title)?.headline;
  expect(screen.getByRole("region", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: headline })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: `Add ${noun}` })).toBeInTheDocument();
});
