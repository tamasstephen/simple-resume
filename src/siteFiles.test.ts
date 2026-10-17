import html from "../index.html?raw";
import robots from "../public/robots.txt?raw";
import sitemap from "../public/sitemap.xml?raw";
import createHtml from "../create/index.html?raw";
import favicon from "../public/favicon.svg?raw";

const SITE_URL = "https://cvpeers.com/";

test("robots.txt lets crawlers in and points at the sitemap", () => {
  expect(robots).toContain("User-agent: *");
  expect(robots).toMatch(/^Allow: \/$/m);
  expect(robots).toContain(`Sitemap: ${SITE_URL}sitemap.xml`);
});

test("the sitemap is valid XML listing the landing page and the editor", () => {
  const doc = new DOMParser().parseFromString(sitemap, "application/xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  const locations = [...doc.querySelectorAll("url > loc")].map((node) => node.textContent);
  expect(locations).toEqual([SITE_URL, `${SITE_URL}create/`]);
});

// The sitemap and the canonical link must name the same URL: disagreeing
// copies are what makes a page get indexed twice or not at all.
test("the canonical link agrees with the sitemap", () => {
  const canonical = /<link\s+rel="canonical"\s+href="([^"]*)"/.exec(html)?.[1];
  const ogUrl = /<meta\s+property="og:url"\s+content="([^"]*)"/.exec(html)?.[1];
  expect(canonical).toBe(SITE_URL);
  expect(ogUrl).toBe(SITE_URL);

  const doc = new DOMParser().parseFromString(sitemap, "application/xml");
  expect(doc.querySelector("url > loc")?.textContent).toBe(canonical);
});

// Both pages share one icon set: the project's own mark, not the Vite logo
// the scaffold shipped with.
test.each([
  ["landing", html],
  ["editor", createHtml],
])("the %s page links the favicon and the home-screen icon", (_page, source) => {
  expect(source).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
  expect(source).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
});

test("the favicon is the resume-sheet mark in the design-system colours", () => {
  const doc = new DOMParser().parseFromString(favicon, "image/svg+xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  expect(doc.documentElement.getAttribute("viewBox")).toBe("0 0 32 32");
  expect(favicon).toContain("#0070f3");
  expect(favicon).not.toMatch(/863bff|filter/);
});
