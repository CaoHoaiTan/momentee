import { createId } from '@paralleldrive/cuid2';
import { sql } from 'kysely';
import { db } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

interface CreateReactionInput {
  postId: string;
  emoji: string;
  userId?: string;
  guestName?: string;
}

export async function toggle(input: CreateReactionInput) {
  // Verify post exists
  const post = await db
    .selectFrom('posts')
    .select('id')
    .where('id', '=', input.postId)
    .executeTakeFirst();

  if (!post) {
    throw NotFoundError('Post');
  }

  // Check if user already reacted with this emoji
  if (input.userId) {
    const existing = await db
      .selectFrom('reactions')
      .select('id')
      .where('post_id', '=', input.postId)
      .where('user_id', '=', input.userId)
      .where('emoji', '=', input.emoji)
      .executeTakeFirst();

    if (existing) {
      // Remove reaction (toggle off)
      await db.deleteFrom('reactions').where('id', '=', existing.id).execute();
      return null;
    }
  }

  // Add reaction
  const reaction = await db
    .insertInto('reactions')
    .values({
      id: createId(),
      post_id: input.postId,
      user_id: input.userId ?? null,
      guest_name: input.guestName ?? null,
      emoji: input.emoji,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return reaction;
}

export async function listByPostId(postId: string) {
  return db
    .selectFrom('reactions')
    .selectAll()
    .where('post_id', '=', postId)
    .orderBy('created_at', 'asc')
    .execute();
}

export async function getGroupsByPostId(postId: string, currentUserId?: string) {
  const groups = await db
    .selectFrom('reactions')
    .where('post_id', '=', postId)
    .groupBy('emoji')
    .select(['emoji', sql<number>`count(*)`.as('count')])
    .execute();

  let userReactions: string[] = [];
  if (currentUserId) {
    const rows = await db
      .selectFrom('reactions')
      .where('post_id', '=', postId)
      .where('user_id', '=', currentUserId)
      .select('emoji')
      .execute();
    userReactions = rows.map((r) => r.emoji);
  }

  return groups.map((g) => ({
    emoji: g.emoji,
    count: Number(g.count),
    hasReacted: userReactions.includes(g.emoji),
  }));
}
