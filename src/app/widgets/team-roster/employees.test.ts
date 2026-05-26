import { describe, expect, test } from "vitest";
import { EMPLOYEES } from "./employees";

describe("EMPLOYEES fixture", () => {
  test("all employee ids are unique", () => {
    const ids = EMPLOYEES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
