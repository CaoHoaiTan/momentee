import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('wishes')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('author_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('author_avatar', 'text')
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('emoji', 'varchar(10)')
    .addColumn('is_anonymous', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('is_approved', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('idx_wishes_couple').on('wishes').column('couple_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('wishes').execute();
}
