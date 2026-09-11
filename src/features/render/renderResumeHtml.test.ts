import { renderResumeHtml } from "./renderResumeHtml";
import { emptyResume } from "../../lib/schema/resume";

test("renders header, sections, and rich text for a populated resume", () => {
  const html = renderResumeHtml({
    ...emptyResume(),
    contact: { name: "Ada Lovelace", title: "Engineer", email: "a@x.com", phone: "", location: "London" },
    summary: { text: "<p>Builder of engines</p>" },
    experience: [
      { id: "e1", company: "Analytical", role: "Lead", startDate: "1843", endDate: "", current: true, location: "", description: "<ul><li>Notes</li></ul>" },
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
