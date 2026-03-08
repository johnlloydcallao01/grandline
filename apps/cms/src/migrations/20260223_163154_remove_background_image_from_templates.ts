import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "certificate_templates" DROP CONSTRAINT "certificate_templates_background_image_id_media_id_fk";
  
  DROP INDEX "certificate_templates_background_image_idx";
  ALTER TABLE "certificate_templates" DROP COLUMN "background_image_id";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "certificate_templates" ADD COLUMN "background_image_id" integer NOT NULL;
  ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "certificate_templates_background_image_idx" ON "certificate_templates" USING btree ("background_image_id");`)
}
