import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_content_reports_type" AS ENUM('report', 'contact');
  CREATE TYPE "public"."enum_content_reports_status" AS ENUM('new', 'reviewed', 'resolved');
  CREATE TABLE "content_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_content_reports_type" DEFAULT 'report' NOT NULL,
  	"status" "enum_content_reports_status" DEFAULT 'new' NOT NULL,
  	"page_url" varchar NOT NULL,
  	"selected_text" varchar,
  	"comment" varchar,
  	"contact" varchar,
  	"ip_hash" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_reports_id" integer;
  CREATE INDEX "content_reports_updated_at_idx" ON "content_reports" USING btree ("updated_at");
  CREATE INDEX "content_reports_created_at_idx" ON "content_reports" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_reports_fk" FOREIGN KEY ("content_reports_id") REFERENCES "public"."content_reports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_content_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("content_reports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content_reports" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "content_reports" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_content_reports_fk";

  DROP INDEX "payload_locked_documents_rels_content_reports_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "content_reports_id";
  DROP TYPE "public"."enum_content_reports_type";
  DROP TYPE "public"."enum_content_reports_status";`)
}
