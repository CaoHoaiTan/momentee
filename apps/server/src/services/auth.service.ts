import { randomBytes } from 'crypto';
import { createId } from '@paralleldrive/cuid2';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
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
    email_verified: boolean;
    created_at: Date;
  };
}

// ─── Register ──────────────────────────────────────────────────────

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

  // Send verification email
  await sendVerificationEmail(user.id, user.email);

  return { accessToken, refreshToken, user };
}

// ─── Login ─────────────────────────────────────────────────────────

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

// ─── Token refresh ─────────────────────────────────────────────────

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

// ─── Logout ────────────────────────────────────────────────────────

export async function logout(userId: string): Promise<void> {
  await db
    .updateTable('users')
    .set({ refresh_token: null })
    .where('id', '=', userId)
    .execute();
}

// ─── Me ────────────────────────────────────────────────────────────

export async function me(userId: string) {
  return (
    db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'avatar', 'role', 'plan', 'email_verified', 'created_at'])
      .where('id', '=', userId)
      .executeTakeFirst() ?? null
  );
}

// ─── Email verification ────────────────────────────────────────────

export async function sendVerificationEmail(userId: string, email: string): Promise<boolean> {
  const token = randomBytes(32).toString('hex');
  const hashedToken = await hashPassword(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db
    .updateTable('users')
    .set({
      email_verification_token: hashedToken,
      email_verification_token_expires_at: expiresAt as any,
    })
    .where('id', '=', userId)
    .execute();

  // TODO: Send email with verification link containing `token`
  // For now, log token in development for testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Email verification token for ${email}: ${token}`);
    console.log(`[DEV] Verify URL: ${env.CORS_ORIGIN}/verify-email?token=${token}`);
  }

  return true;
}

export async function requestEmailVerification(userId: string): Promise<boolean> {
  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'email_verified'])
    .where('id', '=', userId)
    .executeTakeFirst();

  if (!user) throw ValidationError('User not found');
  if (user.email_verified) throw ValidationError('Email is already verified');

  return sendVerificationEmail(user.id, user.email);
}

export async function verifyEmail(token: string): Promise<AuthPayload> {
  const users = await db
    .selectFrom('users')
    .selectAll()
    .where('email_verification_token', 'is not', null)
    .where('email_verification_token_expires_at', '>', new Date() as any)
    .execute();

  let matchedUser: typeof users[number] | null = null;
  for (const user of users) {
    if (user.email_verification_token && (await comparePassword(token, user.email_verification_token))) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw ValidationError('Invalid or expired verification token');
  }

  await db
    .updateTable('users')
    .set({
      email_verified: true,
      email_verification_token: null,
      email_verification_token_expires_at: null,
    })
    .where('id', '=', matchedUser.id)
    .execute();

  // Return fresh tokens so user is auto-logged in after verification
  const accessToken = signAccessToken({ userId: matchedUser.id });
  const refreshToken = signRefreshToken({ userId: matchedUser.id });
  const hashedRefreshToken = await hashPassword(refreshToken);

  await db
    .updateTable('users')
    .set({ refresh_token: hashedRefreshToken })
    .where('id', '=', matchedUser.id)
    .execute();

  return {
    accessToken,
    refreshToken,
    user: { ...matchedUser, email_verified: true },
  };
}

// ─── Password reset ────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<boolean> {
  const user = await db
    .selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst();

  if (!user) return true;

  const token = randomBytes(32).toString('hex');
  const hashedToken = await hashPassword(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .updateTable('users')
    .set({
      reset_token: hashedToken,
      reset_token_expires_at: expiresAt as any,
    })
    .where('id', '=', user.id)
    .execute();

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  return true;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const users = await db
    .selectFrom('users')
    .select(['id', 'reset_token', 'reset_token_expires_at'])
    .where('reset_token', 'is not', null)
    .where('reset_token_expires_at', '>', new Date() as any)
    .execute();

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
      refresh_token: null,
    })
    .where('id', '=', matchedUserId)
    .execute();

  return true;
}

// ─── Google OAuth ──────────────────────────────────────────────────

export async function googleLogin(idToken: string): Promise<AuthPayload> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw ValidationError('Google login is not configured');
  }

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  }).catch(() => {
    throw ValidationError('Invalid Google token');
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw ValidationError('Invalid Google token');
  }

  const { email, name, picture, sub: googleId } = payload;

  // Check if user exists by Google provider ID
  let user = await db
    .selectFrom('users')
    .selectAll()
    .where('provider', '=', 'google')
    .where('provider_id', '=', googleId)
    .executeTakeFirst();

  if (!user) {
    // Check if email is already registered with password
    const existingByEmail = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingByEmail) {
      // Link Google account to existing email user
      await db
        .updateTable('users')
        .set({
          provider: 'google',
          provider_id: googleId,
          email_verified: true,
          avatar: existingByEmail.avatar ?? picture ?? null,
        })
        .where('id', '=', existingByEmail.id)
        .execute();

      user = await db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', existingByEmail.id)
        .executeTakeFirstOrThrow();
    } else {
      // Create new user
      const id = createId();
      user = await db
        .insertInto('users')
        .values({
          id,
          email,
          password: null,
          name: name ?? email.split('@')[0],
          avatar: picture ?? null,
          provider: 'google',
          provider_id: googleId,
          email_verified: true,
          role: 'user',
          plan: 'free',
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    }
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
