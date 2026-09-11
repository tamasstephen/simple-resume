import { printStyles } from "./printStyles";

test("declares a full-bleed A4 sheet and hides the app chrome", () => {
  expect(printStyles).toContain("@media print");
  expect(printStyles).toContain("@page");
  expect(printStyles).toContain("size: A4");
  expect(printStyles).toContain("margin: 0");
  expect(printStyles).toContain(".app-header, .editor-pane");
  expect(printStyles).toContain("display: none");
  expect(printStyles).toContain(".app-shell");
  expect(printStyles).toContain("display: block");
});

test("resets the preview containers so only the sheets print", () => {
  expect(printStyles).toContain(".preview-pane");
  expect(printStyles).toContain("overflow: visible");
  expect(printStyles).toContain(".preview-scroll");
  expect(printStyles).toContain("height: auto");
  expect(printStyles).toContain(".preview-pages");
  expect(printStyles).toContain("transform: none !important");
  expect(printStyles).toContain(".pagedjs_page");
  expect(printStyles).toContain("box-shadow: none");
  expect(printStyles).toContain("background: #fff");
});

test("does not duplicate the print rules Paged.js injects itself", () => {
  // Verified live: Paged.js's Previewer injects html/body margin zeroing +
  // print-color-adjust: exact, .pagedjs_pages { transform: none !important;
  // overflow: visible }, and .pagedjs_page { margin: 0; padding: 0;
  // page-break-after: always; break-after: page } into @media print.
  expect(printStyles).not.toContain("print-color-adjust");
  expect(printStyles).not.toContain(".pagedjs_pages");
  expect(printStyles).not.toContain("break-after: page");
  expect(printStyles).not.toContain("page-break-after");
  expect(printStyles).not.toContain("padding: 0");
});
