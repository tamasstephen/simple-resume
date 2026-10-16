import html from "../index.html?raw";

const parsed = new DOMParser().parseFromString(html, "text/html");

const editorLinks = [...parsed.querySelectorAll('a[href*="create"]')];

test("every editor link points at /create/ with a trailing slash", () => {
  expect(editorLinks.length).toBeGreaterThanOrEqual(3);
  for (const link of editorLinks) {
    expect(link.getAttribute("href")).toBe("/create/");
  }
});

test("the page has exactly one h1 reading the headline", () => {
  const headings = parsed.querySelectorAll("h1");
  expect(headings).toHaveLength(1);
  expect(headings[0]?.textContent?.trim()).toBe("The preview is the PDF.");
});

test("how-it-works and privacy sections exist", () => {
  expect(parsed.querySelector("section#how-it-works")).not.toBeNull();
  expect(parsed.querySelector("section#privacy")).not.toBeNull();
});

test("the walkthrough has exactly three steps and step 02 is active", () => {
  const steps = parsed.querySelectorAll("[data-walkthrough] > li");
  expect(steps).toHaveLength(3);
  for (const step of steps) {
    expect(step.classList.contains("step")).toBe(true);
  }
  expect(steps[1]?.classList.contains("step--active")).toBe(true);
});

test("the hero chip carries the page-count hook", () => {
  expect(parsed.querySelector("#page-count")?.textContent?.trim()).toBe("A4 · 2 PAGES");
});

test("no script other than JSON-LD and the landing entry", () => {
  const executableSources = [...parsed.querySelectorAll("script")]
    .filter((script) => script.getAttribute("type") !== "application/ld+json")
    .map((script) => script.getAttribute("src"));
  expect(executableSources).toEqual(["/src/landing/main.ts"]);
});
