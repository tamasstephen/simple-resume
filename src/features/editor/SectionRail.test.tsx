import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionRail } from "./SectionRail";
import { Editor } from "./Editor";
import { SECTIONS, type SectionId } from "./sectionMeta";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";

test("lists the nine sections as anchor links with number and name", () => {
  render(<SectionRail activeId={null} onSelect={() => {}} />);
  const links = within(screen.getByRole("navigation", { name: "Sections" })).getAllByRole("link");
  expect(links).toHaveLength(9);
  SECTIONS.forEach((section, index) => {
    expect(links[index]).toHaveAttribute("href", `#section-${section.id}`);
    expect(links[index]).toHaveTextContent(`${section.number}${section.name}`);
  });
});

test("marks only the active section as the current location", () => {
  render(<SectionRail activeId="experience" onSelect={() => {}} />);
  const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveAttribute("aria-current", "location");
  expect(current[0]).toHaveTextContent("Experience");
});

test("clicking a link focuses that section's heading", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SectionRail activeId={null} onSelect={() => {}} />
      <Editor />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("link", { name: /Skills/ }));
  expect(screen.getByRole("heading", { name: "What you’re good at" })).toHaveFocus();
});

function StatefulRail() {
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  return <SectionRail activeId={activeId} onSelect={setActiveId} />;
}

test("clicking a link makes that section the current one", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <StatefulRail />
      <Editor />
    </ResumeProvider>,
  );
  const link = screen.getByRole("link", { name: /Languages/ });
  await userEvent.click(link);
  expect(link).toHaveAttribute("aria-current", "location");
});

test("each link carries its name as a title for the collapsed rail", () => {
  render(<SectionRail activeId={null} onSelect={() => {}} />);
  expect(screen.getByRole("link", { name: /Languages/ })).toHaveAttribute("title", "Languages");
});
