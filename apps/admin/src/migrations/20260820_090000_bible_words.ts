import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Backs the Symphony (concordance) feature on the az site: one row per distinct
// word form per bible, used to list every word starting with a given letter.
// Populated/refreshed by `pnpm --filter admin rebuild:words`, not by a hook —
// the corpus only changes on manual import/edit, same operational model as
// `verify:verses`. Deliberately not a Payload collection: it's derived,
// read-only, non-editorial data with no admin-UI or access-control need.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "bible_words" (
      "id" SERIAL PRIMARY KEY,
      "bible_id" INTEGER NOT NULL REFERENCES "bibles"("id") ON DELETE CASCADE,
      "word" VARCHAR NOT NULL,
      "first_letter" VARCHAR NOT NULL,
      "occurrence_count" INTEGER NOT NULL,
      UNIQUE ("bible_id", "word")
    );
    CREATE INDEX "bible_words_letter_idx" ON "bible_words" ("bible_id", "first_letter");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "bible_words";
  `)
}
