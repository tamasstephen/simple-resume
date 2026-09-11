import { render, screen } from "@testing-library/react";
import { CertificationsSection } from "./CertificationsSection";
import { LanguagesSection } from "./LanguagesSection";
import { LinksSection } from "./LinksSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test.each([
  ["Certifications", <CertificationsSection key="c" />],
  ["Languages", <LanguagesSection key="l" />],
  ["Links", <LinksSection key="k" />],
])("%s section renders its heading and an Add button", (title, node) => {
  render(<ResumeProvider persistence={new InMemoryPersistence()}>{node}</ResumeProvider>);
  expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: new RegExp(`add ${title}`, "i") })).toBeInTheDocument();
});
