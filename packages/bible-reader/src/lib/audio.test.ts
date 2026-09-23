import { describe, expect, it } from "vitest";
import { chapterAudioFileName, resolveChapterAudioUrl } from "./audio";

describe("chapterAudioFileName", () => {
  it("pads to two digits, or three for books with 100+ chapters", () => {
    expect(chapterAudioFileName("9", 9)).toBe("09.mp3");
    expect(chapterAudioFileName("1", 150)).toBe("001.mp3");
    expect(chapterAudioFileName("150", 150)).toBe("150.mp3");
  });
});

describe("resolveChapterAudioUrl", () => {
  it("pads by the highest chapter id, so an intro chapter '0' doesn't skew it", () => {
    // 100 ids ("0".."99"): counting them would wrongly pad to three digits.
    const ids = Array.from({ length: 100 }, (_, i) => String(i));
    expect(resolveChapterAudioUrl("azb", "01", ids, "5")).toMatch(/\/azb\/01\/05\.mp3$/);
  });

  it("returns null for bibles without recordings or chapters the book lacks", () => {
    expect(resolveChapterAudioUrl("barclay", "40", ["1", "2"], "1")).toBeNull();
    expect(resolveChapterAudioUrl("azb", "01", ["1", "2"], "3")).toBeNull();
  });
});
