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

export async function me(userId: string) {
  return (
    db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'avatar', 'role', 'plan', 'created_at'])
      .where('id', '=', userId)
      .executeTakeFirst() ?? null
  );
}
