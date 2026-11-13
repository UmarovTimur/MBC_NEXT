import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Backs the visit counter in the az footer (see src/endpoints/visits.ts).
// A single row, id = 1, holding the running total. Not a Payload collection:
// it's one number with no admin-UI or access-control need. Declared in
// payload.config.ts afterSchemaInit so dev `push` does not drop it.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "visit_counter" (
      "id" INTEGER PRIMARY KEY CHECK ("id" = 1),
      "n" BIGINT NOT NULL
    );
    INSERT INTO "visit_counter" ("id", "n") VALUES (1, 0) ON CONFLICT ("id") DO NOTHING;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "visit_counter";
  `)
}
