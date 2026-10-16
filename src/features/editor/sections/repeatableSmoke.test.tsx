import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

async function addLink({ label, url }: { label: string; url: string }) {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <LinksSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add link" }));
  if (label) await userEvent.type(screen.getByLabelText(/label/i), label);
  await userEvent.type(screen.getByLabelText(/url/i), url);
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  return screen.getByRole("listitem");
}

test("a labelled link shows the label as title and the url as subtitle", async () => {
  const row = await addLink({ label: "Portfolio", url: "https://x.dev" });
  expect(row.querySelector(".entry__summary")).toHaveTextContent("Portfolio");
  expect(row.querySelector(".entry__subtitle")).toHaveTextContent("https://x.dev");
});

test("an unlabelled link shows the url as title and no subtitle", async () => {
  const row = await addLink({ label: "", url: "https://x.dev" });
  expect(row.querySelector(".entry__summary")).toHaveTextContent("https://x.dev");
  expect(row.querySelector(".entry__subtitle")).toBeNull();
});
