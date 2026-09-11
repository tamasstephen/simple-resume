import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li"];

/**
 * Sanitizes rich-text HTML down to the small formatting subset the resume
 * builder supports (bold/italic/lists). Strips scripts, event handlers, and
 * all attributes — the boundary defense against stored XSS before HTML ever
 * enters committed state.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}
