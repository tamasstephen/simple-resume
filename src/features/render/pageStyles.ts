// Page + typography CSS handed to Paged.js (inline stylesheet) and reused by
// the print/export path in a later plan. Clean modern sans, A4, page numbers,
// and break-inside:avoid so an entry is not split across a page boundary.
export const pageStyles = `
@page {
  size: A4;
  margin: 18mm 16mm;
  @bottom-center { content: counter(page); font-size: 9pt; color: #666; }
}
.resume-root {
  font-family: Arial, Helvetica, "Segoe UI", sans-serif;
  color: #1a1a1a;
  font-size: 10.5pt;
  line-height: 1.45;
}
.resume-name { font-size: 20pt; margin: 0 0 2pt; }
.resume-title { font-size: 11pt; color: #444; margin: 0 0 4pt; }
.resume-contact { font-size: 9.5pt; color: #444; margin: 0; }
.resume-link { color: inherit; text-decoration: underline; }
.resume-section { margin-top: 16pt; }
.resume-section-title {
  font-size: 11pt; text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid #cccccc; padding-bottom: 2pt; margin: 0 0 6pt;
  /* Without this a heading is a legal break point and Paged.js strands it
     alone at the foot of a page with its section starting on the next one. */
  break-after: avoid;
}
.resume-entry { break-inside: avoid; margin-bottom: 10pt; }
.resume-entry-head { display: flex; justify-content: space-between; gap: 8pt; }
.resume-entry-title { font-weight: 700; }
.resume-entry-dates { color: #666; white-space: nowrap; font-size: 9.5pt; }
.resume-entry-sub { color: #444; font-size: 9.5pt; }
/* Rhythm ladder — 4pt inside a block, 10pt between entries, 16pt between
   sections — so the gaps say what belongs together. Rich text carries no
   margin of its own, so every child block declares one here; the browser
   default (1em) would out-shout the entry and section gaps. */
.resume-rich { margin: 2pt 0 0; }
.resume-rich p { margin-top: 0; margin-bottom: 4pt; }
.resume-rich ul, .resume-rich ol { margin-top: 0; margin-bottom: 4pt; padding-left: 16pt; }
.resume-rich > *:last-child { margin-bottom: 0; }
.resume-inline-list { margin: 0; }
`;
