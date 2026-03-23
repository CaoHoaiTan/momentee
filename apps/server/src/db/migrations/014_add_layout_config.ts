import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('couples')
    .addColumn('layout_config', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('couples')
    .dropColumn('layout_config')
    .execute();
}
