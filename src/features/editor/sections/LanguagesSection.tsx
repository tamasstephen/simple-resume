import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateLanguage } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LanguageItem } from "../../../lib/schema/resume";

const makeEmpty = (): LanguageItem => ({ id: newId(), name: "", proficiency: "" });

const LABELS = { name: "Language" };

/** Repeatable Languages section. */
export function LanguagesSection() {
  const items = useResumeState().committed.languages;
  const dispatch = useResumeDispatch();
  const {
    draft,
    isEditing,
    isDirty,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    touch,
    trySave,
    cancel,
  } = useSectionDraft(makeEmpty, validateLanguage);

  const save = () => trySave((item) => dispatch({ type: "SAVE_ITEM", section: "languages", item }));

  return (
    <SectionEditor<LanguageItem>
      sectionId="languages"
      title="Languages"
      itemNoun="language"
      dialogDescription="A language you speak, and how well."
      layout="tags"
      itemLabel={(item) =>
        item.proficiency.length > 0 ? `${item.name} (${item.proficiency})` : item.name
      }
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      renderSummary={(item) => (
        <span>
          {item.name}
          {item.proficiency ? ` (${item.proficiency})` : ""}
        </span>
      )}
      renderForm={() => (
        <div className="form-row">
          <TextField
            label={LABELS.name}
            isRequired
            placeholder="e.g. German"
            value={draft?.name ?? ""}
            error={errors.name}
            onChange={(name) => updateDraft({ name })}
            onBlur={() => touch("name")}
          />
          <TextField
            label="Proficiency"
            isOptional
            placeholder="e.g. Fluent"
            value={draft?.proficiency ?? ""}
            onChange={(proficiency) => updateDraft({ proficiency })}
          />
        </div>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "languages", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
