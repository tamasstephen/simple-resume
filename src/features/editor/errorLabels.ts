import type { FieldErrors } from "../../lib/validation/sectionRules";

/** The labels of the invalid fields, in the order `labels` lists them — the
 *  form's order — for the dialog's "fields need attention" summary. */
export function listErrorLabels<T>({
  errors,
  labels,
}: {
  errors: FieldErrors<T>;
  labels: Readonly<Record<string, string>>;
}): string[] {
  const invalid = new Set(
    Object.entries(errors)
      .filter(([, message]) => typeof message === "string")
      .map(([field]) => field),
  );
  return Object.entries(labels)
    .filter(([field]) => invalid.has(field))
    .map(([, label]) => label);
}
