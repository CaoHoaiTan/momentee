import { randomBytes } from 'crypto';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ValidationError } from '../utils/errors.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
    plan: string;
    created_at: Date;
  };
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const existing = await db
    .selectFrom('users')
    .select('id')
    .where('email', '=', input.email)
    .executeTakeFirst();

  if (existing) {
    throw ValidationError('Email already in use');
  }

  const hashedPassword = await hashPassword(input.password);
  const id = createId();

  const accessToken = signAccessToken({ userId: id });
  const refreshToken = signRefreshToken({ userId: id });
  const hashedRefreshToken = await hashPassword(refreshToken);

  const user = await db
    .insertInto('users')
    .values({
      id,
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: 'user',
      plan: 'free',
      email_verified: false,
      refresh_token: hashedRefreshToken,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return { accessToken, refreshToken, user };
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const user = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', input.email)
    .executeTakeFirst();

  if (!user || !user.password) {
    throw ValidationError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw ValidationError('Invalid email or password');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  const hashedRefreshToken = await hashPassword(refreshToken);

  await db
    .updateTable('users')
    .set({ refresh_token: hashedRefreshToken })
    .where('id', '=', user.id)
    .execute();

  return { accessToken, refreshToken, user };
}

export async function refreshToken(token: string): Promise<AuthPayload> {
  const payload = verifyRefreshToken(token);

  const user = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', payload.userId)
    .executeTakeFirst();

  if (!user || !user.refresh_token) {
    throw ValidationError('Invalid refresh token');
  }

  const valid = await comparePassword(token, user.refresh_token);
  if (!valid) {
    throw ValidationError('Invalid refresh token');
  }

  const accessToken = signAccessToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ userId: user.id });
  const hashedRefreshToken = await hashPassword(newRefreshToken);

  await db
    .updateTable('users')
    .set({ refresh_token: hashedRefreshToken })
    .where('id', '=', user.id)
    .execute();

  return { accessToken, refreshToken: newRefreshToken, user };
}

export async function logout(userId: string): Promise<void> {
  await db
    .updateTable('users')
    .set({ refresh_token: null })
    .where('id', '=', userId)
    .execute();
}

export async function me(userId: string) {
  return (
    db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'avatar', 'role', 'plan', 'created_at'])
      .where('id', '=', userId)
      .executeTakeFirst() ?? null
  );
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const user = await db
    .selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst();

  // Always return true to prevent email enumeration
  if (!user) return true;

  const token = randomBytes(32).toString('hex');
  const hashedToken = await hashPassword(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .updateTable('users')
    .set({
      reset_token: hashedToken,
      reset_token_expires_at: expiresAt as any,
    })
    .where('id', '=', user.id)
    .execute();

  // TODO: Send email with reset link containing `token`
  // For now, log token in development for testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  return true;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  // Find users with non-expired reset tokens
  const users = await db
    .selectFrom('users')
    .select(['id', 'reset_token', 'reset_token_expires_at'])
    .where('reset_token', 'is not', null)
    .where('reset_token_expires_at', '>', new Date() as any)
    .execute();

  // Check token against each candidate (hashed comparison)
  let matchedUserId: string | null = null;
  for (const user of users) {
    if (user.reset_token && (await comparePassword(token, user.reset_token))) {
      matchedUserId = user.id;
      break;
    }
  }

  if (!matchedUserId) {
    throw ValidationError('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .updateTable('users')
    .set({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires_at: null,
      refresh_token: null, // Invalidate all sessions
    })
    .where('id', '=', matchedUserId)
    .execute();

  return true;
}
