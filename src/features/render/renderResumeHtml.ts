import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AtsTemplate } from "./AtsTemplate";
import type { Resume } from "../../lib/schema/resume";

// Only the ATS (T1) template exists; the "designed" (T2) template is Plan 4 and
// falls back to ATS until then. Both branches currently render AtsTemplate.
export function renderResumeHtml(resume: Resume): string {
  return renderToStaticMarkup(createElement(AtsTemplate, { resume }));
}
