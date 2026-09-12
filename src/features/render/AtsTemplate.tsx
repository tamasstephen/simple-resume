import { Fragment, type ReactNode } from "react";
import { sanitizeHtml } from "../../lib/sanitizeHtml";
import { toSafeHref } from "../../lib/safeUrl";
import type { ContactHeader, LinkItem, Resume } from "../../lib/schema/resume";

const META_SEPARATOR = " · ";

// Rich text is sanitized here (render time) as defense-in-depth: data imported
// via REPLACE_ALL can reach committed state without passing the editor's
// Save-time sanitizer.
function RichText({ html }: { html: string }) {
  return <div className="resume-rich" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

function join(parts: readonly string[], sep: string): string {
  return parts.filter((p) => p.length > 0).join(sep);
}

// One meta line under the name: email, phone, location, then the links —
// links print here, so they belong to this line rather than a row of their
// own. Each link is a real anchor so it stays clickable in the preview and in
// the exported PDF; a URL the safe-href check refuses keeps its text and
// simply is not linked.
function ContactLine({ contact, links }: { contact: ContactHeader; links: readonly LinkItem[] }) {
  const parts: { key: string; node: ReactNode }[] = [
    ...[contact.email, contact.phone, contact.location]
      .filter((value) => value.length > 0)
      .map((value) => ({ key: value, node: value })),
    ...links
      .filter((link) => link.label.length > 0 || link.url.length > 0)
      .map((link) => {
        const text = link.label.length > 0 ? link.label : link.url;
        const href = toSafeHref(link.url);
        return {
          key: link.id,
          node:
            href === null ? (
              text
            ) : (
              <a className="resume-link" href={href} target="_blank" rel="noreferrer">
                {text}
              </a>
            ),
        };
      }),
  ];
  if (parts.length === 0) return null;

  return (
    <p className="resume-contact">
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 ? META_SEPARATOR : null}
          {part.node}
        </Fragment>
      ))}
    </p>
  );
}

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
    <article className="resume-root">
      <header className="resume-header">
        {contact.name.length > 0 ? <h1 className="resume-name">{contact.name}</h1> : null}
        {contact.title.length > 0 ? <p className="resume-title">{contact.title}</p> : null}
        <ContactLine contact={contact} links={links} />
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
                  {join([e.startDate, e.current ? "Present" : e.endDate], " – ")}
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
                <span className="resume-entry-dates">
                  {join([ed.startDate, ed.endDate], " – ")}
                </span>
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
              <span className="resume-entry-title">{c.name}</span>
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
          <p className="resume-inline-list">
            {join(
              languages.map((l) =>
                l.proficiency.length > 0 ? `${l.name} (${l.proficiency})` : l.name,
              ),
              " · ",
            )}
          </p>
        </section>
      ) : null}
    </article>
  );
}
