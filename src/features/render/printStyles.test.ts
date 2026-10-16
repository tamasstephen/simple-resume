import { printStyles } from "./printStyles";

test("declares a full-bleed A4 sheet and hides the app chrome", () => {
  expect(printStyles).toContain("@media print");
  expect(printStyles).toContain("@page");
  expect(printStyles).toContain("size: A4");
  expect(printStyles).toContain("margin: 0");
  expect(printStyles).toContain(".app-header, .editor-pane, .section-rail");
  expect(printStyles).toContain("display: none");
  expect(printStyles).toContain(".app-shell");
  expect(printStyles).toContain("display: block");
});

test("resets the preview containers so only the sheets print", () => {
  expect(printStyles).toContain(".preview-pane");
  expect(printStyles).toContain("overflow: visible");
  expect(printStyles).toContain(".preview-scroll");
  expect(printStyles).toContain("height: auto");
  // The pane's 24px block padding must not survive into print: it pushes the
  // first page box past the bottom of the sheet, spilling a blank page and
  // clipping the page number (verified via print-to-PDF reproduction).
  expect(printStyles).toContain(".preview-scroll { overflow: visible; height: auto; padding: 0; }");
  expect(printStyles).toContain(".preview-pages");
  expect(printStyles).toContain("transform: none !important");
  expect(printStyles).toContain(".pagedjs_page");
  expect(printStyles).toContain("box-shadow: none");
  expect(printStyles).toContain("background: #fff");
});

test("suppresses Paged.js's trailing forced break on the last sheet", () => {
  // Paged.js injects page-break-after: always / break-after: page on EVERY
  // .pagedjs_page, including the last — the forced break after the final
  // sheet emits a trailing blank page in Chrome's print-to-PDF.
  expect(printStyles).toContain(".pagedjs_page:last-child");
  expect(printStyles).toContain("page-break-after: auto");
  expect(printStyles).toContain("break-after: auto");
});

test("does not duplicate the print rules Paged.js injects itself", () => {
  // Verified live: Paged.js's Previewer injects html/body margin zeroing +
  // print-color-adjust: exact, .pagedjs_pages { transform: none !important;
  // overflow: visible }, and .pagedjs_page { margin: 0; padding: 0;
  // page-break-after: always; break-after: page } into @media print. Guard
  // against re-declaring THOSE exact rules — targeted overrides (the
  // :last-child break suppression) are corrections, not duplication.
  expect(printStyles).not.toContain("print-color-adjust");
  expect(printStyles).not.toContain(".pagedjs_pages");
  expect(printStyles).not.toContain("break-after: page");
  expect(printStyles).not.toContain("page-break-after: always");
  expect(printStyles).not.toContain(".pagedjs_page { margin");
  expect(printStyles).not.toContain(".pagedjs_page { padding");
});
