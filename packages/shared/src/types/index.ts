export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'premium' | 'premium_plus';
  createdAt: Date | string;
}

export interface Couple {
  id: string;
  slug: string;
  displayName: string;
  partner1Id: string;
  partner2Id: string;
  inviteCode: string;
  coverPhoto: string | null;
  bio: string | null;
  anniversary: Date | string | null;
  weddingDate: Date | string | null;
  theme: string | null;
  isPublic: boolean;
  viewCount: number;
  plan: 'free' | 'premium' | 'premium_plus';
  createdAt: Date | string;
}

export interface Post {
  id: string;
  coupleId: string;
  caption: string | null;
  type: 'photo' | 'video' | 'story' | 'letter' | 'milestone';
  visibility: 'public' | 'friends_only' | 'private';
  isPinned: boolean;
  createdAt: Date | string;
}

export interface Milestone {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  date: Date | string;
  icon: string | null;
  photo: string | null;
  sortOrder: number;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}
