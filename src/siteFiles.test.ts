import html from "../index.html?raw";
import robots from "../public/robots.txt?raw";
import sitemap from "../public/sitemap.xml?raw";

const SITE_URL = "https://cvpeers.com/";

test("robots.txt lets crawlers in and points at the sitemap", () => {
  expect(robots).toContain("User-agent: *");
  expect(robots).toMatch(/^Allow: \/$/m);
  expect(robots).toContain(`Sitemap: ${SITE_URL}sitemap.xml`);
});

test("the sitemap is valid XML listing the one page this app has", () => {
  const doc = new DOMParser().parseFromString(sitemap, "application/xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  const locations = [...doc.querySelectorAll("url > loc")].map((node) => node.textContent);
  expect(locations).toEqual([SITE_URL]);
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
