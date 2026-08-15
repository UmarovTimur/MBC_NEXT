/**
 * Whitespace normalization used to compare a re-rendered chapter against its
 * original HTML.
 *
 * The corpus is inconsistently pretty-printed — 70 of the 31 072 verse-marker tags
 * have their attributes split across newlines, inter-tag whitespace varies between
 * files, and attributes are quoted with `'` in some places and `"` in others
 * (`<div class='p'>` vs `<span class="verse">`, and one `<span class='sc'>`).
 * None of that is significant, so the round-trip check normalizes it away.
 *
 * Quote canonicalization is applied only INSIDE tag brackets, so apostrophes in
 * the scripture text itself are never touched. Everything inside a text node is
 * preserved verbatim by the parser; only runs of whitespace are collapsed here.
 */
export function normalizeHtmlForCompare(html: string): string {
  return html
    .replace(/<[^>]+>/g, (tag) => tag.replace(/([a-zA-Z-]+)='([^']*)'/g, '$1="$2"'))
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

/**
 * Case- and diacritic-folding for Azerbaijani.
 *
 * Postgres has no Azerbaijani text-search configuration (it ships `turkish`, but
 * the Snowball Turkish stemmer assumes Turkish orthography — no `ə` — and carries
 * a Turkish stopword list, so it mis-stems Azerbaijani). `unaccent` is no help
 * either: its rules file has no entry for `ə`, and the function is STABLE rather
 * than IMMUTABLE so it cannot be indexed.
 *
 * So search folds with a plain 1:1 character map instead. Keep this in exact sync
 * with `AZ_FOLD` in `apps/admin/src/lib/search/azFold.ts` — the SQL index
 * expression and this function must agree, or client-side hit highlighting drifts
 * away from what the server matched.
 *
 * Being strictly 1:1 is what makes highlighting safe: character offsets in the
 * folded string map exactly onto the original, so the UI can locate a match in the
 * folded text and slice the ORIGINAL string to display it.
 */
export const AZ_FOLD_FROM = "ƏəÇçĞğÖöŞşÜüİıÂâ";
export const AZ_FOLD_TO = "EeCcGgOoSsUuIiAa";

const FOLD_MAP = new Map<string, string>();
for (let i = 0; i < AZ_FOLD_FROM.length; i += 1) {
  FOLD_MAP.set(AZ_FOLD_FROM[i]!, AZ_FOLD_TO[i]!);
}

export function azFold(input: string): string {
  let out = "";
  for (const ch of input) {
    out += FOLD_MAP.get(ch) ?? ch;
  }
  return out.toLowerCase();
}
