import { sql } from 'kysely';
import { db } from '../config/database.js';
import { ForbiddenError } from '../utils/errors.js';
import type { GQLContext } from '../graphql/context.js';

export function requireAdmin(context: GQLContext) {
  if (!context.user) {
    throw ForbiddenError('Authentication required');
  }
  // Check role from token or DB
  return context.user;
}

export async function verifyAdmin(userId: string) {
  const user = await db
    .selectFrom('users')
    .select('role')
    .where('id', '=', userId)
    .executeTakeFirst();

  if (!user || user.role !== 'admin') {
    throw ForbiddenError('Admin access required');
  }
}

export async function getStats() {
  const [userCount, coupleCount, postCount, wishCount] = await Promise.all([
    db.selectFrom('users').select(db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow(),
    db.selectFrom('couples').select(db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow(),
    db.selectFrom('posts').select(db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow(),
    db.selectFrom('wishes').select(db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow(),
  ]);

  return {
    totalUsers: Number(userCount.count),
    totalCouples: Number(coupleCount.count),
    totalPosts: Number(postCount.count),
    totalWishes: Number(wishCount.count),
  };
}

export async function listUsers(limit = 50, offset = 0, search?: string) {
  let query = db
    .selectFrom('users')
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (search) {
    query = query.where((eb) =>
      eb.or([
        eb('name', 'ilike', `%${search}%`),
        eb('email', 'ilike', `%${search}%`),
      ]),
    );
  }

  return query.execute();
}

export async function listCouples(limit = 50, offset = 0, search?: string) {
  let query = db
    .selectFrom('couples')
    .innerJoin('users as p1', 'p1.id', 'couples.partner1_id')
    .selectAll('couples')
    .select(['p1.name as partner1_name', 'p1.email as partner1_email'])
    .orderBy('couples.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (search) {
    query = query.where('couples.display_name', 'ilike', `%${search}%`);
  }

  return query.execute();
}

export async function deleteUser(userId: string) {
  await db.deleteFrom('users').where('id', '=', userId).execute();
  return true;
}

export async function deleteCouple(coupleId: string) {
  await db.deleteFrom('couples').where('id', '=', coupleId).execute();
  return true;
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  await db
    .updateTable('users')
    .set({ role, updated_at: new Date() as any })
    .where('id', '=', userId)
    .execute();

  return db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();
}
