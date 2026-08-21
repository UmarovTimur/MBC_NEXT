import { AZ_FOLD_FROM, AZ_FOLD_TO } from '@mbc/bible-verses'

/**
 * Azerbaijani case/diacritic folding, as a SQL expression.
 *
 * Postgres has no Azerbaijani text-search configuration. `turkish` exists and is
 * tempting — Azerbaijani is Turkic — but the Snowball Turkish stemmer assumes
 * Turkish orthography (there is no `ə`) and carries a Turkish stopword list, so it
 * mis-stems Azerbaijani. Returning the wrong verses is worse than returning
 * unstemmed ones, so search uses `simple` plus this fold instead.
 *
 * `unaccent` is not an option either: its rules file has no entry for `ə`, and the
 * function is STABLE rather than IMMUTABLE so it cannot appear in an index.
 * `translate` + `lower` is a pure character map and therefore immutable by nature.
 *
 * Deliberately NOT a stored SQL function: a function would be a new object that
 * must exist before the index is created, and in development Payload's schema push
 * offers no hook to create it first. Inlining removes the ordering dependency.
 *
 * The index expression and the query expression MUST be character-for-character
 * identical or the planner silently stops using the GIN index — which is why both
 * come from here, and why the character map itself lives in @mbc/bible-verses next
 * to the TypeScript `azFold` the client uses for hit highlighting.
 */
export const AZ_FOLD = (expr: string): string =>
  `lower(translate(${expr}, '${AZ_FOLD_FROM}', '${AZ_FOLD_TO}'))`

/** The indexed tsvector expression. `simple` = no stemming, no stopwords. */
export const AZ_TSV = (expr: string): string => `to_tsvector('simple', ${AZ_FOLD(expr)})`

/** Name of the GIN index, referenced by both the schema hook and the migration. */
export const VERSE_FTS_INDEX = 'bible_verses_fts_idx'

/**
 * Name of the trigram GIN index used for typo-tolerant fallback matching
 * (see BibleVerses.ts search endpoint). Built over the same `AZ_FOLD`
 * expression as the FTS index, via `pg_trgm`'s `gin_trgm_ops`.
 */
export const VERSE_TRGM_INDEX = 'bible_verses_trgm_idx'
