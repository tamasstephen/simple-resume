import { useId } from "react";
import type { ReactNode } from "react";

/** The circled "!" every error message carries, so colour is never the only cue. */
export function ErrorIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 4.75v3.75M8 11v.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Label line shared by every field: the name, a required star or an
 *  "Optional" hint on the right. */
export function FieldLabel({
  htmlFor,
  id,
  label,
  isRequired = false,
  isOptional = false,
}: {
  htmlFor?: string;
  id?: string;
  label: string;
  isRequired?: boolean;
  isOptional?: boolean;
}) {
  const className = isRequired ? "field__label field__label--required" : "field__label";
  return (
    <div className="field__label-row">
      {htmlFor === undefined ? (
        <span className={className} id={id}>
          {label}
        </span>
      ) : (
        <label className={className} htmlFor={htmlFor} id={id}>
          {label}
        </label>
      )}
      {isOptional && <span className="field__hint">Optional</span>}
    </div>
  );
}

/** Error message, or helper text when there is no error; the id ties it to
 *  the control through aria-describedby. */
export function FieldMessage({
  id,
  error,
  helper,
}: {
  id: string;
  error?: string | null;
  helper?: string;
}) {
  if (typeof error === "string") {
    return (
      <p className="field__error" id={id}>
        <ErrorIcon size={14} />
        {error}
      </p>
    );
  }
  if (helper === undefined) return null;
  return (
    <p className="field__helper" id={id}>
      {helper}
    </p>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** The fix-it message, or null/undefined while the value is fine. */
  error?: string | null;
  helper?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  isDisabled?: boolean;
  /** Caps the control at the width its value needs: `short` for dates and
   *  phones, `medium` for mid-length values. */
  width?: "short" | "medium";
  type?: "text" | "email" | "tel" | "url";
  placeholder?: string;
  /** Rendered inside the control box, after the input (e.g. a picker button). */
  trailing?: ReactNode;
}

/** Labelled 48px input with its helper or error line. */
export function TextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  helper,
  isRequired = false,
  isOptional = false,
  isDisabled = false,
  width,
  type = "text",
  placeholder,
  trailing,
}: TextFieldProps) {
  const inputId = useId();
  const messageId = useId();
  const hasError = typeof error === "string";
  const hasMessage = hasError || helper !== undefined;

  return (
    <div className={width === undefined ? "field" : `field field--${width}`}>
      <FieldLabel htmlFor={inputId} label={label} isRequired={isRequired} isOptional={isOptional} />
      <div className="field__control">
        <input
          id={inputId}
          className="field__input"
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-required={isRequired || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        {trailing}
      </div>
      <FieldMessage id={messageId} error={error} helper={helper} />
    </div>
  );
}

/** Checkbox row with a 44px tall target. */
export function CheckboxField({
  label,
  isChecked,
  onChange,
}: {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        className="checkbox__input"
        checked={isChecked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
