import { useResumeState } from "./features/resume/useResume";

function formatIdentity({ name, title }: { name: string; title: string }): string {
  if (name.trim().length === 0) return "";
  if (title.trim().length === 0) return name;
  return `${name} — ${title}`;
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 1.5v7.5M3.75 5.75L7 9l3.25-3.25M2 12.5h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** App band: wordmark and who the resume is for, save status, Export PDF. */
export function AppHeader() {
  const identity = formatIdentity(useResumeState().committed.contact);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__wordmark">Simple Resume</span>
        {identity !== "" && (
          <>
            <span className="app-header__divider" aria-hidden="true" />
            <span className="app-header__identity">{identity}</span>
          </>
        )}
      </div>
      <div className="app-header__actions">
        {/* Stacked layout only: below 961px the preview is a long scroll away
            from the editor, and the header is the only thing always in view. */}
        <a className="btn btn--text app-header__jump" href="#preview">
          Preview
        </a>
        <span className="app-header__status">
          <span className="app-header__dot" aria-hidden="true" />
          SAVED LOCALLY
        </span>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          <DownloadIcon />
          Export PDF
        </button>
      </div>
    </header>
  );
}
