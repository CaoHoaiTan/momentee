import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing')`.execute(
    db,
  );

  await db.schema
    .createTable('subscriptions')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('stripe_customer_id', 'varchar(255)')
    .addColumn('stripe_subscription_id', 'varchar(255)')
    .addColumn('plan', sql`plan_type`, (col) => col.notNull().defaultTo('free'))
    .addColumn('status', sql`subscription_status`, (col) => col.notNull().defaultTo('active'))
    .addColumn('current_period_start', 'timestamptz')
    .addColumn('current_period_end', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('subscriptions').execute();
  await sql`DROP TYPE IF EXISTS subscription_status`.execute(db);
}
