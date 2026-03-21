import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('push_subscriptions')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'varchar(36)', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('endpoint', 'text', (col) => col.notNull())
    .addColumn('p256dh', 'text', (col) => col.notNull())
    .addColumn('auth', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_push_subscriptions_user')
    .on('push_subscriptions')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('push_subscriptions').execute();
}
