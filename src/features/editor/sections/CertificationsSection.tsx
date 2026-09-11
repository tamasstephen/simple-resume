import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { CertificationItem } from "../../../lib/schema/resume";

const makeEmpty = (): CertificationItem => ({ id: newId(), name: "", issuer: "", date: "" });

/** Repeatable Certifications section. */
export function CertificationsSection() {
  const items = useResumeState().committed.certifications;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "certifications", item: draft });
    cancel();
  };

  return (
    <SectionEditor<CertificationItem>
      title="Certifications"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => (
        <span>
          {item.name}
          {item.issuer ? ` — ${item.issuer}` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Certification name
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label>
            Issuer
            <input
              value={draft?.issuer ?? ""}
              onChange={(e) => updateDraft({ issuer: e.target.value })}
            />
          </label>
          <label>
            Date
            <input
              value={draft?.date ?? ""}
              onChange={(e) => updateDraft({ date: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "certifications", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
