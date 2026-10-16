import { useState } from "react";
import { SectionHeading } from "../SectionHeading";
import { sectionAnchor } from "../sectionMeta";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import type { ContactHeader } from "../../../lib/schema/resume";

// `width` sizes the input to the thing it holds — a phone number in a
// name-width box is what makes a form look generated.
const FIELDS: ReadonlyArray<{
  key: keyof ContactHeader;
  label: string;
  type: string;
  width?: "short" | "medium";
}> = [
  { key: "name", label: "Name", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "email", label: "Email", type: "email", width: "medium" },
  { key: "phone", label: "Phone", type: "tel", width: "short" },
  { key: "location", label: "Location", type: "text", width: "medium" },
];

/** Singleton Contact/Header form: edits a local draft, commits on Save. */
export function ContactForm() {
  const committed = useResumeState().committed.contact;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<ContactHeader>(committed);

  return (
    <section aria-label="Contact" className="section" id={sectionAnchor("contact")}>
      <SectionHeading sectionId="contact" />
      {FIELDS.map(({ key, label, type, width }) => (
        <label key={key} className={width === undefined ? "field" : `field field--${width}`}>
          {label}
          <input
            type={type}
            value={draft[key]}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
          />
        </label>
      ))}
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => dispatch({ type: "SET_CONTACT", contact: draft })}
      >
        Save contact
      </button>
    </section>
  );
}
