import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE post_type AS ENUM ('photo', 'video', 'story', 'letter', 'milestone')`.execute(
    db,
  );
  await sql`CREATE TYPE visibility AS ENUM ('public', 'friends_only', 'private')`.execute(db);
  await sql`CREATE TYPE media_type AS ENUM ('image', 'video', 'gif')`.execute(db);

  await db.schema
    .createTable('posts')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('caption', 'text')
    .addColumn('type', sql`post_type`, (col) => col.notNull().defaultTo('photo'))
    .addColumn('visibility', sql`visibility`, (col) => col.notNull().defaultTo('public'))
    .addColumn('is_pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_posts_couple_created')
    .on('posts')
    .columns(['couple_id', 'created_at'])
    .execute();

  await db.schema
    .createTable('media')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('post_id', 'varchar(36)', (col) =>
      col.notNull().references('posts.id').onDelete('cascade'),
    )
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('thumbnail', 'text')
    .addColumn('blur_hash', 'varchar(100)')
    .addColumn('type', sql`media_type`, (col) => col.notNull().defaultTo('image'))
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('media').execute();
  await db.schema.dropTable('posts').execute();
  await sql`DROP TYPE IF EXISTS media_type`.execute(db);
  await sql`DROP TYPE IF EXISTS visibility`.execute(db);
  await sql`DROP TYPE IF EXISTS post_type`.execute(db);
}
