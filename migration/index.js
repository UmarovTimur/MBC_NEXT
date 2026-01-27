import * as cheerio from "cheerio";
import path from "path";
import { readdir } from "fs/promises";
import { readFile, writeFile, mkdir } from "fs/promises";

const FILE_RE = /^([0-9A-Z]+?)(\d+)\.htm$/i;

const SRC_DIR = "./azb_html";
const DEST_DIR = "./azb";

const BOOK_MAP = {
  GEN: 1,
  EXO: 2,
  LEV: 3,
  NUM: 4,
  DEU: 5,

  JOS: 6,
  JDG: 7,
  RUT: 8,

  "1SA": 9,
  "2SA": 10,
  "1KI": 11,
  "2KI": 12,
  "1CH": 13,
  "2CH": 14,

  EZR: 15,
  NEH: 16,
  EST: 17,

  JOB: 18,
  PSA: 19,
  PRO: 20,
  ECC: 21,
  SNG: 22,

  ISA: 23,
  JER: 24,
  LAM: 25,
  EZK: 26,
  DAN: 27,

  HOS: 28,
  JOL: 29,
  AMO: 30,
  OBA: 31,
  JON: 32,
  MIC: 33,
  NAM: 34,
  HAB: 35,
  ZEP: 36,
  HAG: 37,
  ZEC: 38,
  MAL: 39,

  MAT: 40,
  MRK: 41,
  LUK: 42,
  JHN: 43,
  ACT: 44,

  ROM: 45,
  "1CO": 46,
  "2CO": 47,
  GAL: 48,
  EPH: 49,
  PHP: 50,
  COL: 51,

  "1TH": 52,
  "2TH": 53,
  "1TI": 54,
  "2TI": 55,
  TIT: 56,
  PHM: 57,

  HEB: 58,
  JAS: 59,
  "1PE": 60,
  "2PE": 61,
  "1JN": 62,
  "2JN": 63,
  "3JN": 64,
  JUD: 65,
  REV: 66,
};

// start => "chapterlabel"
// end => second "tnav"
function transformHtml(content) {
  // 1. Ищем первый <div class="chapterlabel" id="V0">...</div> с любым текстом внутри
  // [\s\S]*? означает "любые символы, включая переносы строк, в минимальном количестве"
  const startRegex = /<div\s+class=['"]chapterlabel['"]\s+id=['"]V0['"]>[\s\S]*?<\/div>/i;
  const startMatch = content.match(startRegex);

  if (!startMatch) {
    return ""; // Если начальный блок не найден
  }

  // Индекс начала полезного контента (сразу после найденного div)
  const startIndex = startMatch.index + startMatch[0].length;

  // 2. Ищем второй <ul class="tnav">
  const endMarker = "<ul class='tnav'>";
  const firstEndIndex = content.indexOf(endMarker);

  if (firstEndIndex === -1) {
    // Если вообще нет ни одного <ul>, возвращаем всё, что после <div>
    return content.substring(startIndex);
  }

  // Ищем второе вхождение, начиная поиск СРАЗУ ПОСЛЕ первого
  const secondEndIndex = content.indexOf(endMarker, firstEndIndex + endMarker.length);

  if (secondEndIndex === -1) {
    // Если второго вхождения нет, возвращаем всё от div до первого ul
    return content.substring(startIndex, firstEndIndex);
  }

  const middlePart = content.substring(startIndex, secondEndIndex);

  // 3. Удаляем все ссылки <a>...</a> вместе с их содержимым
  // <a\b      - начало тега <a> (граница слова, чтобы не задеть другие теги)
  // [^>]*     - любые атрибуты внутри тега
  // >         - закрытие открывающего тега
  // [\s\S]*?  - любой текст и вложенные теги внутри (нежадный поиск)
  // <\/a>     - закрывающий тег
  const linkRegex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;

  const result = middlePart.replace(linkRegex, "");

  return result;
}

async function processBook() {
  const files = await readdir(SRC_DIR);

  for (const file of files) {
    const match = file.match(FILE_RE);
    if (!match) continue;

    const [fullName, bookCode, chapterRaw] = match;

    const bookNumber = BOOK_MAP[bookCode];
    if (!bookNumber) {
      console.error("Unknows key", bookCode);
      break;
    }
    if (chapterRaw === "00" || chapterRaw === "") {
      // console.log("Skipped: ",fullName);
      continue;
    }

    const srcPath = path.join(SRC_DIR, file);
    const bookName = String(bookNumber).padStart(2, "0");
    const bookDir = path.join(DEST_DIR, bookName);
    const destPath = path.join(bookDir, `${chapterRaw}.html`);

    const html = await readFile(srcPath, "utf8");
    console.log(fullName);
    const transformed = transformHtml(html);

    await mkdir(bookDir, { recursive: true });
    await writeFile(destPath, transformed, "utf8");
  }
}

processBook().catch((err) => console.error(err));
