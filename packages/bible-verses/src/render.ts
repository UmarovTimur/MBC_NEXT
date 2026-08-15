import { verseMarkerLabel } from "./label";
import { sanitizeBlockHtml } from "./sanitize";
import type { Block, ChapterDoc, RenderOptions, VerseRecord } from "./types";

function openTag(cls: string): string {
  return `<div class='${cls}'>`;
}

function block(b: Block): string {
  return `${openTag(b.cls)}${sanitizeBlockHtml(b.html)}</div>`;
}

/**
 * Verse-number marker. With wrapping enabled the `id` moves out to the wrapper so
 * the anchor still resolves (`#V3`) while pointing at the whole verse rather than
 * just its number.
 */
function marker(v: VerseRecord, wrapped: boolean): string {
  const label = verseMarkerLabel(v.v, v.vEnd);
  return wrapped
    ? `<span class="verse">${label}</span>`
    : `<span class="verse" id="V${v.v}">${label}</span>`;
}

function wrapperOpen(v: VerseRecord, first: boolean): string {
  const attrs = [
    `class="v"`,
    // Only the first segment carries the id — 41% of verses emit several wrappers
    // and duplicate ids would break both the anchor and querySelector.
    first ? `id="V${v.v}"` : null,
    `data-v="${v.v}"`,
    v.vEnd !== v.v ? `data-v-end="${v.vEnd}"` : null,
  ].filter(Boolean);
  return `<span ${attrs.join(" ")}>`;
}

/**
 * Rebuild chapter HTML from its verse records.
 *
 * Inverse of `parseChapterHtml`: verified to round-trip all 1189 azb chapters
 * under `normalizeHtmlForCompare`. The one structural subtlety is `newBlock` —
 * a first segment with `newBlock: false` means the verse began part-way through
 * the block the previous verse already opened, so its markup is appended into the
 * div just emitted instead of opening a new one.
 */
export function renderChapterHtml(doc: ChapterDoc, opts: RenderOptions = {}): string {
  const wrap = opts.wrapVerses === true;
  const out: string[] = [];

  for (const b of doc.preamble) out.push(block(b));

  for (const verse of doc.verses) {
    for (const b of verse.before) out.push(block(b));

    verse.segs.forEach((seg, i) => {
      const body = sanitizeBlockHtml(seg.html);
      const inner =
        i === 0
          ? `${marker(verse, wrap)}${body}`
          : body;
      const piece = wrap ? `${wrapperOpen(verse, i === 0)}${inner}</span>` : inner;

      if (i === 0 && !seg.newBlock && out.length > 0 && out[out.length - 1]!.endsWith("</div>")) {
        const prev = out[out.length - 1]!;
        out[out.length - 1] = `${prev.slice(0, -"</div>".length)}${piece}</div>`;
      } else {
        out.push(`${openTag(seg.cls)}${piece}</div>`);
      }
    });
  }

  return out.join("");
}

/** Renders a single verse in isolation — used by the admin preview. */
export function renderVerseHtml(verse: VerseRecord, opts: RenderOptions = {}): string {
  return renderChapterHtml({ preamble: [], verses: [verse] }, opts);
}
