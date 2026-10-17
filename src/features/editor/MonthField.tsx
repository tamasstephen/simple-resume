import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { TextField } from "./TextField";
import { formatMonthYear, parseMonthYear } from "../../lib/validation/fieldRules";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 3v4M16 3v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const path = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface MonthFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  isRequired?: boolean;
  isOptional?: boolean;
  isDisabled?: boolean;
  /** Shown while empty: "Select month", or "Present" for a disabled end date. */
  placeholder?: string;
}

/** Month and year field: type an en-US date ("03/2020", "Mar 2020") or pick
 *  one from the calendar button's year-and-month grid, which writes "Jan
 *  2022". */
export function MonthField({
  label,
  value,
  onChange,
  onBlur,
  error,
  isRequired,
  isOptional,
  isDisabled = false,
  placeholder = "Select month",
}: MonthFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerId = useId();
  const selected = parseMonthYear(value);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    const months = containerRef.current?.querySelectorAll<HTMLElement>(".month-picker__month");
    const selectedMonth = containerRef.current?.querySelector<HTMLElement>(
      ".month-picker__month[aria-pressed='true']",
    );
    (selectedMonth ?? months?.[0])?.focus();
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isOpen]);

  const openPicker = () => {
    setViewYear(selected?.year ?? new Date().getFullYear());
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const pickMonth = (month: number) => {
    onChange(formatMonthYear({ year: viewYear, month }));
    onBlur?.();
    closePicker();
  };

  // Escape closes the picker only; preventDefault keeps the surrounding
  // dialog from treating the same key press as its own close request.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closePicker();
  };

  // The field is "left" only when focus exits the whole widget; moving from
  // the input to its own picker must not flag an empty required date.
  const handleFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && containerRef.current?.contains(next)) return;
    onBlur?.();
  };

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="field__trailing-button"
      aria-label={`Choose ${label.toLowerCase()}`}
      aria-expanded={isOpen}
      aria-controls={isOpen ? pickerId : undefined}
      disabled={isDisabled}
      onClick={() => (isOpen ? closePicker() : openPicker())}
    >
      <CalendarIcon />
    </button>
  );

  return (
    <div className="month-field" ref={containerRef} onBlur={handleFocusOut}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        isRequired={isRequired}
        isOptional={isOptional}
        isDisabled={isDisabled}
        placeholder={placeholder}
        trailing={trigger}
      />
      {isOpen && (
        <div
          className="month-picker"
          id={pickerId}
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          onKeyDown={handleKeyDown}
        >
          <div className="month-picker__header">
            <button
              type="button"
              className="month-picker__nav"
              aria-label="Previous year"
              onClick={() => setViewYear((year) => year - 1)}
            >
              <ChevronIcon direction="left" />
            </button>
            <span className="month-picker__year" aria-live="polite">
              {viewYear}
            </span>
            <button
              type="button"
              className="month-picker__nav"
              aria-label="Next year"
              onClick={() => setViewYear((year) => year + 1)}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
          <div className="month-picker__grid">
            {MONTHS.map((name, index) => {
              const month = index + 1;
              const isSelected = selected?.year === viewYear && selected.month === month;
              return (
                <button
                  key={name}
                  type="button"
                  className="month-picker__month"
                  aria-label={`${name} ${viewYear}`}
                  aria-pressed={isSelected}
                  onClick={() => pickMonth(month)}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
