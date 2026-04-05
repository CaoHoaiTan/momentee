import { z } from 'zod';

// ISO date string (YYYY-MM-DD)
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]~`]/, 'Password must contain at least one special character');

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: strongPassword,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: strongPassword,
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createCoupleSchema = z.object({
  displayName: z.string().min(2).max(200),
  anniversary: dateString.optional(),
  bio: z.string().max(500).optional(),
});

export const createPostSchema = z.object({
  caption: z.string().max(2000).optional(),
  type: z.enum(['photo', 'video', 'story', 'letter', 'milestone']),
  visibility: z.enum(['public', 'friends_only', 'private']),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: dateString,
  icon: z.string().max(4).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;
export const updateCoupleSchema = z.object({
  displayName: z.string().min(2).max(200).optional(),
  bio: z.string().max(500).optional(),
  anniversary: dateString.optional(),
  weddingDate: dateString.optional(),
  theme: z.string().max(50).optional(),
  layoutConfig: z.string().max(2000).optional(),
  backgroundMusic: z.string().max(8000).nullable().optional(),
  coverPhoto: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: dateString.optional(),
  icon: z.string().max(4).optional(),
});

export const createWishSchema = z.object({
  authorName: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
  emoji: z.string().max(4).optional(),
  isAnonymous: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  guestName: z.string().min(1).max(100).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type UpdateCoupleInput = z.infer<typeof updateCoupleSchema>;
export type CreateWishInput = z.infer<typeof createWishSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
