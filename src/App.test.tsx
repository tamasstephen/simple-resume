import { render, screen } from "@testing-library/react";
import App from "./App";

// App now mounts Preview, which loads Paged.js; mock it so the smoke test stays
// pristine and free of jsdom layout errors.
vi.mock("pagedjs", () => {
  class Previewer {
    preview = vi.fn().mockResolvedValue({ total: 1 });
  }
  return { Previewer };
});

test("renders editor and preview panes", () => {
  render(<App />);
  expect(screen.getByRole("region", { name: "Editor" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument();
});
