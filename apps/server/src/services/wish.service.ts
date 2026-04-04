import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

interface CreateWishInput {
  authorName: string;
  message: string;
  emoji?: string;
  isAnonymous?: boolean;
}

export async function create(coupleId: string, input: CreateWishInput) {
  // Verify couple exists
  const couple = await db
    .selectFrom('couples')
    .select('id')
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) {
    throw NotFoundError('Couple');
  }

  const wish = await db
    .insertInto('wishes')
    .values({
      id: createId(),
      couple_id: coupleId,
      author_name: input.authorName,
      message: input.message,
      emoji: input.emoji ?? null,
      is_anonymous: input.isAnonymous ?? false,
      is_approved: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return wish;
}

export async function getById(id: string) {
  const wish = await db
    .selectFrom('wishes')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!wish) {
    throw NotFoundError('Wish');
  }

  return wish;
}

export async function listByCoupleId(
  coupleId: string,
  limit = 50,
  offset = 0,
) {
  return db
    .selectFrom('wishes')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .where('is_approved', '=', true)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function remove(id: string, userId: string) {
  const wish = await getById(id);
  await verifyCoupleOwnership(wish.couple_id, userId);

  await db.deleteFrom('wishes').where('id', '=', id).execute();
  return true;
}

export async function approve(id: string, userId: string, approved: boolean) {
  const wish = await getById(id);
  await verifyCoupleOwnership(wish.couple_id, userId);

  const updated = await db
    .updateTable('wishes')
    .set({ is_approved: approved })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updated;
}

async function verifyCoupleOwnership(coupleId: string, userId: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) {
    throw NotFoundError('Couple');
  }

  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}
