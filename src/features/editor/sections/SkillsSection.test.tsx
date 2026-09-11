import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsSection } from "./SkillsSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function renderSection() {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SkillsSection />
    </ResumeProvider>,
  );
}

test("add flow: typing does not add to the list until Save", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  await userEvent.type(screen.getByLabelText(/skill name/i), "TypeScript");
  expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByText("TypeScript")).toBeInTheDocument();
});

test("delete removes a saved skill", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  await userEvent.type(screen.getByLabelText(/skill name/i), "Go");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  await userEvent.click(screen.getByRole("button", { name: "Item actions" }));
  await userEvent.click(screen.getByRole("menuitem", { name: /delete/i }));
  expect(screen.queryByText("Go")).not.toBeInTheDocument();
});

test("Save is disabled until the name is non-empty", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: /add skills/i }));
  expect(screen.getByRole("button", { name: /^save$/i })).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/skill name/i), "Rust");
  expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
});
