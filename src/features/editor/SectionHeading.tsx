import { getSectionMeta, sectionAnchor, type SectionId } from "./sectionMeta";

/** Numbered eyebrow, headline and description that open every editor section.
 *  The h2 is a programmatic focus target for the section rail. */
export function SectionHeading({ sectionId }: { sectionId: SectionId }) {
  const { number, name, headline, description } = getSectionMeta(sectionId);

  return (
    <div className="section__head">
      <p className="section__eyebrow">{`${number} / ${name.toUpperCase()}`}</p>
      <h2 className="section__title" tabIndex={-1} id={`${sectionAnchor(sectionId)}-title`}>
        {headline}
      </h2>
      <p className="section__description">{description}</p>
    </div>
  );
}
