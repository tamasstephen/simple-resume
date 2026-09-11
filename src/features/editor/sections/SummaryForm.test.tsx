import { render, screen } from "@testing-library/react";
import { SummaryForm } from "./SummaryForm";
import { ResumeProvider } from "../../resume/ResumeProvider";
import { useResumeState } from "../../resume/useResume";
import { InMemoryPersistence } from "../../../lib/persistence/InMemoryPersistence";

function CommittedSummary() {
  return <span data-testid="committed-summary">{useResumeState().committed.summary.text}</span>;
}

test("renders a Save control and the summary rich-text field", () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <SummaryForm />
      <CommittedSummary />
    </ResumeProvider>,
  );
  expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  expect(screen.getByLabelText("Summary text")).toBeInTheDocument();
});
