import { useResumeDispatch, useResumeState } from "../resume/useResume";
import { TEMPLATE_IDS, TEMPLATES } from "../render/templates";
import { templateSchema } from "../../lib/schema/resume";

/** Chooses the template the preview and the exported PDF use. Switching only
 *  changes presentation; the resume's content is untouched. */
export function TemplatePicker() {
  const template = useResumeState().committed.template;
  const dispatch = useResumeDispatch();

  const selectTemplate = (value: string) => {
    const parsed = templateSchema.safeParse(value);
    if (!parsed.success) return;
    dispatch({ type: "SELECT_TEMPLATE", template: parsed.data });
  };

  return (
    <label className="template-picker">
      <span className="template-picker__label">Template</span>
      <span className="template-picker__control">
        <select
          className="template-picker__select"
          value={template}
          onChange={(event) => selectTemplate(event.target.value)}
        >
          {TEMPLATE_IDS.map((id) => (
            <option key={id} value={id}>
              {TEMPLATES[id].label}
            </option>
          ))}
        </select>
        <svg
          className="template-picker__chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5l3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}
