import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // media.post_id — used when fetching post media
  await db.schema
    .createIndex('idx_media_post_id')
    .on('media')
    .column('post_id')
    .execute();

  // album_photos.album_id — used when listing photos per album
  await db.schema
    .createIndex('idx_album_photos_album_id')
    .on('album_photos')
    .column('album_id')
    .execute();

  // reactions.post_id — used when fetching reactions by post
  await db.schema
    .createIndex('idx_reactions_post_id')
    .on('reactions')
    .column('post_id')
    .execute();

  // comments.post_id — used when fetching comments by post
  await db.schema
    .createIndex('idx_comments_post_id')
    .on('comments')
    .column('post_id')
    .execute();

  // quiz_questions.quiz_id — used when fetching quiz questions
  await db.schema
    .createIndex('idx_quiz_questions_quiz_id')
    .on('quiz_questions')
    .column('quiz_id')
    .execute();

  // quiz_responses.quiz_id — used for leaderboard
  await db.schema
    .createIndex('idx_quiz_responses_quiz_id')
    .on('quiz_responses')
    .column('quiz_id')
    .execute();

  // notifications.user_id + created_at — used for user notification list
  await db.schema
    .createIndex('idx_notifications_user_created')
    .on('notifications')
    .columns(['user_id', 'created_at'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_notifications_user_created').execute();
  await db.schema.dropIndex('idx_quiz_responses_quiz_id').execute();
  await db.schema.dropIndex('idx_quiz_questions_quiz_id').execute();
  await db.schema.dropIndex('idx_comments_post_id').execute();
  await db.schema.dropIndex('idx_reactions_post_id').execute();
  await db.schema.dropIndex('idx_album_photos_album_id').execute();
  await db.schema.dropIndex('idx_media_post_id').execute();
}
