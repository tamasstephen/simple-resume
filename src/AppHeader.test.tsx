import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { InMemoryPersistence } from "./lib/persistence/InMemoryPersistence";
import { emptyResume } from "./lib/schema/resume";

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderHeader({ name = "", title = "" }: { name?: string; title?: string } = {}) {
  const persistence = new InMemoryPersistence();
  const resume = emptyResume();
  persistence.save({ ...resume, contact: { ...resume.contact, name, title } });
  return render(
    <ResumeProvider persistence={persistence}>
      <AppHeader />
    </ResumeProvider>,
  );
}

test("renders the wordmark, save status and Export PDF button", () => {
  renderHeader();
  expect(screen.getByText("Simple Resume")).toBeInTheDocument();
  expect(screen.getByText("SAVED LOCALLY")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
});

test("shows the committed name and title beside the wordmark", () => {
  renderHeader({ name: "Alex Morgan", title: "Staff Engineer" });
  expect(screen.getByText("Alex Morgan — Staff Engineer")).toBeInTheDocument();
});

test("shows only the name when there is no title", () => {
  renderHeader({ name: "Alex Morgan" });
  expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
  expect(screen.queryByText(/—/)).not.toBeInTheDocument();
});

test("shows no identity when the name is empty", () => {
  renderHeader({ title: "Staff Engineer" });
  expect(screen.queryByText(/Staff Engineer/)).not.toBeInTheDocument();
});

test("Export PDF opens the browser's native print dialog exactly once", async () => {
  // jsdom's window.print is a not-implemented stub; replace it globally for
  // the test (window === globalThis in the jsdom environment).
  const printSpy = vi.fn();
  vi.stubGlobal("print", printSpy);
  renderHeader();
  await userEvent.click(screen.getByRole("button", { name: "Export PDF" }));
  expect(printSpy).toHaveBeenCalledTimes(1);
});

// On narrow screens the preview sits thousands of pixels below the editor;
// the sticky header carries the only way back to it.
test("offers a link to the preview", () => {
  renderHeader();
  expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute("href", "#preview");
});
