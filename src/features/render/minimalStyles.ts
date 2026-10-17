// Page + typography CSS for the Minimal template (Paper: "Resume Templates",
// Minimal). Inter only; one blue moment, the page number. The footer and its
// name come from @page margin boxes so they repeat on every sheet.
export const minimalStyles = `
@page {
  size: A4;
  margin: 15mm 17mm 20mm;
  @bottom-left {
    content: string(resume-name);
    font-family: Inter, system-ui, sans-serif;
    font-size: 8pt;
    color: #8a8a8a;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: Inter, system-ui, sans-serif;
    font-size: 8pt;
    font-weight: 500;
    color: #0058c2;
  }
}
.resume-root--minimal {
  font-family: Inter, system-ui, sans-serif;
  color: #3d3d3d;
  font-size: 9.4pt;
  line-height: 1.52;
}
/* The one side-by-side row: a header never splits across pages. */
.resume-root--minimal .resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18pt;
  padding-bottom: 13pt;
  border-bottom: 1.5pt solid #171717;
}
.resume-root--minimal .resume-name {
  string-set: resume-name content(text);
  margin: 0;
  color: #171717;
  font-size: 25.5pt;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.03em;
}
.resume-root--minimal .resume-title { margin: 4pt 0 0; color: #5c5c5c; font-size: 11pt; }
.resume-root--minimal .resume-contact-block { max-width: 55%; text-align: right; }
.resume-root--minimal .resume-contact, .resume-root--minimal .resume-links { margin: 0; font-size: 8.6pt; line-height: 1.5; }
.resume-root--minimal .resume-link { color: inherit; text-decoration: none; }
.resume-root--minimal .resume-section { margin-top: 18pt; }
/* The heading is followed by a hairline that runs to the margin. */
.resume-root--minimal .resume-section-title {
  display: flex;
  align-items: center;
  gap: 8pt;
  margin: 0 0 9pt;
  color: #171717;
  font-size: 9.75pt;
  font-weight: 600;
  /* Without this a heading is a legal break point and Paged.js strands it
     alone at the foot of a page. */
  break-after: avoid;
}
.resume-root--minimal .resume-section-title::after { content: ""; flex: 1; border-top: 0.75pt solid #e0e0e0; }
.resume-root--minimal .resume-entry { break-inside: avoid; margin-bottom: 10.5pt; }
.resume-root--minimal .resume-entry:last-child { margin-bottom: 0; }
.resume-root--minimal .resume-entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
.resume-root--minimal .resume-entry-title { color: #171717; font-size: 9.75pt; font-weight: 600; }
.resume-root--minimal .resume-entry-dates { flex-shrink: 0; color: #707070; font-size: 8.6pt; white-space: nowrap; }
.resume-root--minimal .resume-entry-sub { color: #5c5c5c; }
.resume-root--minimal .resume-rich { margin-top: 4.5pt; }
.resume-root--minimal .resume-entry-head + .resume-rich { margin-top: 3pt; }
.resume-root--minimal .resume-rich p { margin: 0 0 4pt; }
.resume-root--minimal .resume-rich ul, .resume-root--minimal .resume-rich ol { margin: 0 0 4pt; padding-left: 12pt; }
/* Dash bullets, drawn so they sit in the same lane as the list indent. */
.resume-root--minimal .resume-rich ul { list-style: none; }
.resume-root--minimal .resume-rich ul > li { position: relative; }
.resume-root--minimal .resume-rich ul > li::before { content: "–"; position: absolute; left: -12pt; color: #a3a3a3; }
.resume-root--minimal .resume-rich li + li { margin-top: 2pt; }
.resume-root--minimal .resume-rich > *:last-child { margin-bottom: 0; }
.resume-root--minimal .resume-inline-list { margin: 0; line-height: 1.7; }
.resume-root--minimal .resume-inline-item { white-space: nowrap; }
`;
