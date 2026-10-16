import { joinSubtitle } from "./joinSubtitle";

test("joins non-empty parts with a middle dot", () => {
  expect(joinSubtitle(["Acme", "Berlin"])).toBe("Acme · Berlin");
});

test("drops empty parts and returns an empty string when none remain", () => {
  expect(joinSubtitle(["", "Berlin"])).toBe("Berlin");
  expect(joinSubtitle(["", ""])).toBe("");
});
