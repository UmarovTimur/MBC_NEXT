import { ALLOWED_INLINE_CLASSES } from "./constants";

/**
 * Whitelist sanitizer for the inline markup inside a block.
 *
 * The public reader injects this HTML with `dangerouslySetInnerHTML` and no
 * client-side sanitizer (`apps/az/src/shared/ui/BibleContent.tsx`). That was
 * tolerable while chapter HTML was a git-tracked machine import, but once editors
 * author `segments` by hand in the admin, one careless or compromised account
 * becomes stored XSS on the public site.
 *
 * Sanitizing here — in the renderer — rather than at the call site means the
 * assembled-chapter endpoint and the admin preview are both covered by one
 * implementation that cannot be forgotten.
 */

const INLINE_SET = new Set<string>(ALLOWED_INLINE_CLASSES);

/** Tags that may appear inside a block. Everything else is dropped. */
const ALLOWED_TAGS = new Set(["span", "strong", "em", "b", "i", "sup", "br"]);

const TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)>/g;
const ATTR = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function safeAttrs(tag: string, raw: string): string {
  if (!raw.trim()) return "";
  const kept: string[] = [];
  ATTR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR.exec(raw)) !== null) {
    const name = m[1]!.toLowerCase();
    const value = m[2] ?? m[3] ?? "";
    if (tag !== "span") continue;
    if (name === "class") {
      const classes = value.split(/\s+/).filter((c) => INLINE_SET.has(c));
      if (classes.length > 0) kept.push(`class="${classes.join(" ")}"`);
    } else if (name === "id" && /^V\d+$/.test(value)) {
      kept.push(`id="${value}"`);
    } else if (name === "data-v" || name === "data-v-end") {
      if (/^\d+$/.test(value)) kept.push(`${name}="${value}"`);
    }
    // Everything else — style, on*, href, srcset — is dropped.
  }
  return kept.length > 0 ? ` ${kept.join(" ")}` : "";
}

export function sanitizeBlockHtml(html: string): string {
  if (!html.includes("<")) return html;
  TAG.lastIndex = 0;
  return html.replace(TAG, (full, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (full.startsWith("</")) return `</${name}>`;
    return `<${name}${safeAttrs(name, rawAttrs ?? "")}>`;
  });
}

/** Attribute quoting inside tags only — text apostrophes are never touched. */
function canonicalQuotes(html: string): string {
  return html.replace(/<[^>]+>/g, (tag) =>
    tag.replace(/([a-zA-Z-]+)='([^']*)'/g, '$1="$2"'),
  );
}

/**
 * True when sanitizing drops nothing from the input — the check the write-time
 * validator needs.
 *
 * Deliberately not `sanitize(html) === html`: the corpus quotes attributes with
 * `'` in places (`<span class='sc'>` in 2 Kings 14) while the sanitizer always
 * emits `"`. That is a formatting difference, not content loss, and rejecting it
 * would refuse to store a verse that is perfectly legitimate.
 */
export function isSanitizedBlockHtml(html: string): boolean {
  return canonicalQuotes(sanitizeBlockHtml(html)) === canonicalQuotes(html);
}
