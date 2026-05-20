export const MUKITOB_BASE_URL = "https://mukitob.com";
export const MUKITOB_BOOKS_AZ_BASE_URL = `${MUKITOB_BASE_URL}/books/az/`;
export const MUKITOB_DOWNLOAD_FILE_FORMATS = new Set(["docx", "epub", "fb2", "pdf", "rtf", "txt"]);

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "accept-language": "ru,en-US;q=0.9,en;q=0.8",
  referer: MUKITOB_BOOKS_AZ_BASE_URL,
  connection: "close",
};

const FILE_EXTENSION_PATTERN = /\.(pdf|docx|epub|fb2|rtf|txt)(?:[?#].*)?$/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toAbsoluteUrl(input, baseUrl = MUKITOB_BOOKS_AZ_BASE_URL) {
  if (!input) return "";
  return new URL(input, baseUrl).href;
}

function isDirectMukitobDownloadUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "mukitob.com" && parsed.pathname.includes("/books/download/");
  } catch {
    return false;
  }
}

async function fetchText(url, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: REQUEST_HEADERS });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }

  throw lastError;
}

export async function resolveMukitobDownloadUrl(downloadUrl, format) {
  const absoluteDownloadUrl = toAbsoluteUrl(downloadUrl);
  if (!absoluteDownloadUrl) return "";
  if (isDirectMukitobDownloadUrl(absoluteDownloadUrl)) return absoluteDownloadUrl;

  const normalizedFormat = String(format ?? "").toLowerCase();
  const html = await fetchText(absoluteDownloadUrl);
  const hrefs = [...html.matchAll(/href=(["'])(.*?)\1/gi)].map((match) => match[2]);
  const candidates = hrefs
    .filter((href) => href.includes("/books/download/"))
    .map((href) => toAbsoluteUrl(href));
  const exact = normalizedFormat
    ? candidates.find((href) => href.toLowerCase().endsWith(`.${normalizedFormat}`))
    : "";
  const fallback = candidates.find((href) => FILE_EXTENSION_PATTERN.test(href));
  const resolved = exact || fallback;

  if (!resolved) {
    throw new Error(`Could not resolve direct Mukitob file URL from ${absoluteDownloadUrl}`);
  }

  return resolved;
}
