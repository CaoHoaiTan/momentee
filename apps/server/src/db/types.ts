import { ColumnType } from 'kysely';

// ─── Timestamp helpers ───────────────────────────────────────────────
type Created = ColumnType<Date, string | undefined, never>;
type Updated = ColumnType<Date, string | undefined, string | Date>;

// ─── Users ───────────────────────────────────────────────────────────
export interface UsersTable {
  id: string;
  email: string;
  password: string | null;
  name: string;
  avatar: string | null;
  provider: string | null;
  provider_id: string | null;
  email_verified: boolean;
  role: 'user' | 'admin';
  plan: 'free' | 'premium' | 'premium_plus';
  refresh_token: string | null;
  reset_token: string | null;
  reset_token_expires_at: Date | null;
  created_at: Created;
  updated_at: Updated;
}

// ─── Couples ─────────────────────────────────────────────────────────
export interface CouplesTable {
  id: string;
  slug: string;
  display_name: string;
  partner1_id: string;
  partner2_id: string | null;
  invite_code: string;
  cover_photo: string | null;
  bio: string | null;
  anniversary: string | null;
  wedding_date: string | null;
  theme: string;
  custom_domain: string | null;
  is_public: boolean;
  is_pinned: boolean;
  view_count: number;
  layout_config: Record<string, unknown> | null;
  background_music: Record<string, unknown> | null;
  plan: 'free' | 'premium' | 'premium_plus';
  created_at: Created;
  updated_at: Updated;
}

// ─── Milestones ──────────────────────────────────────────────────────
export interface MilestonesTable {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  date: string;
  icon: string | null;
  photo: string | null;
  sort_order: number;
  created_at: Created;
  updated_at: Updated;
}

// ─── Posts ────────────────────────────────────────────────────────────
export interface PostsTable {
  id: string;
  couple_id: string;
  caption: string | null;
  type: 'photo' | 'video' | 'story' | 'letter' | 'milestone';
  visibility: 'public' | 'friends_only' | 'private';
  is_pinned: boolean;
  created_at: Created;
  updated_at: Updated;
}

// ─── Media ───────────────────────────────────────────────────────────
export interface MediaTable {
  id: string;
  post_id: string;
  url: string;
  thumbnail: string | null;
  blur_hash: string | null;
  type: 'image' | 'video' | 'gif';
  width: number | null;
  height: number | null;
  sort_order: number;
}

// ─── Albums ──────────────────────────────────────────────────────────
export interface AlbumsTable {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  cover_photo: string | null;
  sort_order: number;
  created_at: Created;
  updated_at: Updated;
}

// ─── Album Photos ────────────────────────────────────────────────────
export interface AlbumPhotosTable {
  id: string;
  album_id: string;
  media_url: string;
  caption: string | null;
  sort_order: number;
  created_at: Created;
}

// ─── Wishes ──────────────────────────────────────────────────────────
export interface WishesTable {
  id: string;
  couple_id: string;
  author_name: string;
  author_avatar: string | null;
  message: string;
  emoji: string | null;
  is_anonymous: boolean;
  is_approved: boolean;
  created_at: Created;
  updated_at: Updated;
}

// ─── Reactions ───────────────────────────────────────────────────────
export interface ReactionsTable {
  id: string;
  post_id: string;
  user_id: string | null;
  guest_name: string | null;
  emoji: string;
  created_at: Created;
}

// ─── Comments ────────────────────────────────────────────────────────
export interface CommentsTable {
  id: string;
  post_id: string;
  user_id: string | null;
  guest_name: string | null;
  content: string;
  created_at: Created;
}

// ─── Events ──────────────────────────────────────────────────────────
export interface EventsTable {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  cover_photo: string | null;
  is_public: boolean;
  max_guests: number | null;
  created_at: Created;
  updated_at: Updated;
}

// ─── RSVPs ───────────────────────────────────────────────────────────
export interface RsvpsTable {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  status: 'attending' | 'maybe' | 'declined';
  plus_one: boolean;
  note: string | null;
  created_at: Created;
  updated_at: Updated;
}

// ─── Quizzes ─────────────────────────────────────────────────────────
export interface QuizzesTable {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Created;
}

// ─── Quiz Questions ──────────────────────────────────────────────────
export interface QuizQuestionsTable {
  id: string;
  quiz_id: string;
  question: string;
  options: string; // JSON
  correct_answer: number;
  sort_order: number;
}

// ─── Quiz Responses ──────────────────────────────────────────────────
export interface QuizResponsesTable {
  id: string;
  quiz_id: string;
  respondent_name: string;
  score: number;
  total_questions: number;
  created_at: Created;
  updated_at: Updated;
}

// ─── Gift Accounts ───────────────────────────────────────────────────
export interface GiftAccountsTable {
  id: string;
  couple_id: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  qr_code: string | null;
  note: string | null;
  is_active: boolean;
  created_at: Created;
  updated_at: Updated;
}

// ─── Notifications ───────────────────────────────────────────────────
export interface NotificationsTable {
  id: string;
  user_id: string;
  couple_id: string | null;
  type: string;
  title: string;
  message: string;
  data: string | null; // JSON
  is_read: boolean;
  created_at: Created;
}

// ─── Push Subscriptions ──────────────────────────────────────────────
export interface PushSubscriptionsTable {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Created;
}

// ─── Subscriptions ───────────────────────────────────────────────────
export interface SubscriptionsTable {
  id: string;
  couple_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: Created;
  updated_at: Updated;
}

// ─── Database ────────────────────────────────────────────────────────
export interface Database {
  users: UsersTable;
  couples: CouplesTable;
  milestones: MilestonesTable;
  posts: PostsTable;
  media: MediaTable;
  albums: AlbumsTable;
  album_photos: AlbumPhotosTable;
  wishes: WishesTable;
  reactions: ReactionsTable;
  comments: CommentsTable;
  events: EventsTable;
  rsvps: RsvpsTable;
  quizzes: QuizzesTable;
  quiz_questions: QuizQuestionsTable;
  quiz_responses: QuizResponsesTable;
  gift_accounts: GiftAccountsTable;
  notifications: NotificationsTable;
  push_subscriptions: PushSubscriptionsTable;
  subscriptions: SubscriptionsTable;
}
