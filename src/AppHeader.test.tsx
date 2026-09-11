import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the wordmark, meta label, and Export PDF button", () => {
  render(<AppHeader />);
  expect(screen.getByText("Simple Resume")).toBeInTheDocument();
  expect(screen.getByText("A4 — ATS")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
});

test("Export PDF opens the browser's native print dialog exactly once", async () => {
  // jsdom's window.print is a not-implemented stub; replace it globally for
  // the test (window === globalThis in the jsdom environment).
  const printSpy = vi.fn();
  vi.stubGlobal("print", printSpy);
  render(<AppHeader />);
  await userEvent.click(screen.getByRole("button", { name: "Export PDF" }));
  expect(printSpy).toHaveBeenCalledTimes(1);
});
