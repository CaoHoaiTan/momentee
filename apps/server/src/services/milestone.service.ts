import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/errors.js';

interface CreateMilestoneInput {
  title: string;
  description?: string;
  date: string;
  icon?: string;
}

interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  date?: string;
  icon?: string;
}

export async function create(
  coupleId: string,
  userId: string,
  input: CreateMilestoneInput,
) {
  await verifyCoupleOwnership(coupleId, userId);

  // Get max sort_order for this couple
  const last = await db
    .selectFrom('milestones')
    .select('sort_order')
    .where('couple_id', '=', coupleId)
    .orderBy('sort_order', 'desc')
    .executeTakeFirst();

  const sortOrder = last ? last.sort_order + 1 : 0;

  const id = createId();
  const milestone = await db
    .insertInto('milestones')
    .values({
      id,
      couple_id: coupleId,
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      icon: input.icon ?? null,
      photo: null,
      sort_order: sortOrder,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return milestone;
}

export async function getById(id: string) {
  const milestone = await db
    .selectFrom('milestones')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!milestone) {
    throw NotFoundError('Milestone');
  }

  return milestone;
}

export async function listByCoupleId(coupleId: string, limit = 100, offset = 0) {
  return db
    .selectFrom('milestones')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('date', 'asc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function update(
  id: string,
  userId: string,
  input: UpdateMilestoneInput,
) {
  const milestone = await getById(id);
  await verifyCoupleOwnership(milestone.couple_id, userId);

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.date !== undefined) updateData.date = input.date;
  if (input.icon !== undefined) updateData.icon = input.icon;

  if (Object.keys(updateData).length === 0) {
    return milestone;
  }

  const updated = await db
    .updateTable('milestones')
    .set(updateData)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updated;
}

export async function remove(id: string, userId: string) {
  const milestone = await getById(id);
  await verifyCoupleOwnership(milestone.couple_id, userId);

  await db.deleteFrom('milestones').where('id', '=', id).execute();
  return true;
}

export async function reorder(
  coupleId: string,
  userId: string,
  orderedIds: string[],
) {
  await verifyCoupleOwnership(coupleId, userId);

  await db.transaction().execute(async (trx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await trx
        .updateTable('milestones')
        .set({ sort_order: i })
        .where('id', '=', orderedIds[i])
        .where('couple_id', '=', coupleId)
        .execute();
    }
  });

  return listByCoupleId(coupleId);
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
