import { SECTIONS, sectionAnchor, type SectionId } from "./sectionMeta";
import { countSectionErrors } from "./sectionErrors";
import { useResumeState } from "../resume/useResume";

function focusSectionTitle(id: SectionId) {
  const title = document.getElementById(`${sectionAnchor(id)}-title`);
  if (title === null) return;
  title.scrollIntoView?.({ block: "start" });
  title.focus({ preventScroll: true });
}

interface SectionRailProps {
  activeId: SectionId | null;
  onSelect: (id: SectionId) => void;
}

function ErrorBadge({ count }: { count: number }) {
  if (count === 0) return null;
  const noun = count === 1 ? "field needs" : "fields need";
  return (
    <span className="section-rail__badge">
      <span aria-hidden="true">{count}</span>
      <span className="visually-hidden">{`, ${count} ${noun} attention`}</span>
    </span>
  );
}

/** Numbered jump list for the editor sections; `activeId` is the one in view.
 *  A badge counts the saved fields in a section that break a rule. */
export function SectionRail({ activeId, onSelect }: SectionRailProps) {
  const errorCounts = countSectionErrors(useResumeState().committed);

  return (
    <nav aria-label="Sections" className="section-rail">
      <p className="section-rail__label">SECTIONS</p>
      <ul className="section-rail__list">
        {SECTIONS.map(({ id, number, name }) => (
          <li key={id}>
            <a
              className="section-rail__item"
              href={`#${sectionAnchor(id)}`}
              title={name}
              aria-current={activeId === id ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                focusSectionTitle(id);
                onSelect(id);
              }}
            >
              <span className="section-rail__number">{number}</span>
              <span className="section-rail__name">{name}</span>
              <span className="section-rail__status">
                <ErrorBadge count={errorCounts[id] ?? 0} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
