import { useId } from "react";

/** The circled "!" every error message carries, so colour is never the only cue. */
export function ErrorIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 4.5v4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.25" r="0.9" fill="currentColor" />
    </svg>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The fix-it message, or null/undefined while the value is fine. */
  error?: string | null;
  /** Size modifier: `short` for dates and phones, `medium` for mid-length values. */
  width?: "short" | "medium";
  type?: "text" | "email" | "tel";
  placeholder?: string;
}

/** Labelled input with its inline error: red border, icon and message, tied
 *  to the input by aria-invalid and aria-describedby. */
export function TextField({
  label,
  value,
  onChange,
  error,
  width,
  type = "text",
  placeholder,
}: TextFieldProps) {
  const errorId = useId();
  const hasError = typeof error === "string";

  return (
    <div className={width === undefined ? "field" : `field field--${width}`}>
      <label>
        {label}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {hasError && (
        <p className="field__error" id={errorId}>
          <ErrorIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
