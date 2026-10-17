import {
  RichText,
  contactParts,
  educationSub,
  educationTitle,
  Entry,
  formatDateRange,
  formatLanguage,
  InlineList,
  join,
  linkParts,
  MetaLine,
  Section,
} from "./templateParts";
import type { Resume } from "../../lib/schema/resume";

const SUB_SEPARATOR = " | ";

function Header({ contact, links }: Pick<Resume, "contact" | "links">) {
  return (
    <header className="resume-header">
      {contact.name.length > 0 ? <h1 className="resume-name">{contact.name}</h1> : null}
      {contact.title.length > 0 ? <p className="resume-title">{contact.title}</p> : null}
      <MetaLine className="resume-contact" parts={contactParts(contact)} />
      <MetaLine className="resume-links" parts={linkParts(links)} />
    </header>
  );
}

// Skills sit under the summary as one centred line instead of taking a
// section of their own; without a summary they head the section themselves.
function SummarySection({ summary, skills }: Pick<Resume, "summary" | "skills">) {
  const hasSummary = summary.text.length > 0;
  if (!hasSummary && skills.length === 0) return null;

  return (
    <Section title={hasSummary ? "Summary" : "Skills"}>
      <RichText html={summary.text} />
      {skills.length > 0 ? (
        <div className="resume-skills">
          {hasSummary ? <p className="resume-skills-label">Skills</p> : null}
          <InlineList
            className="resume-inline-list"
            items={skills.map((skill) => ({ key: skill.id, text: skill.name }))}
          />
        </div>
      ) : null}
    </Section>
  );
}

/** Formal serif template: centred letterhead over a double rule, headings
 *  centred between rules, spaced-capital entry titles. */
export function ExecutiveTemplate({ resume }: { resume: Resume }) {
  const { contact, summary, experience, education, skills, projects, certifications, languages } =
    resume;

  return (
    <article className="resume-root resume-root--executive">
      <Header contact={contact} links={resume.links} />
      <SummarySection summary={summary} skills={skills} />

      {experience.length > 0 ? (
        <Section title="Professional Experience">
          {experience.map((item) => (
            <Entry
              key={item.id}
              title={item.role.length > 0 ? item.role : item.company}
              aside={formatDateRange({ ...item, isCurrent: item.current })}
              sub={join([item.role.length > 0 ? item.company : "", item.location], SUB_SEPARATOR)}
              html={item.description}
            />
          ))}
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section title="Education">
          {education.map((item) => (
            <Entry
              key={item.id}
              title={educationTitle(item)}
              aside={formatDateRange(item)}
              sub={educationSub(item)}
              html={item.description}
            />
          ))}
        </Section>
      ) : null}

      {projects.length > 0 ? (
        <Section title="Projects">
          {projects.map((item) => (
            <Entry
              key={item.id}
              title={item.name}
              aside={item.url}
              sub=""
              html={item.description}
            />
          ))}
        </Section>
      ) : null}

      {certifications.length > 0 ? (
        <Section title="Certifications">
          {certifications.map((item) => (
            <div key={item.id} className="resume-cert">
              <span className="resume-cert-name">{item.name}</span>
              <span className="resume-cert-issuer">{item.issuer}</span>
              {item.date.length > 0 ? (
                <span className="resume-entry-dates">{item.date}</span>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {languages.length > 0 ? (
        <Section title="Languages">
          <InlineList
            className="resume-inline-list resume-inline-list--centred"
            items={languages.map((language) => ({
              key: language.id,
              text: formatLanguage(language),
            }))}
          />
        </Section>
      ) : null}
    </article>
  );
}
