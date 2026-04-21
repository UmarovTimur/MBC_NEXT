import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import * as cheerio from "cheerio";

const BASE_URL = "https://mukitob.com";
const LIST_PATH = "/books/az/all_books.php";
const OUTPUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "output",
  "mukitob-az",
);

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "accept-language": "ru,en-US;q=0.9,en;q=0.8",
};

function toAbsoluteUrl(input, baseUrl = BASE_URL) {
  if (!input) return "";
  return new URL(input, baseUrl).href;
}

function normalizeText(input) {
  return (input ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAuthorHtml(input) {
  return normalizeText((input ?? "").replace(/<br\s*\/?>/gi, " | ").replace(/<[^>]+>/g, " "));
}

function csvEscape(value) {
  const normalized = value == null ? "" : String(value);
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function toCsv(rows, headers) {
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }

  return `${lines.join("\n")}\n`;
}

async function writeUtf8Csv(filePath, content) {
  const bomPrefixed = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(content, "utf8")]);
  await writeFile(filePath, bomPrefixed);
}

function normalizeDescription(primaryDescription, fallbackDescription, title) {
  const primary = normalizeText(primaryDescription);
  if (primary && !primary.includes("Kitabxana - Azərbaycan dilində kitablar") && primary !== title) {
    return primary;
  }

  const fallback = normalizeText(fallbackDescription);
  if (!fallback) return "";
  if (fallback.includes("Kitabxana - Azərbaycan dilində kitablar")) return "";
  if (fallback === title) return "";

  return fallback;
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseListPage(html, pageUrl) {
  const $ = cheerio.load(html);
  const books = [];

  $(".onebook").each((_, element) => {
    const bookCard = $(element);
    const link = bookCard.find('a[href*="book.php?id_book="]').last();
    const href = link.attr("href") ?? "";
    const idMatch = href.match(/id_book=(\d+)/);

    if (!idMatch) return;

    const image = bookCard.find("img").first();
    books.push({
      externalId: Number(idMatch[1]),
      detailUrl: toAbsoluteUrl(href, pageUrl),
      listTitle: normalizeText(image.attr("alt") || link.text()),
      listAuthor: normalizeText(bookCard.find("em small").text()),
      listImageUrl: toAbsoluteUrl(image.attr("src") || "", pageUrl),
      hasAudio: bookCard.html().includes("icon_audio.gif"),
    });
  });

  const nextPageHref = $('.right a[href*="all_books.php?page="]').attr("href") || null;

  return {
    books,
    nextPageUrl: nextPageHref ? toAbsoluteUrl(nextPageHref, pageUrl) : null,
  };
}

function parseDownloads($, pageUrl) {
  return $("#cssmenu li ul li a")
    .map((index, element) => {
      const link = $(element);
      const text = normalizeText(link.text());
      const match = text.match(/^([a-z0-9]+)\s*\(([^)]+)\)$/i);

      return {
        fileOrder: index + 1,
        format: normalizeText(match?.[1] || text.split(" ")[0]).toLowerCase(),
        sizeLabel: normalizeText(match?.[2] || ""),
        label: text,
        title: normalizeText(link.attr("title") || ""),
        downloadUrl: toAbsoluteUrl(link.attr("href") || "", pageUrl),
      };
    })
    .get();
}

function parseBookPage(listEntry, html) {
  const $ = cheerio.load(html);
  const detailTitle = normalizeText($(".book-info__title").first().text());
  const author = normalizeAuthorHtml($(".book-info__author").first().html() || "");
  const subtitle = normalizeText($(".book-info__about").first().text());
  const description = normalizeDescription(
    $(".book-info__annotation").first().text(),
    $('meta[name="description"]').attr("content"),
    detailTitle || listEntry.listTitle,
  );
  const imageUrl = toAbsoluteUrl($(".book-info__img").first().attr("src") || listEntry.listImageUrl, listEntry.detailUrl);
  const readUrl = toAbsoluteUrl($('a[href^="read.php"]').first().attr("href") || "", listEntry.detailUrl);
  const previewText = normalizeText($(".book-info__preview").first().text());
  const previewMatch = previewText.match(/(\d+)/);
  const downloads = parseDownloads($, listEntry.detailUrl);

  return {
    source: "mukitob",
    locale: "az",
    externalId: listEntry.externalId,
    sourceBookKey: `mukitob:az:${listEntry.externalId}`,
    title: detailTitle || listEntry.listTitle,
    subtitle,
    author: author || listEntry.listAuthor,
    description,
    detailUrl: listEntry.detailUrl,
    readUrl,
    imageUrl,
    previewPages: previewMatch ? Number(previewMatch[1]) : "",
    hasAudio: listEntry.hasAudio || downloads.some((download) => download.format === "mp3"),
    downloadCount: downloads.length,
    downloadFormats: downloads.map((download) => download.format).join(", "),
    downloadLinksJson: JSON.stringify(
      downloads.map(({ format, sizeLabel, downloadUrl, label }) => ({
        format,
        sizeLabel,
        label,
        downloadUrl,
      })),
    ),
    downloads,
  };
}

async function collectListEntries() {
  const collected = [];
  const seen = new Set();
  let pageUrl = toAbsoluteUrl(LIST_PATH);
  let pageNumber = 1;

  while (pageUrl) {
    console.log(`Fetching list page ${pageNumber}: ${pageUrl}`);
    const html = await fetchHtml(pageUrl);
    const parsed = parseListPage(html, pageUrl);

    for (const book of parsed.books) {
      if (seen.has(book.externalId)) continue;
      seen.add(book.externalId);
      collected.push(book);
    }

    pageUrl = parsed.nextPageUrl;
    pageNumber += 1;
  }

  return collected.sort((left, right) => left.externalId - right.externalId);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const listEntries = await collectListEntries();
  const books = [];

  for (const [index, entry] of listEntries.entries()) {
    console.log(`Fetching book ${index + 1}/${listEntries.length}: ${entry.detailUrl}`);
    const html = await fetchHtml(entry.detailUrl);
    books.push(parseBookPage(entry, html));
  }

  const fileRows = books.flatMap((book) =>
    book.downloads.map((download) => ({
      source: book.source,
      locale: book.locale,
      sourceBookKey: book.sourceBookKey,
      externalId: book.externalId,
      title: book.title,
      format: download.format,
      sizeLabel: download.sizeLabel,
      label: download.label,
      description: download.title,
      downloadUrl: download.downloadUrl,
      fileOrder: download.fileOrder,
    })),
  );

  const bookRows = books.map((book) => ({
    source: book.source,
    locale: book.locale,
    sourceBookKey: book.sourceBookKey,
    externalId: book.externalId,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    description: book.description,
    detailUrl: book.detailUrl,
    readUrl: book.readUrl,
    imageUrl: book.imageUrl,
    previewPages: book.previewPages,
    hasAudio: book.hasAudio,
    downloadCount: book.downloadCount,
    downloadFormats: book.downloadFormats,
    downloadLinksJson: book.downloadLinksJson,
  }));

  const summary = {
    source: "mukitob",
    locale: "az",
    scrapedAt: new Date().toISOString(),
    booksCount: bookRows.length,
    filesCount: fileRows.length,
    formats: [...new Set(fileRows.map((file) => file.format))].sort(),
  };

  await writeFile(
    path.join(OUTPUT_DIR, "books.json"),
    `${JSON.stringify({ summary, books }, null, 2)}\n`,
    "utf8",
  );
  await writeUtf8Csv(
    path.join(OUTPUT_DIR, "books.csv"),
    toCsv(bookRows, [
      "source",
      "locale",
      "sourceBookKey",
      "externalId",
      "title",
      "subtitle",
      "author",
      "description",
      "detailUrl",
      "readUrl",
      "imageUrl",
      "previewPages",
      "hasAudio",
      "downloadCount",
      "downloadFormats",
      "downloadLinksJson",
    ]),
    "utf8",
  );
  await writeUtf8Csv(
    path.join(OUTPUT_DIR, "book-files.csv"),
    toCsv(fileRows, [
      "source",
      "locale",
      "sourceBookKey",
      "externalId",
      "title",
      "format",
      "sizeLabel",
      "label",
      "description",
      "downloadUrl",
      "fileOrder",
    ]),
    "utf8",
  );
  await writeFile(path.join(OUTPUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Saved ${bookRows.length} books and ${fileRows.length} files to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
