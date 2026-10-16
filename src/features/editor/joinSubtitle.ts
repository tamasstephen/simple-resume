/** Joins the non-empty parts of a row subtitle with a middle dot. */
export function joinSubtitle(parts: readonly string[]): string {
  return parts.filter((part) => part.length > 0).join(" · ");
}
