import { Request } from 'express';
import { Kysely } from 'kysely';
import { Database } from '../db/types.js';
import { db } from '../config/database.js';
import { verifyAccessToken } from '../utils/jwt.js';

export interface GQLContext {
  db: Kysely<Database>;
  user: { userId: string } | null;
  req: Request;
}

export async function createContext({ req }: { req: Request }): Promise<GQLContext> {
  let user: { userId: string } | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      user = verifyAccessToken(authHeader.slice(7));
    } catch {
      // Token invalid or expired — context.user stays null
    }
  }

  return { db, user, req };
}
