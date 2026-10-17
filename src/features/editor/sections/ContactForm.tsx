import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "../SectionHeading";
import { TextField } from "../TextField";
import { hasErrors, validateContact } from "../../../lib/validation/sectionRules";
import { sectionAnchor } from "../sectionMeta";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import type { ContactHeader } from "../../../lib/schema/resume";

// `width` sizes the input to the thing it holds — a phone number in a
// name-width box is what makes a form look generated.
const FIELDS: ReadonlyArray<{
  key: keyof ContactHeader;
  label: string;
  type: "text" | "email" | "tel" | "url";
  width?: "short" | "medium";
  isOptional?: boolean;
}> = [
  { key: "name", label: "Name", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "email", label: "Email", type: "email", width: "medium" },
  { key: "phone", label: "Phone", type: "tel", width: "short" },
  { key: "location", label: "Location", type: "text", width: "medium" },
  // Not everyone has a site; marked optional so an empty box reads as fine.
  { key: "website", label: "Website", type: "url", width: "medium", isOptional: true },
];

/** Singleton Contact/Header form: edits a local draft, commits on Save. */
export function ContactForm() {
  const committed = useResumeState().committed.contact;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<ContactHeader>(committed);
  // Same contract as the dialogs: quiet until a save is blocked, then live.
  // Saved details that already break a rule (the rail flags them) show
  // their errors straight away so the badge has an explanation.
  const [blockedSaveCount, setBlockedSaveCount] = useState(0);
  const [isSavedInvalid] = useState(() => hasErrors(validateContact(committed)));
  const sectionRef = useRef<HTMLElement>(null);
  const errors = blockedSaveCount > 0 || isSavedInvalid ? validateContact(draft) : {};

  useEffect(() => {
    if (blockedSaveCount === 0) return;
    sectionRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [blockedSaveCount]);

  const save = () => {
    if (hasErrors(validateContact(draft))) {
      setBlockedSaveCount((count) => count + 1);
      return;
    }
    dispatch({ type: "SET_CONTACT", contact: draft });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Contact"
      className="section"
      id={sectionAnchor("contact")}
    >
      <SectionHeading sectionId="contact" />
      {FIELDS.map(({ key, label, type, width, isOptional }) => (
        <TextField
          key={key}
          label={label}
          type={type}
          width={width}
          isOptional={isOptional}
          value={draft[key]}
          error={errors[key]}
          onChange={(value) => setDraft((current) => ({ ...current, [key]: value }))}
        />
      ))}
      <button type="button" className="btn btn--primary" onClick={save}>
        Save contact
      </button>
    </section>
  );
}
