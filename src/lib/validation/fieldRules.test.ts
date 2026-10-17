import {
  MESSAGES,
  isMonthYearBefore,
  parseMonthYear,
  validateEmail,
  validateMonthYear,
  validatePhone,
  validateWebAddress,
} from "./fieldRules";

describe("parseMonthYear", () => {
  test.each([
    ["03/2020", { month: 3, year: 2020 }],
    ["3/2020", { month: 3, year: 2020 }],
    [" 12 / 2019 ", { month: 12, year: 2019 }],
    ["Mar 2020", { month: 3, year: 2020 }],
    ["mar. 2020", { month: 3, year: 2020 }],
    ["March 2020", { month: 3, year: 2020 }],
    ["Sept 2021", { month: 9, year: 2021 }],
    ["June, 2018", { month: 6, year: 2018 }],
  ])("reads %j", (raw, expected) => {
    expect(parseMonthYear(raw)).toEqual(expected);
  });

  test.each(["13/2020", "0/2020", "2020-03", "2020", "Ma 2020", "Marchy 2020", "03/20", ""])(
    "rejects %j",
    (raw) => {
      expect(parseMonthYear(raw)).toBeNull();
    },
  );
});

test("isMonthYearBefore orders by year, then month", () => {
  expect(isMonthYearBefore({ year: 2019, month: 12 }, { year: 2020, month: 1 })).toBe(true);
  expect(isMonthYearBefore({ year: 2020, month: 3 }, { year: 2020, month: 3 })).toBe(false);
  expect(isMonthYearBefore({ year: 2020, month: 4 }, { year: 2020, month: 3 })).toBe(false);
});

test("validateMonthYear allows empty and explains the format otherwise", () => {
  expect(validateMonthYear("")).toBeNull();
  expect(validateMonthYear("Jan 2020")).toBeNull();
  expect(validateMonthYear("2020-01")).toBe(MESSAGES.monthYear);
});

describe("validateEmail", () => {
  test.each(["", "ada@example.com", "ada.lovelace+cv@mail.co.uk"])("accepts %j", (value) => {
    expect(validateEmail(value)).toBeNull();
  });

  test.each(["yep@", "yep", "@example.com", "ada@example", "ada@exa mple.com", "a@b.c"])(
    "rejects %j",
    (value) => {
      expect(validateEmail(value)).toBe(MESSAGES.email);
    },
  );
});

describe("validatePhone", () => {
  test.each(["", "+1 (555) 123-4567", "030 1234 5678", "+49.30.1234567"])("accepts %j", (value) => {
    expect(validatePhone(value)).toBeNull();
  });

  test("rejects letters and a plus anywhere but the start", () => {
    expect(validatePhone("555-CALL-NOW")).toBe(MESSAGES.phoneCharacters);
    expect(validatePhone("555+1234567")).toBe(MESSAGES.phoneCharacters);
  });

  test("rejects too few or too many digits", () => {
    expect(validatePhone("123 45")).toBe(MESSAGES.phoneLength);
    expect(validatePhone("1234567890123456")).toBe(MESSAGES.phoneLength);
  });
});

describe("validateWebAddress", () => {
  test.each(["", "github.com/ada", "https://ada.dev", "mailto:ada@example.com"])(
    "accepts %j",
    (value) => {
      expect(validateWebAddress(value)).toBeNull();
    },
  );

  test.each(["github", "javascript:alert(1)", "http://", "mailto:yep@"])("rejects %j", (value) => {
    expect(validateWebAddress(value)).not.toBeNull();
  });
});
