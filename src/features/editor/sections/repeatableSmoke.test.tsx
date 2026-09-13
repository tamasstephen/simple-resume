import { render, screen } from "@testing-library/react";
import { CertificationsSection } from "./CertificationsSection";
import { LanguagesSection } from "./LanguagesSection";
import { LinksSection } from "./LinksSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

// The heading names the section; the add action names one item.
test.each([
  ["Certifications", "certification", <CertificationsSection key="c" />],
  ["Languages", "language", <LanguagesSection key="l" />],
  ["Links", "link", <LinksSection key="k" />],
])("%s section renders its heading and an Add button", (title, noun, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: `Add ${noun}` })).toBeInTheDocument();
});
