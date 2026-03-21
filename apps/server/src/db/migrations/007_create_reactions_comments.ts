import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('reactions')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('post_id', 'varchar(36)', (col) =>
      col.notNull().references('posts.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'varchar(36)', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('guest_name', 'varchar(100)')
    .addColumn('emoji', 'varchar(10)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('idx_reactions_user').on('reactions').column('user_id').execute();

  await db.schema
    .createTable('comments')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('post_id', 'varchar(36)', (col) =>
      col.notNull().references('posts.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'varchar(36)', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('guest_name', 'varchar(100)')
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('idx_comments_post').on('comments').column('post_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('comments').execute();
  await db.schema.dropTable('reactions').execute();
}
