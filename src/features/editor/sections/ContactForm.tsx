import { useState } from "react";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import type { ContactHeader } from "../../../lib/schema/resume";

const FIELDS: ReadonlyArray<{ key: keyof ContactHeader; label: string; type: string }> = [
  { key: "name", label: "Name", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "location", label: "Location", type: "text" },
];

/** Singleton Contact/Header form: edits a local draft, commits on Save. */
export function ContactForm() {
  const committed = useResumeState().committed.contact;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<ContactHeader>(committed);

  return (
    <section aria-label="Contact">
      <h2>Contact</h2>
      {FIELDS.map(({ key, label, type }) => (
        <label key={key}>
          {label}
          <input
            type={type}
            value={draft[key]}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
          />
        </label>
      ))}
      <button type="button" onClick={() => dispatch({ type: "SET_CONTACT", contact: draft })}>
        Save contact
      </button>
    </section>
  );
}
