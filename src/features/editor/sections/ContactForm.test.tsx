import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { useResumeState } from "../../resume/useResume";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function CommittedName() {
  return <span data-testid="committed-name">{useResumeState().committed.contact.name}</span>;
}

test("typing does not change committed state until Save", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
      <CommittedName />
    </ResumeProvider>,
  );
  await userEvent.type(screen.getByLabelText(/name/i), "Ada");
  expect(screen.getByTestId("committed-name").textContent).toBe("");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(screen.getByTestId("committed-name").textContent).toBe("Ada");
});
