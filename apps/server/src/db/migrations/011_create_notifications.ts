import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('notifications')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'varchar(36)', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.references('couples.id').onDelete('set null'),
    )
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('data', 'text') // JSON
    .addColumn('is_read', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_notifications_user_read')
    .on('notifications')
    .columns(['user_id', 'is_read'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('notifications').execute();
}
