import {
  RichText,
  contactParts,
  educationSub,
  educationTitle,
  Entry,
  ENTRY_SEPARATOR,
  formatDateRange,
  formatLanguage,
  InlineList,
  join,
  linkParts,
  MetaLine,
  Section,
} from "./templateParts";
import type { Resume } from "../../lib/schema/resume";

// Name and title on the left, contact facts stacked on the right. A header
// never splits across pages, so this one side-by-side row is safe to paginate.
function Header({ contact, links }: Pick<Resume, "contact" | "links">) {
  const [email, ...rest] = contactParts(contact);
  return (
    <header className="resume-header">
      <div className="resume-identity">
        {contact.name.length > 0 ? <h1 className="resume-name">{contact.name}</h1> : null}
        {contact.title.length > 0 ? <p className="resume-title">{contact.title}</p> : null}
      </div>
      <div className="resume-contact-block">
        <MetaLine className="resume-contact" parts={email === undefined ? [] : [email]} />
        <MetaLine className="resume-contact" parts={rest} />
        <MetaLine className="resume-links" parts={linkParts(links)} />
      </div>
    </header>
  );
}

/** Quiet sans template: left-aligned header over a strong rule, headings
 *  trailed by a hairline, role-first entries with dash bullets. */
export function MinimalTemplate({ resume }: { resume: Resume }) {
  const { contact, summary, experience, education, skills, projects, certifications, languages } =
    resume;

  return (
    <article className="resume-root resume-root--minimal">
      <Header contact={contact} links={resume.links} />

      {summary.text.length > 0 ? (
        <Section title="Profile">
          <RichText html={summary.text} />
        </Section>
      ) : null}

      {experience.length > 0 ? (
        <Section title="Experience">
          {experience.map((item) => (
            <Entry
              key={item.id}
              title={item.role.length > 0 ? item.role : item.company}
              aside={formatDateRange({ ...item, isCurrent: item.current })}
              sub={join([item.role.length > 0 ? item.company : "", item.location], ENTRY_SEPARATOR)}
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

      {skills.length > 0 ? (
        <Section title="Skills">
          <InlineList
            className="resume-inline-list"
            items={skills.map((skill) => ({ key: skill.id, text: skill.name }))}
          />
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
            <Entry key={item.id} title={item.name} aside={item.date} sub={item.issuer} />
          ))}
        </Section>
      ) : null}

      {languages.length > 0 ? (
        <Section title="Languages">
          <InlineList
            className="resume-inline-list"
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
