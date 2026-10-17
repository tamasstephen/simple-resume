import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TEMPLATES } from "./templates";
import type { Resume } from "../../lib/schema/resume";

/** The resume as static HTML in its chosen template, ready for Paged.js. */
export function renderResumeHtml(resume: Resume): string {
  const { Component } = TEMPLATES[resume.template];
  return renderToStaticMarkup(createElement(Component, { resume }));
}
