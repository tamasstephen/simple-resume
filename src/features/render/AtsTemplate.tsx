import {
  RichText,
  contactParts,
  formatDateRange,
  formatLanguage,
  join,
  linkParts,
  MetaLine,
} from "./templateParts";
import type { Resume } from "../../lib/schema/resume";

// The header's meta lines (contact facts on one, links on the next) share one
// treatment in pageStyles and carry no margin, so the links read as a second
// line of the same block rather than a row of their own.
export function AtsTemplate({ resume }: { resume: Resume }) {
  const {
    contact,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    links,
  } = resume;

  return (
    <article className="resume-root resume-root--ats">
      <header className="resume-header">
        {contact.name.length > 0 ? <h1 className="resume-name">{contact.name}</h1> : null}
        {contact.title.length > 0 ? <p className="resume-title">{contact.title}</p> : null}
        <MetaLine className="resume-contact" parts={contactParts(contact)} />
        <MetaLine className="resume-links" parts={linkParts(links)} />
      </header>

      {summary.text.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Summary</h2>
          <RichText html={summary.text} />
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {experience.map((e) => (
            <div key={e.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">{join([e.role, e.company], " — ")}</span>
                <span className="resume-entry-dates">
                  {formatDateRange({
                    startDate: e.startDate,
                    endDate: e.endDate,
                    isCurrent: e.current,
                  })}
                </span>
              </div>
              {e.location.length > 0 ? <div className="resume-entry-sub">{e.location}</div> : null}
              <RichText html={e.description} />
            </div>
          ))}
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.map((ed) => (
            <div key={ed.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">
                  {join([ed.degree, ed.field], ", ").length > 0
                    ? join([ed.degree, ed.field], ", ")
                    : ed.institution}
                </span>
                <span className="resume-entry-dates">{formatDateRange(ed)}</span>
              </div>
              {ed.institution.length > 0 ? (
                <div className="resume-entry-sub">{ed.institution}</div>
              ) : null}
              <RichText html={ed.description} />
            </div>
          ))}
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="resume-entry">
              <div className="resume-entry-head">
                <span className="resume-entry-title">{p.name}</span>
                {p.url.length > 0 ? <span className="resume-entry-dates">{p.url}</span> : null}
              </div>
              <RichText html={p.description} />
            </div>
          ))}
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <p className="resume-inline-list">
            {join(
              skills.map((s) => s.name),
              " · ",
            )}
          </p>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.map((c) => (
            <div key={c.id} className="resume-entry">
              <span className="resume-cert-name">{c.name}</span>
              {join([c.issuer, c.date], ", ").length > 0 ? (
                <span className="resume-entry-sub"> — {join([c.issuer, c.date], ", ")}</span>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {languages.length > 0 ? (
        <section className="resume-section">
          <h2 className="resume-section-title">Languages</h2>
          <p className="resume-inline-list">{join(languages.map(formatLanguage), " · ")}</p>
        </section>
      ) : null}
    </article>
  );
}
