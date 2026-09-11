import { sanitizeHtml } from "../../lib/sanitizeHtml";
import type { Summary } from "../../lib/schema/resume";

/** Returns a copy of an item with its rich-text `description` sanitized. */
export function sanitizeDescription<T extends { description: string }>(item: T): T {
  return { ...item, description: sanitizeHtml(item.description) };
}

/** Builds a Summary with sanitized rich-text. */
export function sanitizeSummaryText(text: string): Summary {
  return { text: sanitizeHtml(text) };
}
