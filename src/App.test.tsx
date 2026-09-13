import { render, screen } from "@testing-library/react";
import App from "./App";
import { printStyles } from "./features/render/printStyles";

// App now mounts Preview, which loads Paged.js; mock it so the smoke test stays
// pristine and free of jsdom layout errors.
vi.mock("pagedjs", () => {
  class Previewer {
    // Mount two page boxes so the header's page counter has something real to
    // report; the app wires Preview -> AppHeader through App state.
    preview = vi.fn((_html: unknown, _styles: unknown, target: HTMLElement) => {
      for (let index = 0; index < 2; index++) {
        const page = document.createElement("div");
        page.className = "pagedjs_page";
        target.appendChild(page);
      }
      return Promise.resolve({ total: 2 });
    });
  }
  return { Previewer };
});

test("renders editor and preview panes", () => {
  render(<App />);
  expect(screen.getByRole("region", { name: "Editor" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument();
});

test("mounts the print stylesheet for native PDF export", () => {
  const { container } = render(<App />);
  const style = container.querySelector("style");
  expect(style?.textContent).toBe(printStyles);
});

test("the header reports the page count the preview produced", async () => {
  render(<App />);
  expect(await screen.findByText("A4 — 2 pages")).toBeInTheDocument();
});

test("the preview pane is an anchor target for the header link", () => {
  const { container } = render(<App />);
  expect(container.querySelector("#preview")).toHaveAttribute("aria-label", "Preview");
});
