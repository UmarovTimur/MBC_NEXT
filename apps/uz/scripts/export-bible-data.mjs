#!/usr/bin/env node
/**
 * Exports bible data from the Payload CMS API to local files so the uz app
 * can be built statically without access to the database.
 *
 * Usage:
 *   node apps/uz/scripts/export-bible-data.mjs <PAYLOAD_API_URL>
 *
 * Example:
 *   node apps/uz/scripts/export-bible-data.mjs http://localhost:8001
 *
 * Output (relative to apps/uz/):
 *   data/manifest.json
 *   data/html/{bibleKey}/{bookNumber}/{chapterId}.html
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const LOCALE = "uz";

const BASE_URL = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!BASE_URL) {
  console.error("Usage: node export-bible-data.mjs <PAYLOAD_API_URL>");
  process.exit(1);
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.json();
}

async function fetchAll(endpoint, params = "") {
  const url = `${BASE_URL}/api/${endpoint}?where[locale][equals]=${LOCALE}&limit=0&depth=0${params}`;
  const data = await getJson(url);
  return data.docs;
}

// ── 1. Fetch raw data ─────────────────────────────────────────────────────────

console.log(`Fetching bible data from ${BASE_URL} (locale: ${LOCALE})…`);

const [rawBibles, rawBookNames, rawChapters] = await Promise.all([
  fetchAll("bibles"),
  fetchAll("bible-books", "&select[bookId]=true&select[name]=true&select[shortName]=true"),
  fetchAll("bible-chapters", "&select[bible]=true&select[bookNumber]=true&select[chapterId]=true"),
]);

const idToKey = new Map(rawBibles.map((d) => [d.id, d.bibleKey]));

// ── 2. Build manifest ─────────────────────────────────────────────────────────

const bibles = rawBibles.map((d) => {
  const attachmentId = typeof d.attachment === "object" ? d.attachment?.id : d.attachment;
  return {
    bibleKey: d.bibleKey,
    primary: d.primary,
    attachment: (attachmentId != null ? idToKey.get(attachmentId) : null) ?? null,
    defaultView: d.defaultView,
    chapterSlug: d.chapterSlug ?? undefined,
    mappingChapterSlug: d.mappingChapterSlug?.length ? d.mappingChapterSlug : undefined,
    formattingStyle: d.formattingStyle ?? undefined,
    introductionName: d.introductionName ?? undefined,
    isIndependent: d.isIndependent ?? undefined,
    isCommentary: d.isCommentary ?? undefined,
  };
});

const bookNames = rawBookNames.map((d) => ({
  bookId: d.bookId,
  name: d.name,
  shortName: d.shortName ?? undefined,
}));

const chapters = rawChapters.map((d) => ({
  bible: idToKey.get(d.bible) ?? String(d.bible),
  bookNumber: d.bookNumber,
  chapterId: d.chapterId,
}));

await mkdir(DATA_DIR, { recursive: true });
await writeFile(
  path.join(DATA_DIR, "manifest.json"),
  JSON.stringify({ bibles, bookNames, chapters }, null, 2),
  "utf-8",
);
console.log(`✓ Wrote data/manifest.json (${bibles.length} bibles, ${bookNames.length} books, ${chapters.length} chapters)`);

// ── 3. Fetch and save chapter HTML ────────────────────────────────────────────

const htmlDir = path.join(DATA_DIR, "html");
let saved = 0;
let skipped = 0;

for (const ch of chapters) {
  const url =
    `${BASE_URL}/api/bible-chapters` +
    `?where[bible.bibleKey][equals]=${encodeURIComponent(ch.bible)}` +
    `&where[bookNumber][equals]=${encodeURIComponent(ch.bookNumber)}` +
    `&where[chapterId][equals]=${encodeURIComponent(ch.chapterId)}` +
    `&limit=1&depth=0&select[html]=true`;

  const data = await getJson(url);
  const html = data.docs[0]?.html ?? null;

  if (!html) {
    skipped++;
    continue;
  }

  const dir = path.join(htmlDir, ch.bible, ch.bookNumber);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${ch.chapterId}.html`), html, "utf-8");
  saved++;

  if (saved % 50 === 0) {
    process.stdout.write(`  ${saved}/${chapters.length} chapters saved…\r`);
  }
}

console.log(`✓ Saved ${saved} HTML files (${skipped} empty/missing chapters skipped)`);
console.log("Done. Commit apps/uz/data/ to the repository.");
