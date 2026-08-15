import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_books_locale" AS ENUM('az', 'uz', 'ru');
  CREATE TYPE "public"."enum_books_source" AS ENUM('mukitob', 'manual');
  CREATE TYPE "public"."enum_books_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_bibles_locale" AS ENUM('az', 'uz');
  CREATE TYPE "public"."enum_bibles_default_view" AS ENUM('single-column', 'split-screen');
  CREATE TYPE "public"."enum_bible_books_locale" AS ENUM('az', 'uz');
  CREATE TYPE "public"."enum_bible_chapters_locale" AS ENUM('az', 'uz');
  CREATE TYPE "public"."enum__bible_chapters_v_version_locale" AS ENUM('az', 'uz');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "books_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"format" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"file_size" varchar,
  	"description" varchar,
  	"url" varchar NOT NULL,
  	"sort_order" numeric
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"locale" "enum_books_locale" DEFAULT 'az' NOT NULL,
  	"author" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"cover_image_id" integer,
  	"cover_image_url" varchar,
  	"source" "enum_books_source" DEFAULT 'manual',
  	"source_book_key" varchar,
  	"source_id" numeric,
  	"detail_url" varchar,
  	"read_url" varchar,
  	"preview_pages" numeric,
  	"status" "enum_books_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "bibles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bible_key" varchar NOT NULL,
  	"locale" "enum_bibles_locale" NOT NULL,
  	"primary" varchar NOT NULL,
  	"display_name" varchar,
  	"attachment_id" integer,
  	"default_view" "enum_bibles_default_view" DEFAULT 'single-column' NOT NULL,
  	"formatting_style" varchar,
  	"chapter_slug" varchar,
  	"introduction_name" varchar,
  	"is_independent" boolean DEFAULT false,
  	"is_commentary" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bibles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "bible_books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"locale" "enum_bible_books_locale" NOT NULL,
  	"book_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"short_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bible_chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bible_id" integer NOT NULL,
  	"book_id" integer NOT NULL,
  	"book_number" varchar NOT NULL,
  	"chapter_id" varchar NOT NULL,
  	"locale" "enum_bible_chapters_locale",
  	"title" varchar,
  	"html" varchar NOT NULL,
  	"last_edited_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_bible_chapters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_bible_id" integer NOT NULL,
  	"version_book_id" integer NOT NULL,
  	"version_book_number" varchar NOT NULL,
  	"version_chapter_id" varchar NOT NULL,
  	"version_locale" "enum__bible_chapters_v_version_locale",
  	"version_title" varchar,
  	"version_html" varchar NOT NULL,
  	"version_last_edited_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"books_id" integer,
  	"media_id" integer,
  	"bibles_id" integer,
  	"bible_books_id" integer,
  	"bible_chapters_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_downloads" ADD CONSTRAINT "books_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bibles" ADD CONSTRAINT "bibles_attachment_id_bibles_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."bibles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bibles_texts" ADD CONSTRAINT "bibles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bibles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bible_chapters" ADD CONSTRAINT "bible_chapters_bible_id_bibles_id_fk" FOREIGN KEY ("bible_id") REFERENCES "public"."bibles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bible_chapters" ADD CONSTRAINT "bible_chapters_book_id_bible_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."bible_books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bible_chapters" ADD CONSTRAINT "bible_chapters_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bible_chapters_v" ADD CONSTRAINT "_bible_chapters_v_parent_id_bible_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bible_chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bible_chapters_v" ADD CONSTRAINT "_bible_chapters_v_version_bible_id_bibles_id_fk" FOREIGN KEY ("version_bible_id") REFERENCES "public"."bibles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bible_chapters_v" ADD CONSTRAINT "_bible_chapters_v_version_book_id_bible_books_id_fk" FOREIGN KEY ("version_book_id") REFERENCES "public"."bible_books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bible_chapters_v" ADD CONSTRAINT "_bible_chapters_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bibles_fk" FOREIGN KEY ("bibles_id") REFERENCES "public"."bibles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bible_books_fk" FOREIGN KEY ("bible_books_id") REFERENCES "public"."bible_books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bible_chapters_fk" FOREIGN KEY ("bible_chapters_id") REFERENCES "public"."bible_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "books_downloads_order_idx" ON "books_downloads" USING btree ("_order");
  CREATE INDEX "books_downloads_parent_id_idx" ON "books_downloads" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "books_slug_idx" ON "books" USING btree ("slug");
  CREATE INDEX "books_cover_image_idx" ON "books" USING btree ("cover_image_id");
  CREATE UNIQUE INDEX "books_source_book_key_idx" ON "books" USING btree ("source_book_key");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "bibles_bible_key_idx" ON "bibles" USING btree ("bible_key");
  CREATE INDEX "bibles_locale_idx" ON "bibles" USING btree ("locale");
  CREATE INDEX "bibles_attachment_idx" ON "bibles" USING btree ("attachment_id");
  CREATE INDEX "bibles_updated_at_idx" ON "bibles" USING btree ("updated_at");
  CREATE INDEX "bibles_created_at_idx" ON "bibles" USING btree ("created_at");
  CREATE INDEX "bibles_texts_order_parent" ON "bibles_texts" USING btree ("order","parent_id");
  CREATE INDEX "bible_books_locale_idx" ON "bible_books" USING btree ("locale");
  CREATE INDEX "bible_books_updated_at_idx" ON "bible_books" USING btree ("updated_at");
  CREATE INDEX "bible_books_created_at_idx" ON "bible_books" USING btree ("created_at");
  CREATE UNIQUE INDEX "locale_bookId_idx" ON "bible_books" USING btree ("locale","book_id");
  CREATE INDEX "bible_chapters_bible_idx" ON "bible_chapters" USING btree ("bible_id");
  CREATE INDEX "bible_chapters_book_idx" ON "bible_chapters" USING btree ("book_id");
  CREATE INDEX "bible_chapters_last_edited_by_idx" ON "bible_chapters" USING btree ("last_edited_by_id");
  CREATE INDEX "bible_chapters_updated_at_idx" ON "bible_chapters" USING btree ("updated_at");
  CREATE INDEX "bible_chapters_created_at_idx" ON "bible_chapters" USING btree ("created_at");
  CREATE UNIQUE INDEX "bible_bookNumber_chapterId_idx" ON "bible_chapters" USING btree ("bible_id","book_number","chapter_id");
  CREATE INDEX "_bible_chapters_v_parent_idx" ON "_bible_chapters_v" USING btree ("parent_id");
  CREATE INDEX "_bible_chapters_v_version_version_bible_idx" ON "_bible_chapters_v" USING btree ("version_bible_id");
  CREATE INDEX "_bible_chapters_v_version_version_book_idx" ON "_bible_chapters_v" USING btree ("version_book_id");
  CREATE INDEX "_bible_chapters_v_version_version_last_edited_by_idx" ON "_bible_chapters_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_bible_chapters_v_version_version_updated_at_idx" ON "_bible_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX "_bible_chapters_v_version_version_created_at_idx" ON "_bible_chapters_v" USING btree ("version_created_at");
  CREATE INDEX "_bible_chapters_v_created_at_idx" ON "_bible_chapters_v" USING btree ("created_at");
  CREATE INDEX "_bible_chapters_v_updated_at_idx" ON "_bible_chapters_v" USING btree ("updated_at");
  CREATE INDEX "version_bible_version_bookNumber_version_chapterId_idx" ON "_bible_chapters_v" USING btree ("version_bible_id","version_book_number","version_chapter_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_bibles_id_idx" ON "payload_locked_documents_rels" USING btree ("bibles_id");
  CREATE INDEX "payload_locked_documents_rels_bible_books_id_idx" ON "payload_locked_documents_rels" USING btree ("bible_books_id");
  CREATE INDEX "payload_locked_documents_rels_bible_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("bible_chapters_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "books_downloads" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "bibles" CASCADE;
  DROP TABLE "bibles_texts" CASCADE;
  DROP TABLE "bible_books" CASCADE;
  DROP TABLE "bible_chapters" CASCADE;
  DROP TABLE "_bible_chapters_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_books_locale";
  DROP TYPE "public"."enum_books_source";
  DROP TYPE "public"."enum_books_status";
  DROP TYPE "public"."enum_bibles_locale";
  DROP TYPE "public"."enum_bibles_default_view";
  DROP TYPE "public"."enum_bible_books_locale";
  DROP TYPE "public"."enum_bible_chapters_locale";
  DROP TYPE "public"."enum__bible_chapters_v_version_locale";`)
}
