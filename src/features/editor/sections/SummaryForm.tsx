import { useState } from "react";
import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { RichTextField } from "../RichTextField";
import { sanitizeSummaryText } from "../sanitizeFields";

/** Singleton Summary form: rich-text draft, sanitized on Save. */
export function SummaryForm() {
  const committed = useResumeState().committed.summary;
  const dispatch = useResumeDispatch();
  const [draft, setDraft] = useState<string>(committed.text);

  return (
    <section aria-label="Summary">
      <h2>Summary</h2>
      <RichTextField value={draft} onChange={setDraft} ariaLabel="Summary text" />
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_SUMMARY", summary: sanitizeSummaryText(draft) })}
      >
        Save
      </button>
    </section>
  );
}
