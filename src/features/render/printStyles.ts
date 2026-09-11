// Print CSS for the native print-to-PDF export (S12). Paged.js's Previewer
// injects its OWN @media print block into the document (verified live):
// html/body margin zeroing + print-color-adjust: exact, .pagedjs_pages
// { transform: none !important; overflow: visible }, .pagedjs_page
// { margin: 0; padding: 0; page-break-after: always; break-after: page }.
// This block deliberately does NOT duplicate those — it adds only what
// Paged.js cannot know: this app's chrome and preview-only styling.
export const printStyles = `
@media print {
  /* Full-bleed sheets: Paged.js page boxes are 210x297mm with the resume's
     18mm/16mm margins baked INSIDE as .pagedjs_margin areas. Browser-default
     sheet margins would shrink the printable area and the boxes would not
     fit the page. */
  @page { size: A4; margin: 0; }
  body { background: #fff; }
  .app-header, .editor-pane { display: none; }
  .app-shell { display: block; height: auto; }
  .preview-pane { overflow: visible; border: 0; background: none; }
  /* Class-vs-class overrides: this <style> renders inside #root, after
     index.css in <head>, so document order wins without !important. Only
     the inline scale transform needs !important (inline beats stylesheets).
     The pane's 24px block padding MUST also be reset: it offsets the first
     page box past the bottom of the sheet, spilling a blank page and
     clipping the page number (verified via print-to-PDF reproduction). */
  .preview-scroll { overflow: visible; height: auto; padding: 0; }
  /* Off-screen chunking stage (only attached mid-run): never printable. */
  .preview-stage { display: none; }
  /* The sizer carries the screen-only scaled dimensions inline (beaten only
     by !important) and clips the pages layer; in print both must open up so
     the unscaled page boxes flow across sheets. */
  .preview-sizer { width: auto !important; height: auto !important; overflow: visible; }
  .preview-pages { transform: none !important; position: static; }
  .pagedjs_page { box-shadow: none; }
  /* Paged.js forces a break after EVERY page box, including the last —
     the trailing forced break emits a blank final sheet. :last-child
     outranks Paged.js's .pagedjs_page rule, so no !important is needed. */
  .pagedjs_page:last-child { page-break-after: auto; break-after: auto; }
}
`;
