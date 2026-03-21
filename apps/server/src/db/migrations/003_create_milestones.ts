import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('milestones')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('icon', 'varchar(50)')
    .addColumn('photo', 'text')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_milestones_couple')
    .on('milestones')
    .column('couple_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('milestones').execute();
}
