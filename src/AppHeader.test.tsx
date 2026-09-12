import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "./AppHeader";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the wordmark, meta label, and Export PDF button", () => {
  render(<AppHeader pageCount={2} />);
  expect(screen.getByText("Simple Resume")).toBeInTheDocument();
  expect(screen.getByText("A4 — 2 pages")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
});

test("counts pages in the singular, and says only the format before the first run", () => {
  const { rerender } = render(<AppHeader pageCount={1} />);
  expect(screen.getByText("A4 — 1 page")).toBeInTheDocument();
  rerender(<AppHeader pageCount={0} />);
  expect(screen.getByText("A4")).toBeInTheDocument();
});

test("Export PDF opens the browser's native print dialog exactly once", async () => {
  // jsdom's window.print is a not-implemented stub; replace it globally for
  // the test (window === globalThis in the jsdom environment).
  const printSpy = vi.fn();
  vi.stubGlobal("print", printSpy);
  render(<AppHeader pageCount={1} />);
  await userEvent.click(screen.getByRole("button", { name: "Export PDF" }));
  expect(printSpy).toHaveBeenCalledTimes(1);
});
