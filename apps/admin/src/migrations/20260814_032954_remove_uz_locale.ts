import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "books" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "books" ALTER COLUMN "locale" SET DEFAULT 'az'::text;
  DROP TYPE "public"."enum_books_locale";
  CREATE TYPE "public"."enum_books_locale" AS ENUM('az', 'ru');
  ALTER TABLE "books" ALTER COLUMN "locale" SET DEFAULT 'az'::"public"."enum_books_locale";
  ALTER TABLE "books" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_books_locale" USING "locale"::"public"."enum_books_locale";
  ALTER TABLE "bibles" ALTER COLUMN "locale" SET DATA TYPE text;
  DROP TYPE "public"."enum_bibles_locale";
  CREATE TYPE "public"."enum_bibles_locale" AS ENUM('az');
  ALTER TABLE "bibles" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_bibles_locale" USING "locale"::"public"."enum_bibles_locale";
  ALTER TABLE "bible_books" ALTER COLUMN "locale" SET DATA TYPE text;
  DROP TYPE "public"."enum_bible_books_locale";
  CREATE TYPE "public"."enum_bible_books_locale" AS ENUM('az');
  ALTER TABLE "bible_books" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_bible_books_locale" USING "locale"::"public"."enum_bible_books_locale";
  ALTER TABLE "bible_chapters" ALTER COLUMN "locale" SET DATA TYPE text;
  DROP TYPE "public"."enum_bible_chapters_locale";
  CREATE TYPE "public"."enum_bible_chapters_locale" AS ENUM('az');
  ALTER TABLE "bible_chapters" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_bible_chapters_locale" USING "locale"::"public"."enum_bible_chapters_locale";
  ALTER TABLE "_bible_chapters_v" ALTER COLUMN "version_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__bible_chapters_v_version_locale";
  CREATE TYPE "public"."enum__bible_chapters_v_version_locale" AS ENUM('az');
  ALTER TABLE "_bible_chapters_v" ALTER COLUMN "version_locale" SET DATA TYPE "public"."enum__bible_chapters_v_version_locale" USING "version_locale"::"public"."enum__bible_chapters_v_version_locale";
  ALTER TABLE "bible_verses" ALTER COLUMN "locale" SET DATA TYPE text;
  DROP TYPE "public"."enum_bible_verses_locale";
  CREATE TYPE "public"."enum_bible_verses_locale" AS ENUM('az');
  ALTER TABLE "bible_verses" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_bible_verses_locale" USING "locale"::"public"."enum_bible_verses_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_books_locale" ADD VALUE 'uz' BEFORE 'ru';
  ALTER TYPE "public"."enum_bibles_locale" ADD VALUE 'uz';
  ALTER TYPE "public"."enum_bible_books_locale" ADD VALUE 'uz';
  ALTER TYPE "public"."enum_bible_chapters_locale" ADD VALUE 'uz';
  ALTER TYPE "public"."enum__bible_chapters_v_version_locale" ADD VALUE 'uz';
  ALTER TYPE "public"."enum_bible_verses_locale" ADD VALUE 'uz';`)
}
