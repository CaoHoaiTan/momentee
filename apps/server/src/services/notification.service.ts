import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';

interface CreateNotificationInput {
  userId: string;
  coupleId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function create(input: CreateNotificationInput) {
  return db
    .insertInto('notifications')
    .values({
      id: createId(),
      user_id: input.userId,
      couple_id: input.coupleId ?? null,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
      is_read: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function listByUserId(
  userId: string,
  opts: { unreadOnly?: boolean; limit?: number; offset?: number } = {},
) {
  let query = db
    .selectFrom('notifications')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);

  if (opts.unreadOnly) {
    query = query.where('is_read', '=', false);
  }

  return query.execute();
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db
    .selectFrom('notifications')
    .where('user_id', '=', userId)
    .where('is_read', '=', false)
    .select(db.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow();

  return Number(result.count);
}

export async function markAllRead(userId: string) {
  await db
    .updateTable('notifications')
    .set({ is_read: true })
    .where('user_id', '=', userId)
    .where('is_read', '=', false)
    .execute();

  return true;
}

export async function markRead(id: string, userId: string) {
  await db
    .updateTable('notifications')
    .set({ is_read: true })
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .execute();

  return true;
}

export async function remove(id: string, userId: string) {
  await db
    .deleteFrom('notifications')
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .execute();

  return true;
}

// ─── Notification triggers ─────────────────────────────────────────

export async function notifyNewWish(coupleId: string, wishAuthor: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id', 'display_name'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) return;

  const userIds = [couple.partner1_id, couple.partner2_id].filter(Boolean) as string[];

  for (const userId of userIds) {
    await create({
      userId,
      coupleId,
      type: 'new_wish',
      title: 'New Wish',
      message: `${wishAuthor} sent a wish to ${couple.display_name}`,
    });
  }
}

export async function notifyNewRsvp(eventId: string, rsvpName: string, status: string) {
  const event = await db
    .selectFrom('events')
    .innerJoin('couples', 'couples.id', 'events.couple_id')
    .select(['events.title', 'couples.partner1_id', 'couples.partner2_id', 'events.couple_id'])
    .where('events.id', '=', eventId)
    .executeTakeFirst();

  if (!event) return;

  const userIds = [event.partner1_id, event.partner2_id].filter(Boolean) as string[];

  for (const userId of userIds) {
    await create({
      userId,
      coupleId: event.couple_id,
      type: 'new_rsvp',
      title: 'New RSVP',
      message: `${rsvpName} is ${status} for "${event.title}"`,
    });
  }
}

export async function notifyNewComment(postId: string, commenterName: string) {
  const post = await db
    .selectFrom('posts')
    .innerJoin('couples', 'couples.id', 'posts.couple_id')
    .select(['couples.partner1_id', 'couples.partner2_id', 'posts.couple_id'])
    .where('posts.id', '=', postId)
    .executeTakeFirst();

  if (!post) return;

  const userIds = [post.partner1_id, post.partner2_id].filter(Boolean) as string[];

  for (const userId of userIds) {
    await create({
      userId,
      coupleId: post.couple_id,
      type: 'new_comment',
      title: 'New Comment',
      message: `${commenterName} commented on your post`,
    });
  }
}
