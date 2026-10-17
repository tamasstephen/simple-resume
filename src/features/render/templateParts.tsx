import { Fragment, type ReactNode } from "react";
import { sanitizeHtml } from "../../lib/sanitizeHtml";
import { toSafeHref } from "../../lib/safeUrl";
import type { ContactHeader, EducationItem, LanguageItem, LinkItem } from "../../lib/schema/resume";

// Building blocks every template shares. Templates differ in markup and
// styles; what text a field turns into, and how unsafe input is handled,
// must not differ between them.

const META_SEPARATOR = " · ";

// Rich text is sanitized here (render time) as defense-in-depth: data imported
// via REPLACE_ALL can reach committed state without passing the editor's
// Save-time sanitizer.
export function RichText({ html }: { html: string }) {
  if (html.length === 0) return null;
  return <div className="resume-rich" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

export function join(parts: readonly string[], sep: string): string {
  return parts.filter((part) => part.length > 0).join(sep);
}

export function formatDateRange({
  startDate,
  endDate,
  isCurrent = false,
}: {
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}): string {
  return join([startDate, isCurrent ? "Present" : endDate], " – ");
}

export function formatLanguage(language: LanguageItem): string {
  return language.proficiency.length > 0
    ? `${language.name} (${language.proficiency})`
    : language.name;
}

export type MetaPart = { key: string; node: ReactNode };

/** A run of contact facts or links separated by middle dots. */
export function MetaLine({ className, parts }: { className: string; parts: readonly MetaPart[] }) {
  if (parts.length === 0) return null;

  return (
    <p className={className}>
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 ? META_SEPARATOR : null}
          {part.node}
        </Fragment>
      ))}
    </p>
  );
}

export function contactParts(contact: ContactHeader): MetaPart[] {
  return [contact.email, contact.phone, contact.location]
    .filter((value) => value.length > 0)
    .map((value) => ({ key: value, node: value }));
}

// Each link is a real anchor so it stays clickable in the preview and in the
// exported PDF; a URL the safe-href check refuses keeps its text and simply is
// not linked.
export function linkParts(links: readonly LinkItem[]): MetaPart[] {
  return links
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
    });
}

/** Items separated by middle dots that wrap as whole items: a two-word skill
 *  never breaks across lines. One flowing line, never a grid — multi-column
 *  layouts do not paginate reliably. */
export function InlineList({
  className,
  items,
}: {
  className: string;
  items: readonly { key: string; text: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <p className={className}>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? META_SEPARATOR : null}
          <span className="resume-inline-item">{item.text}</span>
        </Fragment>
      ))}
    </p>
  );
}

export const ENTRY_SEPARATOR = " · ";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title">{title}</h2>
      {children}
    </section>
  );
}

/** One entry: a title with its date (or URL) on the right, an optional
 *  second line, then the description. */
export function Entry({
  title,
  aside,
  sub,
  html = "",
}: {
  title: string;
  aside: string;
  sub: string;
  html?: string;
}) {
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <span className="resume-entry-title">{title}</span>
        {aside.length > 0 ? <span className="resume-entry-dates">{aside}</span> : null}
      </div>
      {sub.length > 0 ? <div className="resume-entry-sub">{sub}</div> : null}
      <RichText html={html} />
    </div>
  );
}

export function educationTitle(item: EducationItem): string {
  const degree = join([item.degree, item.field], ", ");
  return degree.length > 0 ? degree : item.institution;
}

export function educationSub(item: EducationItem): string {
  return educationTitle(item) === item.institution ? "" : item.institution;
}
