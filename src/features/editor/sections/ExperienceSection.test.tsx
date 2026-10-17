import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperienceSection } from "./ExperienceSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";
import { emptyResume, type Resume } from "../../../lib/schema/resume";

function renderSection(resume?: Resume) {
  const persistence = new InMemoryPersistence();
  if (resume !== undefined) persistence.save(resume);
  render(
    <ResumeProvider persistence={persistence}>
      <ExperienceSection />
    </ResumeProvider>,
  );
}

async function fillRole({
  role = "Engineer",
  company = "Acme",
  startDate = "03/2020",
  isCurrent = true,
}: {
  role?: string;
  company?: string;
  startDate?: string;
  isCurrent?: boolean;
} = {}) {
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  if (role !== "") await userEvent.type(screen.getByLabelText("Job title"), role);
  if (company !== "") await userEvent.type(screen.getByLabelText("Company"), company);
  if (startDate !== "") await userEvent.type(screen.getByLabelText("Start date"), startDate);
  if (isCurrent)
    await userEvent.click(screen.getByRole("checkbox", { name: "I currently work here" }));
}

test("add flow: a complete role saves to the list and closes the dialog", async () => {
  renderSection();
  await fillRole();
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Engineer")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("asks for the job title before the company, the way the entry reads", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  const labels = [...screen.getByRole("dialog").querySelectorAll("label")].map((label) =>
    (label.textContent ?? "").trim(),
  );
  expect(labels.indexOf("Job title")).toBeGreaterThan(-1);
  expect(labels.indexOf("Job title")).toBeLessThan(labels.indexOf("Company"));
});

test("required fields say so to assistive tech", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  expect(screen.getByLabelText("Job title")).toHaveAttribute("aria-required", "true");
  expect(screen.getByLabelText("Location")).not.toHaveAttribute("aria-required");
});

test("“I currently work here” disables the end date and shows Present", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.click(screen.getByRole("checkbox", { name: "I currently work here" }));
  const endDate = screen.getByLabelText("End date");
  expect(endDate).toBeDisabled();
  expect(endDate).toHaveAttribute("placeholder", "Present");
});

test("a saved entry shows the job title as title and company and location as subtitle", async () => {
  renderSection();
  await fillRole();
  await userEvent.type(screen.getByLabelText("Location"), "Berlin");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("Engineer")).toBeInTheDocument();
  expect(screen.getByText("Acme · Berlin")).toBeInTheDocument();
});

test("leaving a required field empty flags it on blur, not while typing elsewhere", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  expect(screen.getByLabelText("Job title")).not.toHaveAttribute("aria-invalid");
  await userEvent.tab();
  expect(screen.getByLabelText("Job title")).toHaveAccessibleDescription("Add a job title.");
  expect(screen.getByLabelText("Company")).not.toHaveAttribute("aria-invalid");
});

test("a blocked save keeps the dialog open, summarises and focuses the first problem", async () => {
  renderSection();
  await fillRole({ startDate: "" });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("1 field needs attention");
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Fix the start date before saving this experience.",
  );
  const startDate = screen.getByLabelText("Start date");
  expect(startDate).toHaveAccessibleDescription("Choose a start month and year.");
  expect(startDate).toHaveFocus();
  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
});

test("an unfinished role without an end date needs one", async () => {
  renderSection();
  await fillRole({ isCurrent: false });
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByLabelText("End date")).toHaveAccessibleDescription(
    "Choose an end month and year, or tick “I currently work here”.",
  );
});

test("the month picker writes the chosen month into the field", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.click(screen.getByRole("button", { name: "Choose start date" }));
  await userEvent.click(screen.getByRole("button", { name: "Previous year" }));
  const lastYear = new Date().getFullYear() - 1;
  await userEvent.click(screen.getByRole("button", { name: `March ${lastYear}` }));
  expect(screen.getByLabelText("Start date")).toHaveValue(`Mar ${lastYear}`);
  expect(screen.getByRole("button", { name: "Choose start date" })).toHaveFocus();
});

test("Escape in the month picker closes only the picker", async () => {
  renderSection();
  await userEvent.click(screen.getByRole("button", { name: "Add experience" }));
  await userEvent.click(screen.getByRole("button", { name: "Choose start date" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("button", { name: "Previous year" })).not.toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: "Add work experience" })).toBeInTheDocument();
});

test("Cancel on an untouched form closes it and returns focus to Add", async () => {
  renderSection();
  const addButton = screen.getByRole("button", { name: "Add experience" });
  await userEvent.click(addButton);
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(addButton).toHaveFocus();
});

test("Cancel with edits asks before discarding them", async () => {
  renderSection();
  await fillRole();
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("dialog", { name: "Discard your changes?" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.getByLabelText("Job title")).toHaveValue("Engineer");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await userEvent.click(screen.getByRole("button", { name: "Discard" }));
  expect(screen.queryByRole("dialog", { name: "Add work experience" })).not.toBeInTheDocument();
});

test("a saved role that breaks a rule is flagged in the list with what to check", () => {
  const resume = emptyResume();
  resume.experience = [
    {
      id: "1",
      company: "Lumen Studio",
      role: "Frontend Developer",
      startDate: "",
      endDate: "06/2018",
      current: false,
      location: "",
      description: "",
    },
  ];
  renderSection(resume);
  const row = screen.getByRole("listitem");
  expect(row).toHaveClass("entry--invalid");
  expect(row).toHaveTextContent("Check the start date");
  expect(row).not.toHaveTextContent("Lumen Studio");
});
