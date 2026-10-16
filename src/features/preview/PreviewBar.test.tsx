import { render, screen } from "@testing-library/react";
import { PreviewBar } from "./PreviewBar";

test.each([
  [0, "PREVIEW · A4"],
  [1, "PREVIEW · A4 · 1 PAGE"],
  [2, "PREVIEW · A4 · 2 PAGES"],
])("with %i pages it reads %s", (pageCount, label) => {
  render(<PreviewBar pageCount={pageCount} />);
  expect(screen.getByText(label)).toBeInTheDocument();
});
