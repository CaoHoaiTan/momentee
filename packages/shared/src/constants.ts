export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
}

export enum PostType {
  PHOTO = 'photo',
  VIDEO = 'video',
  STORY = 'story',
  LETTER = 'letter',
  MILESTONE = 'milestone',
}

export enum Visibility {
  PUBLIC = 'public',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
}

export const PLAN_LIMITS = {
  free: {
    milestones: 10,
    posts: 50,
    albums: 3,
    media_per_post: 5,
  },
  premium: {
    milestones: 100,
    posts: 500,
    albums: 20,
    media_per_post: 20,
  },
  premium_plus: {
    milestones: -1,
    posts: -1,
    albums: -1,
    media_per_post: -1,
  },
} as const;
