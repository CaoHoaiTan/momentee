import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add password reset fields to users
  await db.schema
    .alterTable('users')
    .addColumn('reset_token', 'text')
    .execute();

  await db.schema
    .alterTable('users')
    .addColumn('reset_token_expires_at', 'timestamptz')
    .execute();

  // Add missing updated_at columns
  await db.schema
    .alterTable('milestones')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('wishes')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('quiz_responses')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('gift_accounts')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .alterTable('rsvps')
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('rsvps').dropColumn('updated_at').execute();
  await db.schema.alterTable('gift_accounts').dropColumn('updated_at').execute();
  await db.schema.alterTable('quiz_responses').dropColumn('updated_at').execute();
  await db.schema.alterTable('wishes').dropColumn('updated_at').execute();
  await db.schema.alterTable('milestones').dropColumn('updated_at').execute();
  await db.schema.alterTable('users').dropColumn('reset_token_expires_at').execute();
  await db.schema.alterTable('users').dropColumn('reset_token').execute();
}
