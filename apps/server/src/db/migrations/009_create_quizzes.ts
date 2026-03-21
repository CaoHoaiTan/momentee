import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('quizzes')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(36)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('quiz_questions')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('quiz_id', 'varchar(36)', (col) =>
      col.notNull().references('quizzes.id').onDelete('cascade'),
    )
    .addColumn('question', 'text', (col) => col.notNull())
    .addColumn('options', 'text', (col) => col.notNull()) // JSON array
    .addColumn('correct_answer', 'integer', (col) => col.notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createTable('quiz_responses')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('quiz_id', 'varchar(36)', (col) =>
      col.notNull().references('quizzes.id').onDelete('cascade'),
    )
    .addColumn('respondent_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('score', 'integer', (col) => col.notNull())
    .addColumn('total_questions', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('quiz_responses').execute();
  await db.schema.dropTable('quiz_questions').execute();
  await db.schema.dropTable('quizzes').execute();
}
