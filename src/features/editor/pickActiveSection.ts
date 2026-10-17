import type { SectionId } from "./sectionMeta";

export interface SectionPosition {
  id: SectionId;
  /** Viewport y of the section's top edge. */
  top: number;
}

/** The section the writer is reading: the last one whose top has passed the
 *  reading line. Once the scroller hits its end, the last section wins, as
 *  it may be too short to ever reach the line. Positions are in document
 *  order; null only when there are none. */
export function pickActiveSection({
  positions,
  readingLine,
  isAtEnd,
}: {
  positions: readonly SectionPosition[];
  readingLine: number;
  isAtEnd: boolean;
}): SectionId | null {
  const last = positions.at(-1);
  if (last === undefined) return null;
  if (isAtEnd) return last.id;
  const passed = positions.filter((position) => position.top <= readingLine);
  return (passed.at(-1) ?? positions[0] ?? last).id;
}
