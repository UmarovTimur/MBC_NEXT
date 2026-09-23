import { describe, expect, it } from "vitest";
import { formatChapterName } from "./chapter-name";

const NBSP = " ";

describe("formatChapterName", () => {
  it("builds '<ordinal> <noun>' joined by a non-breaking space", () => {
    expect(formatChapterName({ locale: "az", slug: "fəsil" }, "3")).toBe(`3-cü${NBSP}fəsil`);
  });

  it("prefers an explicit name, but falls through where the list is shorter than the book", () => {
    const naming = { locale: "az", slug: "fəsil", mapping: ["Giriş", "Xüsusi ad"] };
    expect(formatChapterName(naming, "1")).toBe("Xüsusi ad");
    expect(formatChapterName(naming, "2")).toBe(`2-ci${NBSP}fəsil`);
  });

  it("names chapter 0 after the introduction", () => {
    expect(formatChapterName({ slug: "fəsil", introducingName: "Ön söz" }, "0")).toBe("Ön söz");
  });
});
