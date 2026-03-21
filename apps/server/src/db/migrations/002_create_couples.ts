import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('couples')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('display_name', 'varchar(200)', (col) => col.notNull())
    .addColumn('partner1_id', 'varchar(36)', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('partner2_id', 'varchar(36)', (col) =>
      col.references('users.id').onDelete('set null'),
    )
    .addColumn('invite_code', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('cover_photo', 'text')
    .addColumn('bio', 'text')
    .addColumn('anniversary', 'date')
    .addColumn('wedding_date', 'date')
    .addColumn('theme', 'varchar(50)', (col) => col.notNull().defaultTo('default'))
    .addColumn('custom_domain', 'varchar(255)')
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('view_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('plan', sql`plan_type`, (col) => col.notNull().defaultTo('free'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('idx_couples_slug').on('couples').column('slug').execute();

  await db.schema.createIndex('idx_couples_partner1').on('couples').column('partner1_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('couples').execute();
}
