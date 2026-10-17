import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { useResumeState } from "../../resume/useResume";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../../lib/schema/resume";

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

test("an unfinished email blocks Save, explains the fix and gets focus", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
      <CommittedName />
    </ResumeProvider>,
  );
  await userEvent.type(screen.getByLabelText("Name"), "Ada");
  await userEvent.type(screen.getByLabelText("Email"), "yep@");
  await userEvent.click(screen.getByRole("button", { name: "Save contact" }));
  const email = screen.getByLabelText("Email");
  expect(screen.getByTestId("committed-name").textContent).toBe("");
  expect(email).toHaveAttribute("aria-invalid", "true");
  expect(email).toHaveAccessibleDescription("Enter a full email address, like name@example.com.");
  expect(email).toHaveFocus();
  await userEvent.type(email, "example.com");
  await userEvent.click(screen.getByRole("button", { name: "Save contact" }));
  expect(screen.getByTestId("committed-name").textContent).toBe("Ada");
});

test("a phone number with letters is flagged", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
    </ResumeProvider>,
  );
  await userEvent.type(screen.getByLabelText("Phone"), "call me");
  await userEvent.click(screen.getByRole("button", { name: "Save contact" }));
  expect(screen.getByLabelText("Phone")).toHaveAccessibleDescription(
    "Use digits, spaces and + ( ) - . only.",
  );
});

test("contact details saved before the rules existed show their errors at once", () => {
  const persistence = new InMemoryPersistence();
  const resume = emptyResume();
  resume.contact.email = "yep@";
  persistence.save(resume);
  render(
    <ResumeProvider persistence={persistence}>
      <ContactForm />
    </ResumeProvider>,
  );
  expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Email")).not.toHaveFocus();
});

function CommittedWebsite() {
  return <span data-testid="committed-website">{useResumeState().committed.contact.website}</span>;
}

test("an optional website is saved with the contact details", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
      <CommittedWebsite />
    </ResumeProvider>,
  );
  await userEvent.type(screen.getByLabelText(/^Website/), "ada.dev");
  await userEvent.click(screen.getByRole("button", { name: "Save contact" }));
  expect(screen.getByTestId("committed-website").textContent).toBe("ada.dev");
});

test("a website that is not a web address blocks Save", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <ContactForm />
      <CommittedWebsite />
    </ResumeProvider>,
  );
  const website = screen.getByLabelText(/^Website/);
  await userEvent.type(website, "adadev");
  await userEvent.click(screen.getByRole("button", { name: "Save contact" }));
  expect(screen.getByTestId("committed-website").textContent).toBe("");
  expect(website).toHaveAccessibleDescription("Enter a web address, like github.com/you.");
});
