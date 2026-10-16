import { expect, test } from "vitest";
import { getCreateRedirect } from "./redirectCreate";

test("adds the trailing slash to /create", () => {
  expect(getCreateRedirect("/create")).toBe("/create/");
});

test("preserves the query string verbatim", () => {
  expect(getCreateRedirect("/create?x=1")).toBe("/create/?x=1");
  expect(getCreateRedirect("/create?a=1?b=2")).toBe("/create/?a=1?b=2");
});

test("leaves every other path alone", () => {
  expect(getCreateRedirect("/created")).toBeNull();
  expect(getCreateRedirect("/create/")).toBeNull();
  expect(getCreateRedirect("/create/x")).toBeNull();
  expect(getCreateRedirect("/")).toBeNull();
});
