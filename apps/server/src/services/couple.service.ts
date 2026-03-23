import { createId } from '@paralleldrive/cuid2';
import { sql } from 'kysely';
import { slugify, generateInviteCode } from '@momentee/shared';
import { db } from '../config/database.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors.js';

interface CreateCoupleInput {
  displayName: string;
  anniversary?: string;
  bio?: string;
}

interface UpdateCoupleInput {
  displayName?: string;
  bio?: string;
  anniversary?: string;
  weddingDate?: string;
  theme?: string;
  layoutConfig?: string;
  coverPhoto?: string;
  isPublic?: boolean;
}

export async function create(userId: string, input: CreateCoupleInput) {
  // Check if user already has a couple
  const existing = await db
    .selectFrom('couples')
    .select('id')
    .where((eb) =>
      eb.or([eb('partner1_id', '=', userId), eb('partner2_id', '=', userId)]),
    )
    .executeTakeFirst();

  if (existing) {
    throw ValidationError('You are already part of a couple');
  }

  const id = createId();
  const slug = slugify(input.displayName) + '-' + id.slice(0, 6);
  const inviteCode = generateInviteCode();

  const couple = await db
    .insertInto('couples')
    .values({
      id,
      slug,
      display_name: input.displayName,
      partner1_id: userId,
      invite_code: inviteCode,
      bio: input.bio ?? null,
      anniversary: input.anniversary ?? null,
      theme: 'coral',
      is_public: true,
      is_pinned: false,
      view_count: 0,
      plan: 'free',
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return couple;
}

export async function getBySlug(slug: string) {
  const couple = await db
    .selectFrom('couples')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();

  if (!couple) {
    throw NotFoundError('Couple');
  }

  return couple;
}

export async function getById(id: string) {
  const couple = await db
    .selectFrom('couples')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!couple) {
    throw NotFoundError('Couple');
  }

  return couple;
}

export async function getByUserId(userId: string) {
  return (
    db
      .selectFrom('couples')
      .selectAll()
      .where((eb) =>
        eb.or([
          eb('partner1_id', '=', userId),
          eb('partner2_id', '=', userId),
        ]),
      )
      .executeTakeFirst() ?? null
  );
}

export async function update(
  coupleId: string,
  userId: string,
  input: UpdateCoupleInput,
) {
  const couple = await getById(coupleId);
  verifyOwnership(couple, userId);

  const updateData: Record<string, unknown> = {};

  if (input.displayName !== undefined) {
    updateData.display_name = input.displayName;
    updateData.slug =
      slugify(input.displayName) + '-' + coupleId.slice(0, 6);
  }
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.anniversary !== undefined)
    updateData.anniversary = input.anniversary;
  if (input.weddingDate !== undefined)
    updateData.wedding_date = input.weddingDate;
  if (input.theme !== undefined) updateData.theme = input.theme;
  if (input.layoutConfig !== undefined) {
    try {
      updateData.layout_config = JSON.parse(input.layoutConfig);
    } catch {
      updateData.layout_config = {};
    }
  }
  if (input.coverPhoto !== undefined)
    updateData.cover_photo = input.coverPhoto;
  if (input.isPublic !== undefined) updateData.is_public = input.isPublic;

  if (Object.keys(updateData).length === 0) {
    return couple;
  }

  const updated = await db
    .updateTable('couples')
    .set(updateData)
    .where('id', '=', coupleId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updated;
}

export async function remove(coupleId: string, userId: string) {
  const couple = await getById(coupleId);
  verifyOwnership(couple, userId);

  await db.deleteFrom('couples').where('id', '=', coupleId).execute();
  return true;
}

export async function acceptInvite(userId: string, inviteCode: string) {
  // Check if user already has a couple
  const existing = await db
    .selectFrom('couples')
    .select('id')
    .where((eb) =>
      eb.or([eb('partner1_id', '=', userId), eb('partner2_id', '=', userId)]),
    )
    .executeTakeFirst();

  if (existing) {
    throw ValidationError('You are already part of a couple');
  }

  const couple = await db
    .selectFrom('couples')
    .selectAll()
    .where('invite_code', '=', inviteCode)
    .executeTakeFirst();

  if (!couple) {
    throw NotFoundError('Invite code');
  }

  if (couple.partner2_id) {
    throw ValidationError('This couple already has two partners');
  }

  if (couple.partner1_id === userId) {
    throw ValidationError('You cannot accept your own invite');
  }

  const updated = await db
    .updateTable('couples')
    .set({ partner2_id: userId })
    .where('id', '=', couple.id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updated;
}

export async function incrementViews(slug: string) {
  await db
    .updateTable('couples')
    .set({ view_count: sql`view_count + 1` })
    .where('slug', '=', slug)
    .execute();

  return true;
}

export async function getStats(coupleId: string) {
  const [wishCount, postCount, milestoneCount] = await Promise.all([
    db
      .selectFrom('wishes')
      .select(sql<number>`count(*)`.as('count'))
      .where('couple_id', '=', coupleId)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom('posts')
      .select(sql<number>`count(*)`.as('count'))
      .where('couple_id', '=', coupleId)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom('milestones')
      .select(sql<number>`count(*)`.as('count'))
      .where('couple_id', '=', coupleId)
      .executeTakeFirstOrThrow(),
  ]);

  const photoCount = await db
    .selectFrom('media')
    .innerJoin('posts', 'posts.id', 'media.post_id')
    .select(sql<number>`count(*)`.as('count'))
    .where('posts.couple_id', '=', coupleId)
    .executeTakeFirstOrThrow();

  return {
    totalWishes: Number(wishCount.count),
    totalPosts: Number(postCount.count),
    totalMilestones: Number(milestoneCount.count),
    totalPhotos: Number(photoCount.count),
  };
}

function verifyOwnership(
  couple: { partner1_id: string; partner2_id: string | null },
  userId: string,
) {
  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}

export async function getPartner(userId: string) {
  return db
    .selectFrom('users')
    .select(['id', 'email', 'name', 'avatar', 'role', 'plan', 'created_at'])
    .where('id', '=', userId)
    .executeTakeFirst();
}
