import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bibles_storage_mode" AS ENUM('chapter', 'verse');
  CREATE TYPE "public"."enum_bible_verses_locale" AS ENUM('az', 'uz');
  CREATE TABLE "bible_verses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bible_id" integer NOT NULL,
  	"chapter_id" integer NOT NULL,
  	"book_number" varchar NOT NULL,
  	"chapter_number" varchar NOT NULL,
  	"locale" "enum_bible_verses_locale",
  	"verse_number" numeric NOT NULL,
  	"verse_label" varchar,
  	"verse_end" numeric,
  	"ref" varchar,
  	"plain_text" varchar,
  	"before" jsonb,
  	"segments" jsonb NOT NULL,
  	"last_edited_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "bible_chapters" ALTER COLUMN "html" DROP NOT NULL;
  ALTER TABLE "_bible_chapters_v" ALTER COLUMN "version_html" DROP NOT NULL;
  ALTER TABLE "bibles" ADD COLUMN "storage_mode" "enum_bibles_storage_mode" DEFAULT 'chapter' NOT NULL;
  ALTER TABLE "bible_chapters" ADD COLUMN "storage_mode" varchar;
  ALTER TABLE "_bible_chapters_v" ADD COLUMN "version_storage_mode" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bible_verses_id" integer;
  ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_bible_id_bibles_id_fk" FOREIGN KEY ("bible_id") REFERENCES "public"."bibles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_chapter_id_bible_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."bible_chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "bible_verses_bible_idx" ON "bible_verses" USING btree ("bible_id");
  CREATE INDEX "bible_verses_chapter_idx" ON "bible_verses" USING btree ("chapter_id");
  CREATE INDEX "bible_verses_ref_idx" ON "bible_verses" USING btree ("ref");
  CREATE INDEX "bible_verses_last_edited_by_idx" ON "bible_verses" USING btree ("last_edited_by_id");
  CREATE INDEX "bible_verses_updated_at_idx" ON "bible_verses" USING btree ("updated_at");
  CREATE INDEX "bible_verses_created_at_idx" ON "bible_verses" USING btree ("created_at");
  CREATE UNIQUE INDEX "bible_bookNumber_chapterNumber_verseNumber_idx" ON "bible_verses" USING btree ("bible_id","book_number","chapter_number","verse_number");
  CREATE INDEX "chapter_verseNumber_idx" ON "bible_verses" USING btree ("chapter_id","verse_number");
  CREATE INDEX "bible_verses_fts_idx" ON "bible_verses" USING gin (to_tsvector('simple', lower(translate("plain_text", 'ƏəÇçĞğÖöŞşÜüİıÂâ', 'EeCcGgOoSsUuIiAa'))));
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bible_verses_fk" FOREIGN KEY ("bible_verses_id") REFERENCES "public"."bible_verses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_bible_verses_id_idx" ON "payload_locked_documents_rels" USING btree ("bible_verses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bible_verses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "bible_verses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bible_verses_fk";
  
  DROP INDEX "payload_locked_documents_rels_bible_verses_id_idx";
  ALTER TABLE "bible_chapters" ALTER COLUMN "html" SET NOT NULL;
  ALTER TABLE "_bible_chapters_v" ALTER COLUMN "version_html" SET NOT NULL;
  ALTER TABLE "bibles" DROP COLUMN "storage_mode";
  ALTER TABLE "bible_chapters" DROP COLUMN "storage_mode";
  ALTER TABLE "_bible_chapters_v" DROP COLUMN "version_storage_mode";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bible_verses_id";
  DROP TYPE "public"."enum_bibles_storage_mode";
  DROP TYPE "public"."enum_bible_verses_locale";`)
}
