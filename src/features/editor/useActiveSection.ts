import { useCallback, useEffect, useRef, useState } from "react";
import { sectionAnchor, type SectionId } from "./sectionMeta";
import { pickActiveSection, type SectionPosition } from "./pickActiveSection";

// A section becomes current once its top passes 40% down the viewport, so the
// rail follows what the writer is reading, not what is merely on screen.
const READING_LINE_RATIO = 0.4;
// Sub-pixel scroll offsets mean "at the end" is rarely an exact match.
const END_SLACK_PX = 2;

const USER_SCROLL_EVENTS: readonly string[] = ["wheel", "touchmove", "keydown"];

function measurePositions(ids: readonly SectionId[]): SectionPosition[] {
  const positions: SectionPosition[] = [];
  for (const id of ids) {
    const element = document.getElementById(sectionAnchor(id));
    if (element === null) continue;
    positions.push({ id, top: element.getBoundingClientRect().top });
  }
  return positions;
}

function isScrolledToEnd(scroller: Element | null): boolean {
  if (scroller === null || scroller.scrollHeight <= scroller.clientHeight) return false;
  return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < END_SLACK_PX;
}

/** The element whose scroll moves the sections, or null for an unrelated
 *  scroller (the preview pane, an open dialog). */
function getSectionScroller(target: EventTarget | null, ids: readonly SectionId[]): Element | null {
  const first = ids[0] === undefined ? null : document.getElementById(sectionAnchor(ids[0]));
  if (target instanceof Document) return target.scrollingElement;
  if (target instanceof Element && first !== null && target.contains(first)) return target;
  return null;
}

/** Scroll-spy: the id of the section the writer is reading — on desktop the
 *  editor pane scrolls, below 961px the page does; both are followed.
 *  `selectSection` pins a rail click as active, so the jump's own scroll
 *  cannot hand it back to the spy, until the user scrolls or types again. */
export function useActiveSection(
  ids: readonly SectionId[],
): [SectionId | null, (id: SectionId) => void] {
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const isPinnedRef = useRef(false);

  const selectSection = useCallback((id: SectionId) => {
    isPinnedRef.current = true;
    setActiveId(id);
  }, []);

  useEffect(() => {
    const unpin = () => {
      isPinnedRef.current = false;
    };
    for (const name of USER_SCROLL_EVENTS) window.addEventListener(name, unpin, true);
    return () => {
      for (const name of USER_SCROLL_EVENTS) window.removeEventListener(name, unpin, true);
    };
  }, []);

  useEffect(() => {
    const update = (scroller: Element | null) => {
      if (isPinnedRef.current) return;
      const picked = pickActiveSection({
        positions: measurePositions(ids),
        readingLine: window.innerHeight * READING_LINE_RATIO,
        isAtEnd: isScrolledToEnd(scroller),
      });
      setActiveId(picked);
    };
    const handleScroll = (event: Event) => {
      const scroller = getSectionScroller(event.target, ids);
      if (scroller !== null) update(scroller);
    };
    update(null);
    // Scroll does not bubble; capturing on document hears the editor pane too.
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [ids]);

  return [activeId, selectSection];
}
