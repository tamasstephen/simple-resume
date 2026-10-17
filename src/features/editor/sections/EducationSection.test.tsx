import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationSection } from "./EducationSection";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

async function addEntry(fields: Readonly<Record<string, string>>) {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <EducationSection />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /add education/i }));
  for (const [label, value] of Object.entries(fields)) {
    await userEvent.type(screen.getByLabelText(new RegExp(`^${label}`, "i")), value);
  }
  await userEvent.click(screen.getByRole("button", { name: /^save$/i }));
}

test("degree is the title; subtitle joins institution and field", async () => {
  await addEntry({ Institution: "MIT", Degree: "BSc", "Field of study": "Physics" });
  const row = screen.getByRole("listitem");
  expect(row.querySelector(".entry__summary")).toHaveTextContent("BSc");
  expect(row.querySelector(".entry__subtitle")).toHaveTextContent("MIT · Physics");
});

test("without a degree the institution is the title and the subtitle is the field", async () => {
  await addEntry({ Institution: "MIT", "Field of study": "Physics" });
  const row = screen.getByRole("listitem");
  expect(row.querySelector(".entry__summary")).toHaveTextContent("MIT");
  expect(row.querySelector(".entry__subtitle")).toHaveTextContent(/^Physics$/);
});
