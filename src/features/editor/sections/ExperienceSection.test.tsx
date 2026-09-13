import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperienceSection } from "./ExperienceSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

test("add flow: fill text fields, Save commits the entry to the list", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /add experience/i }));
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
  expect(screen.queryByText(/Acme/)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByText(/Acme/)).toBeInTheDocument();
});

test("Save is disabled until company or role is provided", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /add experience/i }));
  expect(screen.getByRole("button", { name: /^save$/i })).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
});

test("asks for the role before the company, the way the entry reads", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  const labels = [...screen.getByRole("dialog").querySelectorAll("label")].map((l) =>
    (l.textContent ?? "").trim(),
  );
  expect(labels.indexOf("Role")).toBeLessThan(labels.indexOf("Company"));
});

test("names the current-role checkbox the way a person would say it", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  expect(screen.getByRole("checkbox", { name: "I work here now" })).toBeInTheDocument();
});
