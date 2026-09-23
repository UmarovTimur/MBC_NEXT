import { describe, expect, it } from "vitest";
import {
  ChapterParseError,
  azFold,
  normalizeHtmlForCompare,
  parseChapterHtml,
  plainTextToSegmentHtml,
  renderChapterHtml,
  sanitizeBlockHtml,
  verseToPlainText,
} from "./index";

/**
 * A small chapter with the shapes that break naive parsers: a heading before the
 * first verse, two verses sharing one paragraph, a verse spilling into a second
 * block, a spacer block on a verse boundary, and a merged "3-4" range marker.
 * Single-quoted attributes and newlines between blocks, like the corpus.
 */
const CHAPTER = `
<div class='s'>Başlıq</div>
<div class='p'><span class='verse' id='V1'>1&#160;</span>Birinci ayə. <span class='verse' id='V2'>2&#160;</span>İkinci ayə</div>
<div class='q'>şeir sətri davam edir</div>
<div class='b'></div>
<div class='q'><span class='verse' id='V3'>3-4&#160;</span>Birləşmiş ayələr</div>
`;

describe("parseChapterHtml / renderChapterHtml", () => {
  it("round-trips a chapter", () => {
    const rendered = renderChapterHtml(parseChapterHtml(CHAPTER));
    expect(normalizeHtmlForCompare(rendered)).toBe(normalizeHtmlForCompare(CHAPTER));
  });

  it("splits verses and keeps merged ranges", () => {
    const { preamble, verses } = parseChapterHtml(CHAPTER);
    expect(preamble.map((b) => b.cls)).toEqual(["s"]);
    expect(verses.map((v) => [v.v, v.vEnd])).toEqual([
      [1, 1],
      [2, 2],
      [3, 4],
    ]);
    // Verse 2 continues into the next block; the spacer travels with verse 3.
    expect(verses[1]!.segs.map((s) => s.cls)).toEqual(["p", "q"]);
    expect(verses[2]!.before.map((b) => b.cls)).toEqual(["b"]);
  });

  it("wraps every verse segment, with the anchor id on the first one only", () => {
    const html = renderChapterHtml(parseChapterHtml(CHAPTER), { wrapVerses: true });
    // The frontend highlights by data-v and anchors by id (VerseHighlight relies on both).
    expect(html.match(/data-v="2"/g)).toHaveLength(2);
    expect(html.match(/id="V2"/g)).toHaveLength(1);
    expect(html).toContain('data-v="3" data-v-end="4"');
  });

  it("rejects a non-canonical verse marker instead of silently rewriting it", () => {
    const html = "<div class='p'><span class='verse' id='V1'>1 </span>Mətn</div>";
    expect(() => parseChapterHtml(html)).toThrow(ChapterParseError);
  });

  it("rejects nested blocks", () => {
    expect(() => parseChapterHtml("<div class='p'><div class='q'>x</div></div>")).toThrow(ChapterParseError);
  });
});

describe("verse plain text", () => {
  it("round-trips text typed in the admin through segment html", () => {
    const text = 'Ata <oğul> & "Ruh"';
    const segs = [{ cls: "p", html: plainTextToSegmentHtml(text), newBlock: true }];
    expect(verseToPlainText({ v: 1, vEnd: 1, before: [], segs })).toBe(text);
  });
});

describe("sanitizeBlockHtml", () => {
  it("drops disallowed tags and attributes, keeps allowed inline markup", () => {
    const dirty = '<img src=x onerror=alert(1)>Mətn<span class="sc" style="color:red">A</span>';
    expect(sanitizeBlockHtml(dirty)).toBe('Mətn<span class="sc">A</span>');
  });
});

describe("azFold", () => {
  it("folds Azerbaijani letters 1:1 and lowercases", () => {
    expect(azFold("Əli Şükür İnam")).toBe("eli sukur inam");
  });
});
