import { renderResumeHtml } from "./renderResumeHtml";
import { emptyResume, templateSchema, type Resume, type Template } from "../../lib/schema/resume";

const TEMPLATE_IDS = templateSchema.options;

// Markup-specific tests pin a template; the default may change.
function atsResume(): Resume {
  return { ...emptyResume(), template: "ats" };
}

test.each(TEMPLATE_IDS)(
  "%s renders header, sections, and rich text for a populated resume",
  (template) => {
    const html = renderResumeHtml({
      ...emptyResume(),
      template,
      contact: {
        name: "Ada Lovelace",
        title: "Engineer",
        email: "a@x.com",
        phone: "",
        location: "London",
        website: "",
      },
      summary: { text: "<p>Builder of engines</p>" },
      experience: [
        {
          id: "e1",
          company: "Analytical",
          role: "Lead",
          startDate: "1843",
          endDate: "",
          current: true,
          location: "",
          description: "<ul><li>Notes</li></ul>",
        },
      ],
      skills: [{ id: "s1", name: "Mathematics" }],
    });
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Engineer");
    expect(html).toContain("Builder of engines");
    expect(html).toContain("<li>Notes</li>");
    expect(html).toContain("Mathematics");
    expect(html).toContain("Experience");
  },
);

test.each(TEMPLATE_IDS)("%s escapes plain-text fields (no raw HTML injection)", (template) => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template,
    contact: {
      name: "<script>alert(1)</script>",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
    },
  });
  expect(html).not.toContain("<script>alert(1)</script>");
  expect(html).toContain("&lt;script&gt;");
});

test.each(TEMPLATE_IDS)(
  "%s sanitizes rich text at render even if committed HTML is unsafe",
  (template) => {
    const html = renderResumeHtml({
      ...emptyResume(),
      template,
      summary: { text: '<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)">' },
    });
    expect(html).toContain("<p>ok</p>");
    expect(html).not.toContain("script");
    expect(html).not.toContain("onerror");
  },
);

test.each(TEMPLATE_IDS)("%s omits empty sections", (template) => {
  const html = renderResumeHtml({ ...emptyResume(), template });
  expect(html).not.toContain("Experience");
  expect(html).not.toContain("Summary");
  expect(html).not.toContain("Skills");
});

test.each(TEMPLATE_IDS)("%s renders header links as clickable anchors", (template) => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template,
    links: [
      { id: "k1", label: "linkedin", url: "linkedin.com/in/ada" },
      { id: "k2", label: "", url: "https://cvpeers.com" },
    ],
  });
  expect(html).toContain('href="https://linkedin.com/in/ada"');
  expect(html).toContain(">linkedin</a>");
  // No label falls back to the URL as the visible text.
  expect(html).toContain(">https://cvpeers.com</a>");
  // The preview pane is the running app: a link must not navigate it away.
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noreferrer"');
});

test.each(TEMPLATE_IDS)(
  "%s renders an unsafe link as plain text instead of an anchor",
  (template) => {
    const html = renderResumeHtml({
      ...emptyResume(),
      template,
      links: [{ id: "k1", label: "click me", url: "javascript:alert(1)" }],
    });
    expect(html).toContain("click me");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
  },
);

test("ATS puts links on their own line directly under the contact line", () => {
  const html = renderResumeHtml({
    ...atsResume(),
    contact: {
      name: "Ada",
      title: "",
      email: "a@x.com",
      phone: "",
      location: "London",
      website: "",
    },
    links: [{ id: "k1", label: "linkedin", url: "linkedin.com/in/ada" }],
  });
  const contactLine = /<p class="resume-contact">(.*?)<\/p>/.exec(html);
  const linksLine = /<p class="resume-links">(.*?)<\/p>/.exec(html);
  expect(contactLine?.[1]).toBe("a@x.com · London");
  expect(linksLine?.[1]).toContain(">linkedin</a>");
  // Second line of the same block: links follow the contact line, in the header.
  expect(linksLine?.index).toBeGreaterThan(contactLine?.index ?? 0);
});

// A certification is a one-line item: its name sits inline with the issuer, so
// it must not take the promoted entry-title size (that exists to out-rank bold
// on a heading line and here just jumps two sizes mid-sentence).
test("ATS renders a certification name as an inline item, not a promoted heading", () => {
  const html = renderResumeHtml({
    ...atsResume(),
    certifications: [{ id: "c1", name: "AWS Solutions Architect", issuer: "Amazon", date: "2023" }],
  });
  expect(html).toContain("AWS Solutions Architect");
  expect(html).toContain('class="resume-cert-name"');
  expect(html).not.toContain("resume-entry-title");
});

test("renders the template the resume has chosen", () => {
  const resume: Resume = {
    ...emptyResume(),
    summary: { text: "<p>Builder</p>" },
    experience: [
      {
        id: "e1",
        company: "Analytical",
        role: "Lead",
        startDate: "Jan 2020",
        endDate: "",
        current: true,
        location: "London",
        description: "",
      },
    ],
  };
  expect(renderResumeHtml({ ...resume, template: "minimal" })).toContain(">Profile<");
  expect(renderResumeHtml({ ...resume, template: "executive" })).toContain(
    ">Professional Experience<",
  );
  expect(renderResumeHtml({ ...resume, template: "ats" })).toContain(">Summary<");
});

const NEW_TEMPLATES: readonly Template[] = ["minimal", "executive"];

test.each(NEW_TEMPLATES)("%s keeps each skill on one line in a single flowing list", (template) => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template,
    skills: [
      { id: "s1", name: "CSS Architecture" },
      { id: "s2", name: "React" },
    ],
  });
  expect(html).toContain('<span class="resume-inline-item">CSS Architecture</span>');
  expect(html).toContain('<span class="resume-inline-item">React</span>');
});

test("minimal leads an entry with the role and puts company and place under it", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template: "minimal",
    experience: [
      {
        id: "e1",
        company: "Northwind",
        role: "Engineer",
        startDate: "Mar 2021",
        endDate: "",
        current: true,
        location: "San Francisco, CA",
        description: "",
      },
    ],
  });
  expect(html).toContain('<span class="resume-entry-title">Engineer</span>');
  expect(html).toContain('<span class="resume-entry-dates">Mar 2021 – Present</span>');
  expect(html).toContain('<div class="resume-entry-sub">Northwind · San Francisco, CA</div>');
});

test("executive places skills under the summary instead of a section of their own", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template: "executive",
    summary: { text: "<p>Builder</p>" },
    skills: [{ id: "s1", name: "React" }],
  });
  expect(html).toContain('<p class="resume-skills-label">Skills</p>');
  expect(html.match(/resume-section-title/g)).toHaveLength(1);
});

test("executive heads the section with Skills when there is no summary", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template: "executive",
    skills: [{ id: "s1", name: "React" }],
  });
  expect(html).toContain('<h2 class="resume-section-title">Skills</h2>');
  expect(html).not.toContain("resume-skills-label");
});

test.each(TEMPLATE_IDS)("%s shows the website with the contact details as a link", (template) => {
  const html = renderResumeHtml({
    ...emptyResume(),
    template,
    contact: { ...emptyResume().contact, email: "a@x.com", website: "ada.dev" },
  });
  expect(html).toContain('<a class="resume-link" href="https://ada.dev/"');
  expect(html).toContain(">ada.dev</a>");
});

test("an unsafe website stays plain text", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { ...emptyResume().contact, website: "javascript:alert(1)" },
  });
  expect(html).not.toContain("<a ");
});
