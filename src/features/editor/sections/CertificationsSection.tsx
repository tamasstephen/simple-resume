import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateCertification } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { CertificationItem } from "../../../lib/schema/resume";

const makeEmpty = (): CertificationItem => ({ id: newId(), name: "", issuer: "", date: "" });

const LABELS = { date: "Date" };

/** Repeatable Certifications section. */
export function CertificationsSection() {
  const items = useResumeState().committed.certifications;
  const dispatch = useResumeDispatch();
  const {
    draft,
    isEditing,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    trySave,
    cancel,
  } = useSectionDraft(makeEmpty, validateCertification);

  const save = () =>
    trySave((item) => dispatch({ type: "SAVE_ITEM", section: "certifications", item: item }));

  return (
    <SectionEditor<CertificationItem>
      sectionId="certifications"
      title="Certifications"
      itemNoun="certification"
      items={items}
      draft={draft}
      isEditing={isEditing}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => <span>{item.name}</span>}
      renderSubtitle={(item) => item.issuer}
      renderMeta={(item) => item.date}
      renderForm={() => (
        <>
          <label>
            Certification name
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label className="field field--medium">
            Issuer
            <input
              value={draft?.issuer ?? ""}
              onChange={(e) => updateDraft({ issuer: e.target.value })}
            />
          </label>
          <TextField
            label={LABELS.date}
            width="short"
            placeholder="MM/YYYY"
            value={draft?.date ?? ""}
            error={errors.date}
            onChange={(date) => updateDraft({ date })}
          />
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
