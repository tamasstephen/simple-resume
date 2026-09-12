import { toSafeHref } from "./safeUrl";

test("keeps an absolute http(s) URL", () => {
  expect(toSafeHref("https://cvpeers.com/x")).toBe("https://cvpeers.com/x");
  expect(toSafeHref("http://example.com/")).toBe("http://example.com/");
});

test("assumes https for a URL typed without a scheme", () => {
  expect(toSafeHref("linkedin.com/in/ada")).toBe("https://linkedin.com/in/ada");
});

test("keeps a mailto address", () => {
  expect(toSafeHref("mailto:ada@example.com")).toBe("mailto:ada@example.com");
});

test("rejects script-bearing schemes", () => {
  expect(toSafeHref("javascript:alert(1)")).toBeNull();
  expect(toSafeHref("  JavaScript:alert(1)")).toBeNull();
  // The URL parser strips embedded tabs/newlines, so this is still javascript:.
  expect(toSafeHref("java\nscript:alert(1)")).toBeNull();
  expect(toSafeHref("data:text/html,<script>alert(1)</script>")).toBeNull();
});

test("rejects a blank or unparseable value", () => {
  expect(toSafeHref("   ")).toBeNull();
  expect(toSafeHref("http://")).toBeNull();
});
