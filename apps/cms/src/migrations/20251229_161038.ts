import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "is_featured" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_is_featured" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "is_featured";
  ALTER TABLE "_posts_v" DROP COLUMN "version_is_featured";`)
}
