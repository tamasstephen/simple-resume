import { newId } from "./id";

test("newId returns a non-empty string", () => {
  expect(newId().length).toBeGreaterThan(0);
});

test("newId returns distinct values", () => {
  expect(newId()).not.toBe(newId());
});
