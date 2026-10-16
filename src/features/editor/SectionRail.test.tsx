import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionRail } from "./SectionRail";
import { Editor } from "./Editor";
import { SECTIONS } from "./sectionMeta";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";

test("lists the nine sections as anchor links with number and name", () => {
  render(<SectionRail activeId={null} />);
  const links = within(screen.getByRole("navigation", { name: "Sections" })).getAllByRole("link");
  expect(links).toHaveLength(9);
  SECTIONS.forEach((section, index) => {
    expect(links[index]).toHaveAttribute("href", `#section-${section.id}`);
    expect(links[index]).toHaveTextContent(`${section.number}${section.name}`);
  });
});

test("marks only the active section as the current location", () => {
  render(<SectionRail activeId="experience" />);
  const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveAttribute("aria-current", "location");
  expect(current[0]).toHaveTextContent("Experience");
});

test("clicking a link focuses that section's heading", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SectionRail activeId={null} />
      <Editor />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("link", { name: /Skills/ }));
  expect(screen.getByRole("heading", { name: "What you’re good at" })).toHaveFocus();
});
