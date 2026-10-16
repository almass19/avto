import { describe, expect, test } from "vitest";
import { comparePrice } from "./price";

describe("comparePrice", () => {
  test("returns unknown when market average is missing", () => {
    expect(comparePrice(5_000_000, null)).toEqual({
      verdict: "unknown",
      deltaPercent: null,
    });
  });

  test("treats a price within 5% of average as fair", () => {
    expect(comparePrice(5_500_000, 5_729_000)).toEqual({
      verdict: "fair",
      deltaPercent: -4,
    });
  });

  test("flags prices well below average", () => {
    expect(comparePrice(4_000_000, 5_000_000).verdict).toBe("below_market");
  });

  test("flags prices well above average", () => {
    expect(comparePrice(6_000_000, 5_000_000)).toEqual({
      verdict: "above_market",
      deltaPercent: 20,
    });
  });
});
