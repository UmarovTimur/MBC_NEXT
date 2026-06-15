import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";
import { readdir, readFile, writeFile, mkdir, rm } from "fs/promises";

const execFileP = promisify(execFile);

// Resolve paths relative to THIS script, so it works no matter what
// directory you run `node ...` from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ------------------------------------------------------------------
// Folder with your source books (.pdf / .docx / .doc / .html).
// One file = one Bible book.
const SRC_DIR = path.join(__dirname, "docx");
// Where the split chapters go: DEST_DIR/<bookNN>/<chapterNN>.html
const DEST_DIR = path.join(__dirname, "html");

// Save the text before the 1st chapter (introduction) as 00.html ?
const SAVE_INTRO = true;
// Remove <a>...</a> wrappers (keep their text), like in your old script.
const STRIP_LINKS = true;
// Strip ALL styling: unwrap presentational tags and delete every attribute,
// so the only formatting left is the semantic tag itself
// (<p>, <h1>, <i>, <b>, <ul>, ...). <font>, inline styles, face/color etc. go.
const STRIP_STYLING = true;
// Pure styling / LibreOffice wrappers that get unwrapped (inner content kept).
const UNWRAP_TAGS = ["font", "sdfield"];
// Remove <p>/<h1..h6> blocks that are empty after cleaning.
const REMOVE_EMPTY = true;
// ------------------------------------------------------------------

// Canonical Bible order (Azerbaijani). Index 0 => book 1 ... index 65 => 66.
// This list is the single source of truth for book numbers.
export const AZ_BOOKS_NAMES = [
  "Yaradiliş", "Çixiş", "Levililər", "Saylar", "Qanunun Təkrari",
  "Yeşua", "Hakimlər", "Rut",
  "Birinci Şamuel", "Ikinci Şamuel", "Birinci Padşahlar", "Ikinci Padşahlar",
  "Birinci Salnamələr", "Ikinci Salnamələr",
  "Ezra", "Nehemya", "Ester", "Əyyub", "Zəbur", "Süleymanin Məsəlləri",
  "Vaiz", "Nəğmələr Nəğməsi", "Yeşaya", "Yeremya", "Mərsiyələr", "Yezekel",
  "Daniel", "Huşə", "Yoel", "Amos", "Avdiya", "Yunus", "Mikeya", "Nahum",
  "Habaqquq", "Sefanya", "Haqqay", "Zəkəriyyə", "Malaki",
  "Mattanın müjdəsi", "Markın müjdəsi", "Lukanın müjdəsi", "Yəhyanın müjdəsi",
  "Həvarilərin İşləri", "Romalılara məktub",
  "Korinflilərə birinci məktub", "Korinflilərə ikinci məktub",
  "Qalatiyalılara məktub", "Efeslilərə məktub", "Filipililərə məktub",
  "Kolosselilərə məktub",
  "Saloniklilərə birinci məktub", "Saloniklilərə ikinci məktub",
  "Timoteyə birinci məktub", "Timoteyə ikinci məktub",
  "Titə məktub", "Filimona məktub", "İbranilərə məktub", "Yaqubun məktubu",
  "Peterin birinci məktubu", "Peterin ikinci məktubu",
  "Yəhyanın birinci məktubu", "Yəhyanın ikinci məktubu",
  "Yəhyanın üçüncü məktubu", "Yəhudanın məktubu", "Vəhy",
];

// Accent/case-insensitive fold so "Korinflilərə", "KORINFLILERE" etc. all match.
// Azerbaijani special letters are normalised to their ASCII base.
function fold(s) {
  return s
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ç/g, "c").replace(/ş/g, "s")
    .replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();
}

// Pre-folded canonical names, longest first so the most specific name wins
// (e.g. "Korinflilərə ikinci məktub" before any shorter partial match).
const AZ_FOLDED = AZ_BOOKS_NAMES
  .map((name, i) => ({ folded: fold(name), num: i + 1 }))
  .sort((a, b) => b.folded.length - a.folded.length);

function bookFromAzName(foldedFileName) {
  for (const { folded, num } of AZ_FOLDED) {
    if (foldedFileName.includes(folded)) return num;
  }
  return null;
}

// --- Russian fallback (kept so the current Russian-named docx files work) ---
// For books with numbered variants the leading ordinal
// (1/2/3, I/II/III or первое/второе/третье) is detected automatically.
const SINGLE = {
  "быти": 1, "исход": 2, "левит": 3, "числ": 4, "второзакон": 5,
  "навин": 6, "судей": 7, "руфь": 8, "ездр": 15, "нееми": 16,
  "есфир": 17, "иов": 18, "псалтир": 19, "псалом": 19,
  "притч": 20, "екклесиаст": 21, "песнь песней": 22,
  "исаи": 23, "иереми": 24, "плач иереми": 25, "иезекиил": 26,
  "даниил": 27, "осия": 28, "иоиль": 29, "амос": 30, "авдий": 31,
  "иона": 32, "михей": 33, "наум": 34, "аввакум": 35, "софони": 36,
  "аггей": 37, "захари": 38, "малахи": 39,
  "матфе": 40, "марк": 41, "лук": 42, "деяни": 44, "римлян": 45,
  "галат": 48, "ефес": 49, "филиппийц": 50, "колосс": 51,
  "тит": 56, "филимон": 57, "евре": 58, "иаков": 59,
  "иуды": 65, "иуда": 65, "откровени": 66,
};
// Numbered books: keyword -> { 1: num, 2: num, 3: num }
const NUMBERED = {
  "коринф": { 1: 46, 2: 47 },
  "фессалоник": { 1: 52, 2: 53 },
  "солун": { 1: 52, 2: 53 },
  "тимофе": { 1: 54, 2: 55 },
  "петр": { 1: 60, 2: 61 },
  "иоанн": { 1: 62, 2: 63, 3: 64 }, // epistles; gospel handled below
};

function detectOrdinal(name) {
  if (/(^|[^\d])3([^\d]|$)|\biii\b|трет/.test(name)) return 3;
  if (/(^|[^\d])2([^\d]|$)|\bii\b|втор/.test(name)) return 2;
  if (/(^|[^\d])1([^\d]|$)|\bi\b|перв/.test(name)) return 1;
  return 1;
}

function bookNumberFromName(fileName) {
  // 1) Try the canonical Azerbaijani names first.
  const az = bookFromAzName(fold(fileName));
  if (az) return az;

  // 2) Fall back to Russian title detection.
  const name = fileName.toLowerCase();
  // Gospel of John vs. John's epistles / Revelation
  if (/иоанн/.test(name)) {
    if (/откровени/.test(name)) return 66;
    if (/евангел|от иоанн/.test(name)) return 43;
    return NUMBERED["иоанн"][detectOrdinal(name)] ?? 43;
  }
  for (const [kw, map] of Object.entries(NUMBERED)) {
    if (name.includes(kw)) return map[detectOrdinal(name)] ?? map[1];
  }
  for (const [kw, num] of Object.entries(SINGLE)) {
    if (name.includes(kw)) return num;
  }
  return null;
}

// Convert a non-HTML book to HTML with LibreOffice (headless).
async function toHtml(srcPath, workDir) {
  const ext = path.extname(srcPath).toLowerCase();
  if (ext === ".html" || ext === ".htm") return readFile(srcPath, "utf8");
  await mkdir(workDir, { recursive: true });
  await execFileP("soffice", [
    "--headless", "--convert-to", "html", srcPath, "--outdir", workDir,
  ]);
  const base = path.basename(srcPath, ext) + ".html";
  return readFile(path.join(workDir, base), "utf8");
}

// Split one book's HTML into chapters keyed by their leading number.
// Boundary = every <h1> whose text contains a number. Everything before the
// first such <h1> is the introduction.
function splitChapters(html) {
  const $ = cheerio.load(html);

  // 1) Drop <a> wrappers but keep their text.
  if (STRIP_LINKS) $("a").each((_, a) => $(a).replaceWith($(a).contents()));

  if (STRIP_STYLING) {
    // 2) Unwrap presentational wrappers (<font>, <span>), keeping inner content.
    //    Looped so even deeply nested wrappers (</font></font>) are all removed.
    for (const tag of UNWRAP_TAGS) {
      let node;
      while ((node = $(tag).get(0))) $(node).replaceWith($(node).contents());
    }
    // 3) Delete EVERY attribute from whatever tags remain, so no inline
    //    styling survives — only the tag itself carries meaning.
    $("*").each((_, el) => {
      if (el.attribs) {
        for (const attr of Object.keys(el.attribs)) $(el).removeAttr(attr);
      }
    });
  }

  if (REMOVE_EMPTY) {
    // 4) Remove blocks left empty after cleaning (no text, no image).
    $("p, h1, h2, h3, h4, h5, h6").each((_, el) => {
      const $el = $(el);
      if (!$el.text().trim() && $el.find("img").length === 0) $el.remove();
    });
  }

  const root = $("body").length ? $("body") : $.root();
  const chapters = new Map(); // chapterNumber -> html string
  let current = null; // null = intro
  const intro = [];

  root.children().each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "h1") {
      const m = $(el).text().match(/\d+/);
      if (m) {
        current = parseInt(m[0], 10);
        if (!chapters.has(current)) chapters.set(current, []);
        chapters.get(current).push($.html(el)); // keep the heading
        return;
      }
    }
    const html = $.html(el);
    if (current === null) intro.push(html);
    else chapters.get(current).push(html);
  });

  const result = [];
  if (SAVE_INTRO && intro.join("").trim()) result.push([0, intro.join("\n")]);
  for (const [num, parts] of chapters) result.push([num, parts.join("\n")]);
  return result;
}

async function processAll() {
  const files = await readdir(SRC_DIR);
  const tmp = path.join(DEST_DIR, "._tmp");

  for (const file of files) {
    if (file.startsWith(".")) continue;
    const ext = path.extname(file).toLowerCase();
    if (![".pdf", ".docx", ".doc", ".html", ".htm"].includes(ext)) continue;

    const srcPath = path.join(SRC_DIR, file);
    const bookNumber = bookNumberFromName(file);
    if (!bookNumber) {
      console.error("❌ Unknown book (edit SINGLE/NUMBERED maps):", file);
      continue;
    }

    const html = await toHtml(srcPath, tmp);
    const chapters = splitChapters(html);

    const bookName = String(bookNumber).padStart(2, "0");
    const bookDir = path.join(DEST_DIR, bookName);
    await mkdir(bookDir, { recursive: true });

    for (const [num, content] of chapters) {
      const chapterName = String(num).padStart(2, "0");
      await writeFile(path.join(bookDir, `${chapterName}.html`), content, "utf8");
    }
    console.log(`✅ ${file} -> ${bookName}/ (${chapters.length} chapters)`);
  }

  await rm(tmp, { recursive: true, force: true });
}

processAll().catch((err) => console.error(err));
