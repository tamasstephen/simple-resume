import html from "../create/index.html?raw";

test("is the editor shell with its own title and canonical URL", () => {
  expect(html).toContain("<title>Simple Resume — Editor</title>");
  expect(html).toContain('<link rel="canonical" href="https://cvpeers.com/create/" />');
});

test("boots the app from the editor entry", () => {
  expect(html).toContain('<script type="module" src="/src/main.tsx">');
  expect(html).toContain('<div id="root">');
});
