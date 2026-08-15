import { STRUCTURAL_CLASSES } from "./constants";
import { isCanonicalMarkerLabel, verseMarkerLabel } from "./label";
import type { Block, ChapterDoc, Segment, VerseRecord } from "./types";

/**
 * Every literal space here is `\s+` on purpose: 70 of the 31 072 verse-marker tags
 * in the azb corpus have their attributes split across newlines. A regex that
 * assumes single-space formatting matches 31 002 of them and silently drops the
 * rest — which is exactly the kind of loss that round-trips fine on a spot check
 * and destroys nine chapters in production.
 */
const TOKEN =
  /<div\s+class=(['"])(.*?)\1\s*>|(<\/div\s*>)|<span\s+class=(['"])verse\4\s+id=(['"])V(\d+)\5\s*>([\s\S]*?)<\/span\s*>|(<[^>]+>)|([^<]+)/g;

/** Counts real verse markers in the source, independent of the tokenizer. */
const VERSE_ATTR = /class=(['"])verse\1/g;

export class ChapterParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChapterParseError";
  }
}

type RawPart = { v: number | null; label: string; html: string };
type RawBlock = { cls: string; parts: RawPart[] };

function hasVerse(b: RawBlock): boolean {
  return b.parts.some((p) => p.v !== null);
}

/** Text of a block that precedes its first verse marker (i.e. belongs to the previous verse). */
function leadHtml(b: RawBlock): string {
  const firstV = b.parts.findIndex((p) => p.v !== null);
  const upto = firstV === -1 ? b.parts.length : firstV;
  return b.parts.slice(0, upto).map((p) => p.html).join("");
}

/**
 * Does the next real text belong to a NEW verse?
 *
 * This decides whether a heading block is apparatus sitting on a verse boundary
 * (2379 cases — attach it to the following verse) or an interruption in the middle
 * of one (10 cases, mostly `sp` speaker labels in Song of Songs — leave it inline,
 * or re-rendering reorders it ahead of the text it interrupts).
 */
function verseStartsNextText(blocks: RawBlock[], i: number): boolean {
  for (let j = i + 1; j < blocks.length; j += 1) {
    const b = blocks[j]!;
    if (STRUCTURAL_CLASSES.has(b.cls) && !hasVerse(b)) continue;
    if (leadHtml(b).trim() !== "") return false;
    return hasVerse(b);
  }
  return false;
}

function tokenizeBlocks(html: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  let cls: string | null = null;
  let parts: RawPart[] | null = null;

  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(html)) !== null) {
    const [full, , openCls, close, , , vNum, vLabel, otherTag] = m;

    if (openCls !== undefined) {
      if (cls !== null) {
        throw new ChapterParseError(
          `nested <div> detected (inside class='${cls}'); the parser assumes a flat block list`,
        );
      }
      cls = openCls;
      parts = [{ v: null, label: "", html: "" }];
    } else if (close !== undefined) {
      if (cls !== null && parts !== null) blocks.push({ cls, parts });
      cls = null;
      parts = null;
    } else if (vNum !== undefined) {
      if (parts === null) {
        throw new ChapterParseError(`verse marker V${vNum} found outside any block`);
      }
      parts.push({ v: Number(vNum), label: vLabel ?? "", html: "" });
    } else if (parts !== null) {
      // Any other tag (e.g. the single inline <span class='sc'>) and all text
      // pass through verbatim into the current part.
      parts[parts.length - 1]!.html += otherTag ?? full;
    }
  }

  if (cls !== null) {
    throw new ChapterParseError(`unclosed <div class='${cls}'>`);
  }
  return blocks;
}

/** `"16-17&#160;"` -> 17 ; `"3&#160;"` -> 3 */
function labelEnd(label: string, fallback: number): number {
  const m = /^\s*(\d+)(?:\s*[-–]\s*(\d+))?/.exec(label.replace(/&#160;|&nbsp;| /g, " "));
  if (!m) return fallback;
  return m[2] ? Number(m[2]) : Number(m[1]);
}

export function parseChapterHtml(html: string): ChapterDoc {
  const blocks = tokenizeBlocks(html);

  const preamble: Block[] = [];
  const verses: VerseRecord[] = [];
  let pending: Block[] = [];
  let cur: VerseRecord | null = null;

  for (let i = 0; i < blocks.length; i += 1) {
    const b = blocks[i]!;

    if (!hasVerse(b)) {
      const html0 = b.parts[0]!.html;
      if (cur === null) {
        preamble.push({ cls: b.cls, html: html0 });
      } else if (STRUCTURAL_CLASSES.has(b.cls) && verseStartsNextText(blocks, i)) {
        pending.push({ cls: b.cls, html: html0 });
      } else {
        cur.segs.push({ cls: b.cls, html: html0, newBlock: true });
      }
      continue;
    }

    const firstV = b.parts.findIndex((p) => p.v !== null);
    const lead = leadHtml(b);
    // Whitespace-only lead text is not a continuation: `<div class='p'> <span verse…`
    // is the overwhelmingly common shape and the verse owns that block outright.
    const leadIsReal = lead.trim() !== "";
    if (leadIsReal && cur !== null) {
      cur.segs.push({ cls: b.cls, html: lead, newBlock: true });
    }

    for (let pi = 0; pi < b.parts.length; pi += 1) {
      const p = b.parts[pi]!;
      if (p.v === null) continue;
      const seg: Segment = {
        cls: b.cls,
        html: p.html,
        newBlock: pi === firstV && !leadIsReal,
      };
      const vEnd = labelEnd(p.label, p.v);
      // The label is derived on render rather than stored, so any corpus whose
      // marker text is not exactly `n` / `n-m` plus a non-breaking space has to
      // fail loudly here — otherwise re-rendering would silently rewrite it.
      if (!isCanonicalMarkerLabel(p.label, p.v, vEnd)) {
        throw new ChapterParseError(
          `verse V${p.v} has a non-canonical marker label ${JSON.stringify(p.label)}; ` +
            `expected ${JSON.stringify(verseMarkerLabel(p.v, vEnd))}`,
        );
      }
      cur = {
        v: p.v,
        vEnd,
        before: pending,
        segs: [seg],
      };
      pending = [];
      verses.push(cur);
    }
  }

  // Trailing apparatus with no verse to attach to (does not occur in azb, but a
  // silent drop here would be invisible until the round-trip check failed).
  if (pending.length > 0 && verses.length > 0) {
    verses[verses.length - 1]!.segs.push(
      ...pending.map((b) => ({ ...b, newBlock: true })),
    );
    pending = [];
  }

  assertIntegrity(html, verses);
  return { preamble, verses };
}

function assertIntegrity(html: string, verses: VerseRecord[]): void {
  VERSE_ATTR.lastIndex = 0;
  const expected = (html.match(VERSE_ATTR) ?? []).length;
  if (expected !== verses.length) {
    throw new ChapterParseError(
      `verse marker count mismatch: source has ${expected}, parser produced ${verses.length}`,
    );
  }
  for (let i = 1; i < verses.length; i += 1) {
    if (verses[i]!.v <= verses[i - 1]!.v) {
      throw new ChapterParseError(
        `verse numbers not strictly ascending: V${verses[i - 1]!.v} then V${verses[i]!.v}`,
      );
    }
  }
}
