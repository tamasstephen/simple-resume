/** Paper app band: serif wordmark + meta micro-label + Export PDF action. No nav. */
export function AppHeader({ pageCount }: { pageCount: number }) {
  // Page count is the number a resume writer watches; it appears as soon as
  // the first pagination run reports one.
  const meta = pageCount > 0 ? `A4 — ${pageCount} ${pageCount === 1 ? "page" : "pages"}` : "A4";

  return (
    <header className="app-header">
      <span className="app-header__wordmark">Simple Resume</span>
      <div className="app-header__actions">
        <span className="app-header__meta">{meta}</span>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>
    </header>
  );
}
