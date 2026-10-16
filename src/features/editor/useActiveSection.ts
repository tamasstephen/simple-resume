import { useEffect, useState } from "react";
import { sectionAnchor, type SectionId } from "./sectionMeta";

// A section counts as "current" while it crosses the band just under the
// header, so the rail follows what the writer is reading, not what is merely
// on screen.
const OBSERVER_MARGIN = "-72px 0px -60% 0px";

function findNearestTop(entries: ReadonlyMap<SectionId, IntersectionObserverEntry>): SectionId | null {
  let nearest: SectionId | null = null;
  let nearestTop = Infinity;
  for (const [id, entry] of entries) {
    if (!entry.isIntersecting) continue;
    if (entry.boundingClientRect.top >= nearestTop) continue;
    nearest = id;
    nearestTop = entry.boundingClientRect.top;
  }
  return nearest;
}

/** Scroll-spy: the id of the section nearest the top of the viewport, or null
 *  before any is seen (and wherever IntersectionObserver does not exist). */
export function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [activeId, setActiveId] = useState<SectionId | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const latest = new Map<SectionId, IntersectionObserverEntry>();
    const idByElement = new Map<Element, SectionId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByElement.get(entry.target);
          if (id !== undefined) latest.set(id, entry);
        }
        const nearest = findNearestTop(latest);
        if (nearest !== null) setActiveId(nearest);
      },
      { rootMargin: OBSERVER_MARGIN },
    );
    for (const id of ids) {
      const element = document.getElementById(sectionAnchor(id));
      if (element === null) continue;
      idByElement.set(element, id);
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
