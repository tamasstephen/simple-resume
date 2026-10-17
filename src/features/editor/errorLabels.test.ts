import { listErrorLabels } from "./errorLabels";

test("lists invalid fields by label in form order, skipping valid ones", () => {
  const labels = { startDate: "Start date", endDate: "End date", url: "URL" };
  const errors = { url: "Enter a web address.", endDate: null, startDate: "Required." };
  expect(listErrorLabels({ errors, labels })).toEqual(["Start date", "URL"]);
});
