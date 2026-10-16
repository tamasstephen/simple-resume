import { SECTIONS, sectionAnchor, type SectionId } from "./sectionMeta";

function focusSectionTitle(id: SectionId) {
  const title = document.getElementById(`${sectionAnchor(id)}-title`);
  if (title === null) return;
  title.scrollIntoView?.({ block: "start" });
  title.focus({ preventScroll: true });
}

/** Numbered jump list for the editor sections; `activeId` is the one in view. */
export function SectionRail({ activeId }: { activeId: SectionId | null }) {
  return (
    <nav aria-label="Sections" className="section-rail">
      <p className="section-rail__label">SECTIONS</p>
      <ul className="section-rail__list">
        {SECTIONS.map(({ id, number, name }) => (
          <li key={id}>
            <a
              className="section-rail__item"
              href={`#${sectionAnchor(id)}`}
              aria-current={activeId === id ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                focusSectionTitle(id);
              }}
            >
              <span className="section-rail__number">{number}</span>
              <span className="section-rail__name">{name}</span>
              <span className="section-rail__status" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
