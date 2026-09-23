import { describe, expect, it } from "vitest";
import { formatOrdinal, stripLeadingOrdinal } from "./ordinal";

describe("formatOrdinal (az)", () => {
  it.each([
    [1, "1-ci"],
    [3, "3-cü"],
    [6, "6-cı"],
    [9, "9-cu"],
    [10, "10-cu"],
    [40, "40-cı"],
    [100, "100-cü"],
    // Governed by the last non-zero group: 150 follows "əlli", not "yüz".
    [150, "150-ci"],
  ])("%i → %s", (n, expected) => {
    expect(formatOrdinal(n, "az")).toBe(expected);
  });

  it("leaves numbers plain without locale rules or for non-ordinals", () => {
    expect(formatOrdinal(12)).toBe("12");
    expect(formatOrdinal(0, "az")).toBe("0");
  });
});

describe("stripLeadingOrdinal", () => {
  it("drops a suffix fused to the noun by older configs", () => {
    expect(stripLeadingOrdinal("-ci fəsil")).toBe("fəsil");
    expect(stripLeadingOrdinal("fəsil")).toBe("fəsil");
  });
});
