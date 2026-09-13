// Vite's ?raw import keeps this a browser-side test (no node types needed).
import html from "../index.html?raw";

const attribute = (tag: string, name: string): string | null =>
  new RegExp(`<meta\\s+${tag}="${name}"\\s+content="([^"]*)"`).exec(html)?.[1] ?? null;

test("describes the app for search results", () => {
  const description = attribute("name", "description");
  expect(description).not.toBeNull();
  // Google truncates around 160 characters; under ~50 says nothing useful.
  expect(description?.length).toBeGreaterThan(50);
  expect(description?.length).toBeLessThanOrEqual(160);
  expect(html).toContain("<title>Simple Resume</title>");
});

test("carries link-preview metadata", () => {
  expect(attribute("property", "og:title")).toBe("Simple Resume");
  expect(attribute("property", "og:type")).toBe("website");
  expect(attribute("property", "og:description")).toBe(attribute("name", "description"));
  expect(attribute("name", "twitter:card")).toBe("summary");
});

// A malformed JSON-LD block fails silently — the page renders, the data is
// simply ignored. Parse it here so a stray comma cannot ship.
test("publishes valid structured data describing the application", () => {
  const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
  expect(raw).toBeDefined();
  const data: unknown = JSON.parse(raw ?? "");
  expect(data).toMatchObject({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simple Resume",
    applicationCategory: "BusinessApplication",
    isAccessibleForFree: true,
  });
});
