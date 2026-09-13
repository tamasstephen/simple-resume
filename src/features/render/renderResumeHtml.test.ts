import { renderResumeHtml } from "./renderResumeHtml";
import { emptyResume } from "../../lib/schema/resume";

test("renders header, sections, and rich text for a populated resume", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: {
      name: "Ada Lovelace",
      title: "Engineer",
      email: "a@x.com",
      phone: "",
      location: "London",
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
});

test("escapes plain-text fields (no raw HTML injection)", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { name: "<script>alert(1)</script>", title: "", email: "", phone: "", location: "" },
  });
  expect(html).not.toContain("<script>alert(1)</script>");
  expect(html).toContain("&lt;script&gt;");
});

test("sanitizes rich text at render even if committed HTML is unsafe", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    summary: { text: '<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)">' },
  });
  expect(html).toContain("<p>ok</p>");
  expect(html).not.toContain("script");
  expect(html).not.toContain("onerror");
});

test("omits empty sections", () => {
  const html = renderResumeHtml(emptyResume());
  expect(html).not.toContain("Experience");
  expect(html).not.toContain("Summary");
  expect(html).not.toContain("Skills");
});

test("renders header links as clickable anchors", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
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

test("renders an unsafe link as plain text instead of an anchor", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    links: [{ id: "k1", label: "click me", url: "javascript:alert(1)" }],
  });
  expect(html).toContain("click me");
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("<a ");
});

test("puts links on their own line directly under the contact line", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { name: "Ada", title: "", email: "a@x.com", phone: "", location: "London" },
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
test("renders a certification name as an inline item, not a promoted heading", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    certifications: [{ id: "c1", name: "AWS Solutions Architect", issuer: "Amazon", date: "2023" }],
  });
  expect(html).toContain("AWS Solutions Architect");
  expect(html).toContain('class="resume-cert-name"');
  expect(html).not.toContain("resume-entry-title");
});
