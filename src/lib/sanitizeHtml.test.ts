import { sanitizeHtml } from "./sanitizeHtml";

test("keeps allowlisted formatting tags", () => {
  const out = sanitizeHtml("<p>Hello <strong>world</strong></p><ul><li>a</li></ul>");
  expect(out).toContain("<strong>world</strong>");
  expect(out).toContain("<li>a</li>");
});

test("strips script tags", () => {
  const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
  expect(out).not.toContain("script");
  expect(out).toContain("<p>ok</p>");
});

test("strips event-handler and other attributes", () => {
  const out = sanitizeHtml('<p onclick="alert(1)" class="x">hi</p>');
  expect(out).not.toContain("onclick");
  expect(out).not.toContain("class");
  expect(out).toContain("hi");
});

test("strips disallowed tags like img but keeps text", () => {
  const out = sanitizeHtml('<img src=x onerror="alert(1)"><em>note</em>');
  expect(out).not.toContain("<img");
  expect(out).toContain("<em>note</em>");
});
