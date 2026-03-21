import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('events')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('location', 'text')
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    .addColumn('end_date', 'timestamptz')
    .addColumn('cover_photo', 'text')
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('max_guests', 'integer')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`CREATE TYPE rsvp_status AS ENUM ('attending', 'maybe', 'declined')`.execute(db);

  await db.schema
    .createTable('rsvps')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('event_id', 'varchar(36)', (col) =>
      col.notNull().references('events.id').onDelete('cascade'),
    )
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)')
    .addColumn('status', sql`rsvp_status`, (col) => col.notNull().defaultTo('attending'))
    .addColumn('plus_one', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('note', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('rsvps').execute();
  await db.schema.dropTable('events').execute();
  await sql`DROP TYPE IF EXISTS rsvp_status`.execute(db);
}
