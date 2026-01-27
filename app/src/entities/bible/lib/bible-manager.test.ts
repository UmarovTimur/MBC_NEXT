import { describe, it } from "vitest";
import { Bible } from "./bible";
import { BibleManager } from "./bible-manager";
import { Chapter } from "../model/types";
import { HTML_SRC_DIR } from "@/shared/config/paths";
import path from "path";
import assert from "node:assert";

describe("Bible manager", () => {
  it("Should traverse all chapters and return correct fields", async () => {
    const mockPath = path.join(HTML_SRC_DIR, "MBC");
    const mockBible = await Bible.init(mockPath);
    if (!mockBible) {
      throw new Error("Failed to initialize Bible");
    }
    const manager = new BibleManager([mockBible]);
    const chapters: Chapter[] = [];
    manager.traverseChapter((chapter) => {
      chapters.push(chapter);
    });

    assert.notStrictEqual(chapters.length, 0, "No chapters were traversed");

    for (const chapter of chapters) {
      assert.strictEqual(typeof chapter.bible, "string", "Chapter bible field is not a string");
      assert.strictEqual(typeof chapter.bookId, "string", "Chapter bookId field is not a string");
      assert.strictEqual(typeof chapter.chapterId, "string", "Chapter chapterId field is not a string");
    }
  });
});
