import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE user_role AS ENUM ('user', 'admin')`.execute(db);
  await sql`CREATE TYPE plan_type AS ENUM ('free', 'premium', 'premium_plus')`.execute(db);

  await db.schema
    .createTable('users')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password', 'varchar(255)')
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('avatar', 'text')
    .addColumn('provider', 'varchar(50)')
    .addColumn('provider_id', 'varchar(255)')
    .addColumn('email_verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('role', sql`user_role`, (col) => col.notNull().defaultTo('user'))
    .addColumn('plan', sql`plan_type`, (col) => col.notNull().defaultTo('free'))
    .addColumn('refresh_token', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_users_provider')
    .on('users')
    .columns(['provider', 'provider_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
  await sql`DROP TYPE IF EXISTS plan_type`.execute(db);
  await sql`DROP TYPE IF EXISTS user_role`.execute(db);
}
