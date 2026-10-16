import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LanguageItem } from "../../../lib/schema/resume";

const makeEmpty = (): LanguageItem => ({ id: newId(), name: "", proficiency: "" });

/** Repeatable Languages section. */
export function LanguagesSection() {
  const items = useResumeState().committed.languages;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "languages", item: draft });
    cancel();
  };

  return (
    <SectionEditor<LanguageItem>
      sectionId="languages"
      title="Languages"
      itemNoun="language"
      layout="tags"
      itemLabel={(item) =>
        item.proficiency.length > 0 ? `${item.name} (${item.proficiency})` : item.name
      }
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => (
        <span>
          {item.name}
          {item.proficiency ? ` (${item.proficiency})` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label className="field field--medium">
            Language
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label className="field field--medium">
            Proficiency
            <input
              value={draft?.proficiency ?? ""}
              onChange={(e) => updateDraft({ proficiency: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "languages", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
