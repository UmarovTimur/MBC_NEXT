#!/usr/bin/env node
/**
 * Generates apps/uz/html/manifest.json from the existing HTML files and uz.json config.
 * Run this whenever new HTML files are added to apps/uz/html/.
 *
 * Usage (from repo root):
 *   node apps/uz/scripts/generate-data.mjs
 */

import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_DIR = path.resolve(__dirname, "../html");
const UZ_BIBLES_JSON = path.resolve(__dirname, "../src/shared/config/bibles/uz.json");

const uzConfig = JSON.parse(await readFile(UZ_BIBLES_JSON, "utf-8"));

// ── Bible definitions ─────────────────────────────────────────────────────────

const bibles = Object.entries(uzConfig).map(([bibleKey, cfg]) => ({
  bibleKey,
  primary: cfg.primary,
  attachment: cfg.attachment ?? null,
  defaultView: cfg.defaultView ?? "single-column",
  chapterSlug: cfg.chapterSlug ?? undefined,
  mappingChapterSlug: cfg.mappingChapterSlug ?? undefined,
  formattingStyle: cfg.formattingStyle ?? undefined,
  introductionName: cfg.introductionName ?? undefined,
  isIndependent: cfg.isIndependent ?? undefined,
  isCommentary: cfg.isCommentary ?? undefined,
}));

// ── Book names ────────────────────────────────────────────────────────────────

const firstMapping = Object.values(uzConfig)[0].mappingBible ?? [];
const bookNames = firstMapping.map((name, i) => ({
  bookId: String(i + 1).padStart(2, "0"),
  name,
}));

// ── Discover chapters from html/{bibleKey}/{bookNumber}/*.html ────────────────

const chapters = [];

const bibleDirs = (await readdir(HTML_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && d.name !== "manifest.json")
  .map((d) => d.name)
  .sort();

for (const bibleKey of bibleDirs) {
  const bibleDir = path.join(HTML_DIR, bibleKey);
  const bookDirs = (await readdir(bibleDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => +a - +b);

  for (const bookNumber of bookDirs) {
    const files = (await readdir(path.join(bibleDir, bookNumber)))
      .filter((f) => f.endsWith(".html"))
      .sort((a, b) => +a.replace(".html", "") - +b.replace(".html", ""));

    for (const file of files) {
      // Strip leading zeros: "01.html" → "1", "00.html" → "0", "150.html" → "150"
      const chapterId = String(parseInt(file.replace(".html", ""), 10));
      chapters.push({ bible: bibleKey, bookNumber, chapterId });
    }
  }
}

// ── Write manifest ────────────────────────────────────────────────────────────

const manifest = { bibles, bookNames, chapters };
await writeFile(
  path.join(HTML_DIR, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf-8",
);
console.log(
  `✓ html/manifest.json: ${bibles.length} bibles, ${bookNames.length} book names, ${chapters.length} chapters`,
);
