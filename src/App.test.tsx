import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders editor and preview panes", () => {
  render(<App />);
  expect(screen.getByRole("region", { name: "Editor" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Preview" })).toBeInTheDocument();
});
