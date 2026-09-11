import { sanitizeDescription, sanitizeSummaryText } from "./sanitizeFields";

test("sanitizeDescription strips scripts from the description field only", () => {
  const item = { id: "1", role: "Eng", description: '<p>ok</p><script>alert(1)</script>' };
  const out = sanitizeDescription(item);
  expect(out.description).not.toContain("script");
  expect(out.role).toBe("Eng");
  expect(out.id).toBe("1");
});

test("sanitizeSummaryText returns a Summary with sanitized text", () => {
  const out = sanitizeSummaryText('<em>hi</em><img src=x onerror="alert(1)">');
  expect(out.text).toContain("<em>hi</em>");
  expect(out.text).not.toContain("img");
});
