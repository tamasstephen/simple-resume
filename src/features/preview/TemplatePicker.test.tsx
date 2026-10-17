import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplatePicker } from "./TemplatePicker";
import { ResumeProvider } from "../resume/ResumeProvider";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";

function renderPicker(persistence = new InMemoryPersistence()) {
  render(
    <ResumeProvider persistence={persistence}>
      <TemplatePicker />
    </ResumeProvider>,
  );
  return persistence;
}

test("offers every template with Minimal, the default, selected", () => {
  renderPicker();
  const picker = screen.getByRole("combobox", { name: "Template" });
  expect(picker).toHaveValue("minimal");
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
    "Minimal",
    "Executive",
    "ATS Classic",
  ]);
});

test("choosing a template saves it with the resume, content untouched", async () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), skills: [{ id: "s1", name: "React" }] });
  renderPicker(persistence);

  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Template" }), "Executive");

  expect(screen.getByRole("combobox", { name: "Template" })).toHaveValue("executive");
  await vi.waitFor(() => expect(persistence.load()?.template).toBe("executive"));
  expect(persistence.load()?.skills).toEqual([{ id: "s1", name: "React" }]);
});
