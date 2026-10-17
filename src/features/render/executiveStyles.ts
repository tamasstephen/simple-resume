// Page + typography CSS for the Executive template (Paper: "Resume Templates",
// Executive). Garamond text with a Cormorant name, all in one ink colour.
// From page 2 on, the name runs at the top of the sheet.
export const executiveStyles = `
@page {
  size: A4;
  margin: 15mm 17mm 20mm;
  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-family: "EB Garamond", Georgia, serif;
    font-size: 9pt;
    letter-spacing: 0.12em;
    color: #5c5c5c;
  }
  @top-left {
    content: string(resume-name);
    font-family: "Cormorant Garamond", "EB Garamond", serif;
    font-size: 14pt;
    font-weight: 500;
    color: #1b2a47;
  }
}
@page :first {
  @top-left { content: none; }
}
.resume-root--executive {
  font-family: "EB Garamond", Georgia, serif;
  color: #2a2a2a;
  font-size: 10.1pt;
  line-height: 1.48;
}
.resume-root--executive .resume-header {
  padding-bottom: 10pt;
  border-bottom: 3.5pt double #1b2a47;
  text-align: center;
}
.resume-root--executive .resume-name {
  string-set: resume-name content(text);
  margin: 0;
  color: #1b2a47;
  font-family: "Cormorant Garamond", "EB Garamond", serif;
  font-size: 36pt;
  font-weight: 500;
  line-height: 1.05;
}
.resume-root--executive .resume-title { margin: 3pt 0 0; color: #5c5c5c; font-size: 12.75pt; font-style: italic; }
.resume-root--executive .resume-contact { margin: 7pt 0 0; font-size: 9.75pt; }
.resume-root--executive .resume-links { margin: 1pt 0 0; font-size: 9.75pt; }
.resume-root--executive .resume-link { color: inherit; text-decoration: none; }
.resume-root--executive .resume-section { margin-top: 16pt; }
/* Spaced capitals centred between two rules. */
.resume-root--executive .resume-section-title {
  display: flex;
  align-items: center;
  gap: 10pt;
  margin: 0 0 10pt;
  color: #1b2a47;
  font-size: 9.4pt;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  /* Without this a heading is a legal break point and Paged.js strands it
     alone at the foot of a page. */
  break-after: avoid;
}
.resume-root--executive .resume-section-title::before,
.resume-root--executive .resume-section-title::after { content: ""; flex: 1; border-top: 0.75pt solid rgb(27 42 71 / 70%); }
.resume-root--executive .resume-entry { break-inside: avoid; margin-bottom: 11pt; }
.resume-root--executive .resume-entry:last-child { margin-bottom: 0; }
.resume-root--executive .resume-entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
.resume-root--executive .resume-entry-title {
  color: #1b2a47;
  font-size: 9.75pt;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.resume-root--executive .resume-entry-dates { flex-shrink: 0; font-size: 9.75pt; letter-spacing: 0.06em; white-space: nowrap; }
.resume-root--executive .resume-entry-sub { color: #5c5c5c; font-style: italic; }
.resume-root--executive .resume-rich { margin-top: 4pt; }
.resume-root--executive .resume-rich p { margin: 0 0 4pt; }
.resume-root--executive .resume-rich ul, .resume-root--executive .resume-rich ol { margin: 0 0 4pt; padding-left: 16pt; }
.resume-root--executive .resume-rich li::marker { color: #1b2a47; }
.resume-root--executive .resume-rich li + li { margin-top: 2pt; }
.resume-root--executive .resume-rich > *:last-child { margin-bottom: 0; }
.resume-root--executive .resume-skills { margin-top: 9pt; text-align: center; }
.resume-root--executive .resume-skills-label { margin: 0 0 2pt; color: #5c5c5c; font-style: italic; }
.resume-root--executive .resume-inline-list { margin: 0; }
.resume-root--executive .resume-inline-list--centred { text-align: center; }
.resume-root--executive .resume-inline-item { white-space: nowrap; }
.resume-root--executive .resume-cert { display: flex; align-items: baseline; gap: 10pt; margin-bottom: 5pt; break-inside: avoid; }
.resume-root--executive .resume-cert:last-child { margin-bottom: 0; }
.resume-root--executive .resume-cert-name { font-weight: 600; }
.resume-root--executive .resume-cert-issuer { flex: 1; color: #5c5c5c; font-style: italic; }
`;
