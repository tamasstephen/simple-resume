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
     the inline scale transform needs !important (inline beats stylesheets). */
  .preview-scroll { overflow: visible; height: auto; }
  .preview-pages { transform: none !important; }
  .pagedjs_page { box-shadow: none; }
}
`;
