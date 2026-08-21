import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Backs the typo-tolerant fallback match in the bible-verses search endpoint
// (BibleVerses.ts). The indexed expression must stay character-identical to
// AZ_FOLD('plain_text') in lib/search/azFold.ts, same rule as the FTS index.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX "bible_verses_trgm_idx" ON "bible_verses" USING gin (lower(translate("plain_text", 'ƏəÇçĞğÖöŞşÜüİıÂâ', 'EeCcGgOoSsUuIiAa')) gin_trgm_ops);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "bible_verses_trgm_idx";`)
}
