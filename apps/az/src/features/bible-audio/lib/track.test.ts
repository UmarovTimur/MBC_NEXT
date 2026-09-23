import type { BibleManifest } from "@/entities/bible";
import { describe, expect, it } from "vitest";
import { adjacentTrack, isTrackPage, resolveTrack, sameTrack, trackHref } from "./track";

const manifest: BibleManifest = {
  bibles: [
    {
      bibleName: "azb",
      primary: "Bibliya",
      isIndependent: true,
      isCommentary: false,
      chapterNaming: { locale: "az", slug: "fəsil" },
      books: [
        { id: "01", name: "Yaradılış", chapters: ["1", "2", "3"] },
        { id: "02", name: "Çıxış", chapters: ["1", "2"] },
      ],
    },
  ],
};

const track = (bookId: string, chapterId: string) => ({ bible: "azb", bookId, chapterId });

describe("adjacentTrack", () => {
  it("moves within a book", () => {
    expect(adjacentTrack(manifest, track("01", "2"), 1)).toEqual(track("01", "3"));
    expect(adjacentTrack(manifest, track("01", "2"), -1)).toEqual(track("01", "1"));
  });

  it("crosses into the neighbouring book", () => {
    expect(adjacentTrack(manifest, track("01", "3"), 1)).toEqual(track("02", "1"));
    expect(adjacentTrack(manifest, track("02", "1"), -1)).toEqual(track("01", "3"));
  });

  it("stops at the ends of the bible", () => {
    expect(adjacentTrack(manifest, track("01", "1"), -1)).toBeNull();
    expect(adjacentTrack(manifest, track("02", "2"), 1)).toBeNull();
  });
});

describe("track pages", () => {
  it("matches the chapter route with or without the trailing slash", () => {
    expect(trackHref(track("01", "2"))).toBe("/azb/01/2");
    expect(isTrackPage("/azb/01/2/", track("01", "2"))).toBe(true);
    expect(isTrackPage("/azb/01/2", track("01", "2"))).toBe(true);
    expect(isTrackPage("/azb/01/20/", track("01", "2"))).toBe(false);
  });

  it("compares tracks by value", () => {
    expect(sameTrack(track("01", "2"), track("01", "2"))).toBe(true);
    expect(sameTrack(null, track("01", "2"))).toBe(false);
  });
});

describe("resolveTrack", () => {
  it("resolves the recording url and labels", () => {
    const resolved = resolveTrack(manifest, track("01", "2"));
    expect(resolved?.url).toMatch(/\/azb\/01\/02\.mp3$/);
    expect(resolved?.bookName).toBe("Yaradılış");
    expect(resolved?.chapterName).toBe("2-ci fəsil");
  });
});
