import { useEffect, useRef } from "react";
import type { FocusEvent, KeyboardEvent } from "react";

interface KebabMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Row kebab: opens the Edit/Delete menu; closes on selection, Escape,
    outside pointerdown, scroll, or focus leaving the menu. */
export function KebabMenu({ isOpen, onToggle, onClose, onEdit, onDelete }: KebabMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const root = rootRef.current;
    if (root === null) return;
    const closeIfOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.contains(event.target)) onClose();
    };
    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("scroll", onClose, true);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const menu = menuRef.current;
    // preventScroll: plain focus() auto-scrolls the editor pane to reveal the
    // item, and the resulting scroll event would close the menu via the
    // user-scroll listener below.
    menu?.querySelector<HTMLButtonElement>(".kebab__item")?.focus({ preventScroll: true });
  }, [isOpen]);

  const closeAndRefocusTrigger = () => {
    onClose();
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRefocusTrigger();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const menu = menuRef.current;
    const items =
      menu === null ? [] : [...menu.querySelectorAll<HTMLButtonElement>(".kebab__item")];
    if (items.length === 0) return;
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex =
      currentIndex === -1
        ? delta === 1
          ? 0
          : items.length - 1
        : (currentIndex + delta + items.length) % items.length;
    items[nextIndex]?.focus({ preventScroll: true });
  };

  const handleMenuBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    onClose();
  };

  const select = (action: () => void) => {
    action();
    triggerRef.current?.focus();
  };

  return (
    <div className="kebab" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="kebab__trigger"
        aria-label="Item actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <circle cx="8" cy="3.5" r="1.3" />
          <circle cx="8" cy="8" r="1.3" />
          <circle cx="8" cy="12.5" r="1.3" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="kebab__menu"
          role="menu"
          aria-label="Item actions"
          ref={menuRef}
          onKeyDown={handleMenuKeyDown}
          onBlur={handleMenuBlur}
        >
          <button
            type="button"
            role="menuitem"
            className="kebab__item"
            onClick={() => select(onEdit)}
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className="kebab__item kebab__item--danger"
            onClick={() => select(onDelete)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
