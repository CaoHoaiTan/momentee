import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('albums')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('cover_photo', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('album_photos')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('album_id', 'varchar(36)', (col) =>
      col.notNull().references('albums.id').onDelete('cascade'),
    )
    .addColumn('media_url', 'text', (col) => col.notNull())
    .addColumn('caption', 'text')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('album_photos').execute();
  await db.schema.dropTable('albums').execute();
}
