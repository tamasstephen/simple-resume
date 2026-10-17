import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { MonthField } from "../MonthField";
import { listErrorLabels } from "../errorLabels";
import { validateCertification } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { CertificationItem } from "../../../lib/schema/resume";

const makeEmpty = (): CertificationItem => ({ id: newId(), name: "", issuer: "", date: "" });

const LABELS = { name: "Certification name", date: "Date" };

/** Repeatable Certifications section. */
export function CertificationsSection() {
  const items = useResumeState().committed.certifications;
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
  } = useSectionDraft(makeEmpty, validateCertification);

  const save = () =>
    trySave((item) => dispatch({ type: "SAVE_ITEM", section: "certifications", item }));

  return (
    <SectionEditor<CertificationItem>
      sectionId="certifications"
      title="Certifications"
      itemNoun="certification"
      dialogDescription="A credential, who issued it and when."
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateCertification(item), labels: LABELS })
      }
      renderSummary={(item) => <span>{item.name}</span>}
      renderSubtitle={(item) => item.issuer}
      renderMeta={(item) => item.date}
      renderForm={() => (
        <>
          <TextField
            label={LABELS.name}
            isRequired
            value={draft?.name ?? ""}
            error={errors.name}
            onChange={(name) => updateDraft({ name })}
            onBlur={() => touch("name")}
          />
          <div className="form-row form-row--dates">
            <TextField
              label="Issuer"
              isOptional
              value={draft?.issuer ?? ""}
              onChange={(issuer) => updateDraft({ issuer })}
            />
            <MonthField
              label={LABELS.date}
              isOptional
              value={draft?.date ?? ""}
              error={errors.date}
              onChange={(date) => updateDraft({ date })}
              onBlur={() => touch("date")}
            />
          </div>
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
