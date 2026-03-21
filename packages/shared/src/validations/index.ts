import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createCoupleSchema = z.object({
  displayName: z.string().min(2).max(200),
  anniversary: z.string().optional(),
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
  date: z.string(),
  icon: z.string().max(10).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;
export const updateCoupleSchema = z.object({
  displayName: z.string().min(2).max(200).optional(),
  bio: z.string().max(500).optional(),
  anniversary: z.string().optional(),
  weddingDate: z.string().optional(),
  theme: z.string().max(30).optional(),
  coverPhoto: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateCoupleInput = z.infer<typeof updateCoupleSchema>;
