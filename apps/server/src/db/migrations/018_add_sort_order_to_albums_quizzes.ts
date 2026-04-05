import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('albums')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable('quizzes')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  // Initialize sort_order based on created_at for existing rows
  await sql`
    UPDATE albums SET sort_order = sub.rn FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY couple_id ORDER BY created_at) - 1 AS rn FROM albums
    ) sub WHERE albums.id = sub.id
  `.execute(db);

  await sql`
    UPDATE quizzes SET sort_order = sub.rn FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY couple_id ORDER BY created_at) - 1 AS rn FROM quizzes
    ) sub WHERE quizzes.id = sub.id
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('quizzes').dropColumn('sort_order').execute();
  await db.schema.alterTable('albums').dropColumn('sort_order').execute();
}
