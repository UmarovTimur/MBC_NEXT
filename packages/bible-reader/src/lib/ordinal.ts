/**
 * Ordinal number formatting.
 *
 * Kept apart from the chapter noun on purpose: the suffix is a property of the
 * number and the language, the noun ("fəsil") is a property of the corpus. The
 * two used to be fused into one `chapterSlug` string, which forced every chapter
 * to share the suffix of chapter 1.
 */

/**
 * Azerbaijani ordinals take one of four suffixes chosen by the vowel harmony of
 * the spoken number word: bir → 1-ci, üç → 3-cü, altı → 6-cı, doqquz → 9-cu.
 * The suffix is governed by the last non-zero digit group, so 150 follows "əlli"
 * (50-ci), not "bir".
 */
const AZ_UNITS: Record<number, string> = {
  1: "ci", 2: "ci", 3: "cü", 4: "cü", 5: "ci",
  6: "cı", 7: "ci", 8: "ci", 9: "cu",
};

const AZ_TENS: Record<number, string> = {
  10: "cu", 20: "ci", 30: "cu", 40: "cı", 50: "ci",
  60: "cı", 70: "ci", 80: "ci", 90: "cı",
};

/** yüz */
const AZ_HUNDRED = "cü";

function azOrdinalSuffix(n: number): string | null {
  if (!Number.isInteger(n) || n < 1) return null;
  if (n % 10 !== 0) return AZ_UNITS[n % 10];
  if (n % 100 !== 0) return AZ_TENS[n % 100];
  // Only correct for 100..900; chapter numbers top out at 150 (Psalms), so the
  // thousands ("min" → -inci) never come up here.
  return AZ_HUNDRED;
}

const SUFFIX_BY_LOCALE: Record<string, (n: number) => string | null> = {
  az: azOrdinalSuffix,
};

/** The bare suffix, or null when the locale has no rules (or n is not ordinal). */
export function ordinalSuffix(n: number, locale?: string): string | null {
  if (!locale) return null;
  return SUFFIX_BY_LOCALE[locale]?.(n) ?? null;
}

/** "12-ci" for a locale with rules, plain "12" otherwise. */
export function formatOrdinal(n: number, locale?: string): string {
  const suffix = ordinalSuffix(n, locale);
  return suffix ? `${n}-${suffix}` : String(n);
}

/**
 * Older configs stored the suffix fused to the noun ("-ci fəsil"). The suffix is
 * computed per chapter now, so drop a leading one rather than render "1-ci -ci
 * fəsil" against a config that has not been updated yet.
 */
export function stripLeadingOrdinal(slug: string): string {
  return slug.replace(/^-\p{L}+\s+/u, "");
}
