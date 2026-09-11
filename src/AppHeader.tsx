/** Paper app band: serif wordmark + meta micro-label + Export PDF action. No nav. */
export function AppHeader() {
  return (
    <header className="app-header">
      <span className="app-header__wordmark">Simple Resume</span>
      <div className="app-header__actions">
        <span className="app-header__meta">A4 — ATS</span>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>
    </header>
  );
}
