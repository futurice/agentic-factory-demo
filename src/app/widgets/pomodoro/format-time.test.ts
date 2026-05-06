import { describe, it, expect } from "vitest";
import { formatMmSs } from "./format-time";

describe("formatMmSs", () => {
  it("zero-pads zero", () => {
    expect(formatMmSs(0)).toBe("00:00");
  });

  it("zero-pads single-digit seconds", () => {
    expect(formatMmSs(9)).toBe("00:09");
  });

  it("rolls 65 seconds into 01:05", () => {
    expect(formatMmSs(65)).toBe("01:05");
  });

  it("formats 1500 seconds as 25:00", () => {
    expect(formatMmSs(1500)).toBe("25:00");
  });
});
