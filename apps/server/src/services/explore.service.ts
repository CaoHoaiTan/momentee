import { sql } from 'kysely';
import { db } from '../config/database.js';

export async function exploreCouples(opts: { limit?: number; offset?: number; search?: string } = {}) {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  let query = db
    .selectFrom('couples')
    .innerJoin('users as p1', 'p1.id', 'couples.partner1_id')
    .leftJoin('users as p2', 'p2.id', 'couples.partner2_id')
    .where('couples.is_public', '=', true)
    .orderBy('couples.view_count', 'desc')
    .orderBy('couples.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select([
      'couples.id',
      'couples.slug',
      'couples.display_name',
      'couples.cover_photo',
      'couples.bio',
      'couples.view_count',
      'couples.created_at',
      'p1.id as partner1_id',
      'p1.name as partner1_name',
      'p1.avatar as partner1_avatar',
      'p2.id as partner2_id',
      'p2.name as partner2_name',
      'p2.avatar as partner2_avatar',
    ]);

  if (opts.search) {
    query = query.where(
      'couples.display_name',
      'ilike',
      `%${opts.search}%`,
    );
  }

  const rows = await query.execute();

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    coverPhoto: row.cover_photo,
    bio: row.bio,
    viewCount: row.view_count,
    totalWishes: 0, // computed below
    totalPhotos: 0,
    partner1: { id: row.partner1_id, name: row.partner1_name, avatar: row.partner1_avatar },
    partner2: row.partner2_id ? { id: row.partner2_id, name: row.partner2_name, avatar: row.partner2_avatar } : null,
  }));
}

export async function trendingCouples(limit = 10) {
  return exploreCouples({ limit, offset: 0 });
}
