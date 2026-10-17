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
  await userEvent.type(screen.getByLabelText("Start date"), "03/2020");
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

test("a saved entry shows the role as title and company and location as subtitle", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  await userEvent.type(screen.getByLabelText(/location/i), "Berlin");
  await userEvent.type(screen.getByLabelText("Start date"), "03/2020");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByText("Engineer")).toBeInTheDocument();
  expect(screen.getByText("Acme · Berlin")).toBeInTheDocument();
});

test("without a role the company becomes the title and no subtitle is shown", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.type(screen.getByLabelText(/company/i), "Acme");
  await userEvent.type(screen.getByLabelText("Start date"), "Mar 2020");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  const row = screen.getByRole("listitem");
  expect(row).toHaveTextContent("Acme");
  expect(row.querySelector(".entry__subtitle")).toBeNull();
});

test("cancelling the dialog returns focus to the Add button", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  const addButton = screen.getByRole("button", { name: "Add experience" });
  await userEvent.click(addButton);
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(addButton).toHaveFocus();
});

test("a save without a start date stays open, names the field and focuses it", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByRole("alert")).toHaveTextContent("1 field needs attention: Start date");
  const startDate = screen.getByLabelText("Start date");
  expect(startDate).toHaveAttribute("aria-invalid", "true");
  expect(startDate).toHaveAccessibleDescription("Required to print this role.");
  expect(startDate).toHaveFocus();
  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
});

test("fixing the field clears its error before saving again", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ExperienceSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
  await userEvent.type(screen.getByLabelText("Start date"), "Jul 2020");
  await userEvent.type(screen.getByLabelText("End date"), "06/2020");
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByRole("alert")).toHaveTextContent("End date");
  await userEvent.clear(screen.getByLabelText("End date"));
  await userEvent.type(screen.getByLabelText("End date"), "08/2020");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
  expect(screen.getByRole("listitem")).toHaveTextContent("Engineer");
});
