import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('email_verification_token', 'text')
    .execute();

  await db.schema
    .alterTable('users')
    .addColumn('email_verification_token_expires_at', 'timestamptz')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('users').dropColumn('email_verification_token_expires_at').execute();
  await db.schema.alterTable('users').dropColumn('email_verification_token').execute();
}
