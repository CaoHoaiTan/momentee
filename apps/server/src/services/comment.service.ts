import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

interface CreateCommentInput {
  postId: string;
  content: string;
  userId?: string;
  guestName?: string;
}

export async function create(input: CreateCommentInput) {
  // Verify post exists
  const post = await db
    .selectFrom('posts')
    .select('id')
    .where('id', '=', input.postId)
    .executeTakeFirst();

  if (!post) {
    throw NotFoundError('Post');
  }

  const comment = await db
    .insertInto('comments')
    .values({
      id: createId(),
      post_id: input.postId,
      user_id: input.userId ?? null,
      guest_name: input.guestName ?? null,
      content: input.content,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return comment;
}

export async function getById(id: string) {
  const comment = await db
    .selectFrom('comments')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!comment) {
    throw NotFoundError('Comment');
  }

  return comment;
}

export async function listByPostId(postId: string, limit = 50, offset = 0) {
  return db
    .selectFrom('comments')
    .selectAll()
    .where('post_id', '=', postId)
    .orderBy('created_at', 'asc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function remove(id: string, userId: string) {
  const comment = await getById(id);

  // Allow comment owner or couple owner to delete
  if (comment.user_id === userId) {
    await db.deleteFrom('comments').where('id', '=', id).execute();
    return true;
  }

  // Check if user owns the couple that owns the post
  const post = await db
    .selectFrom('posts')
    .select('couple_id')
    .where('id', '=', comment.post_id)
    .executeTakeFirst();

  if (post) {
    const couple = await db
      .selectFrom('couples')
      .select(['partner1_id', 'partner2_id'])
      .where('id', '=', post.couple_id)
      .executeTakeFirst();

    if (couple && (couple.partner1_id === userId || couple.partner2_id === userId)) {
      await db.deleteFrom('comments').where('id', '=', id).execute();
      return true;
    }
  }

  throw ForbiddenError('You are not authorized to delete this comment');
}
