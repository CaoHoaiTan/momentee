# MOMENTEE — Project Implementation Plan (v2)

> **"Every couple has a story"**
> A Gen-Z social network platform where couples preserve memories, share their love stories, and receive blessings from friends & family.

---

## PROJECT OVERVIEW

**Product:** Momentee — Social network for couples
**Tagline:** Every couple has a story
**Target:** Gen-Z couples (18-30), Vietnamese market first, international expansion later
**Vibe:** Playful, TikTok-friendly, bold colors, emoji-rich, interactive
**Architecture:** Monorepo — separate Frontend (Next.js) + Backend (Express + GraphQL)

---

## TECH STACK

| Layer              | Technology                                | Why                                       |
| ------------------ | ----------------------------------------- | ----------------------------------------- |
| **FRONTEND**       |                                           |                                           |
| Framework          | Next.js 14+ (App Router)                  | SSR/SSG, SEO, React Server Components     |
| Styling            | Tailwind CSS + Framer Motion              | Utility-first, smooth animations          |
| GraphQL Client     | Apollo Client (@apollo/client)            | Caching, optimistic UI, subscriptions     |
| Forms              | React Hook Form + Zod                     | Validation, performance                   |
| Icons              | Lucide React                              | Clean, lightweight                        |
| **BACKEND**        |                                           |                                           |
| Runtime            | Node.js 20+ (TypeScript)                  | Type safety, modern ESM                   |
| Framework          | Express.js                                | Mature, flexible, middleware ecosystem    |
| API Layer          | Apollo Server v4 + GraphQL                | Typed API, single endpoint, subscriptions |
| Query Builder      | Kysely                                    | Type-safe SQL, no magic, full control     |
| Database           | PostgreSQL 16                             | Relational, JSONB, full-text search       |
| Migrations         | Kysely Migrations                         | Version-controlled, pure SQL via Kysely   |
| Auth               | Custom JWT (access + refresh tokens)      | Full control, no vendor lock-in           |
| Password           | bcryptjs                                  | Secure hashing                            |
| OAuth              | Passport.js (Google, Facebook strategies) | Social login                              |
| Validation         | Zod                                       | Shared validation between client & server |
| File Upload        | graphql-upload + Multer                   | Multipart upload handling                 |
| **SHARED**         |                                           |                                           |
| File Storage       | AWS S3 / Cloudflare R2                    | Image & video uploads, CDN                |
| Image Processing   | Sharp                                     | Resize, thumbnail, WebP, blur-hash        |
| Email              | Resend (or Nodemailer)                    | Transactional emails                      |
| Push Notifications | web-push (VAPID)                          | Browser push notifications                |
| Payments           | Stripe                                    | Subscriptions, Vietnamese cards           |
| Realtime           | GraphQL Subscriptions (WebSocket)         | Live wishes, reactions                    |
| Monorepo           | Turborepo (or npm workspaces)             | Shared types, scripts                     |
| **DEVOPS**         |                                           |                                           |
| Containerization   | Docker + Docker Compose                   | Consistent environments                   |
| Deployment         | VPS (DigitalOcean/Hetzner)                | Self-hosted, full control                 |
| Reverse Proxy      | Caddy (auto HTTPS)                        | SSL, routing                              |
| CI/CD              | GitHub Actions                            | Auto deploy on push                       |
| Monitoring         | Sentry + Umami                            | Errors + analytics                        |

---

## MONOREPO STRUCTURE

```
momentee/
├── package.json                  # root workspace config
├── turbo.json                    # turborepo config (optional)
├── docker-compose.yml            # local dev: postgres + redis
├── docker-compose.prod.yml       # production setup
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml                # lint + test on PR
│       └── deploy.yml            # build + deploy on main
│
├── packages/
│   └── shared/                   # shared code between frontend & backend
│       ├── package.json
│       └── src/
│           ├── types/            # shared TypeScript interfaces
│           │   ├── user.ts
│           │   ├── couple.ts
│           │   ├── post.ts
│           │   └── index.ts
│           ├── validations/      # shared Zod schemas
│           │   ├── auth.ts
│           │   ├── couple.ts
│           │   ├── post.ts
│           │   └── index.ts
│           ├── constants.ts      # enums, plan limits, etc.
│           └── utils.ts          # shared helpers (slugify, format date)
│
├── apps/
│   ├── server/                   # ← EXPRESS + GRAPHQL BACKEND
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env.local
│   │   └── src/
│   │       ├── index.ts                  # entry: Express + Apollo Server bootstrap
│   │       ├── config/
│   │       │   ├── database.ts           # Kysely instance + pool config
│   │       │   ├── env.ts                # typed env vars (dotenv + zod)
│   │       │   ├── s3.ts                 # S3/R2 client
│   │       │   ├── stripe.ts            # Stripe client
│   │       │   ├── email.ts             # Resend/Nodemailer client
│   │       │   └── push.ts             # web-push VAPID config
│   │       ├── db/
│   │       │   ├── types.ts              # Kysely database interface (auto-generated or manual)
│   │       │   ├── migrations/
│   │       │   │   ├── 001_create_users.ts
│   │       │   │   ├── 002_create_couples.ts
│   │       │   │   ├── 003_create_milestones.ts
│   │       │   │   ├── 004_create_posts_media.ts
│   │       │   │   ├── 005_create_albums.ts
│   │       │   │   ├── 006_create_wishes.ts
│   │       │   │   ├── 007_create_reactions_comments.ts
│   │       │   │   ├── 008_create_events_rsvps.ts
│   │       │   │   ├── 009_create_quizzes.ts
│   │       │   │   ├── 010_create_gifts.ts
│   │       │   │   ├── 011_create_notifications.ts
│   │       │   │   ├── 012_create_push_subscriptions.ts
│   │       │   │   └── 013_create_subscriptions.ts
│   │       │   └── seed.ts               # seed script with test data
│   │       ├── graphql/
│   │       │   ├── schema.ts             # merged typeDefs
│   │       │   ├── resolvers/
│   │       │   │   ├── index.ts          # merge all resolvers
│   │       │   │   ├── auth.resolver.ts
│   │       │   │   ├── user.resolver.ts
│   │       │   │   ├── couple.resolver.ts
│   │       │   │   ├── milestone.resolver.ts
│   │       │   │   ├── post.resolver.ts
│   │       │   │   ├── album.resolver.ts
│   │       │   │   ├── wish.resolver.ts
│   │       │   │   ├── reaction.resolver.ts
│   │       │   │   ├── comment.resolver.ts
│   │       │   │   ├── event.resolver.ts
│   │       │   │   ├── rsvp.resolver.ts
│   │       │   │   ├── quiz.resolver.ts
│   │       │   │   ├── gift.resolver.ts
│   │       │   │   ├── notification.resolver.ts
│   │       │   │   ├── upload.resolver.ts
│   │       │   │   └── billing.resolver.ts
│   │       │   ├── typeDefs/
│   │       │   │   ├── index.ts          # merge all type definitions
│   │       │   │   ├── auth.graphql.ts
│   │       │   │   ├── user.graphql.ts
│   │       │   │   ├── couple.graphql.ts
│   │       │   │   ├── milestone.graphql.ts
│   │       │   │   ├── post.graphql.ts
│   │       │   │   ├── album.graphql.ts
│   │       │   │   ├── wish.graphql.ts
│   │       │   │   ├── reaction.graphql.ts
│   │       │   │   ├── comment.graphql.ts
│   │       │   │   ├── event.graphql.ts
│   │       │   │   ├── rsvp.graphql.ts
│   │       │   │   ├── quiz.graphql.ts
│   │       │   │   ├── gift.graphql.ts
│   │       │   │   ├── notification.graphql.ts
│   │       │   │   ├── upload.graphql.ts
│   │       │   │   └── billing.graphql.ts
│   │       │   ├── subscriptions/        # GraphQL subscriptions (realtime)
│   │       │   │   ├── wish.sub.ts
│   │       │   │   ├── reaction.sub.ts
│   │       │   │   └── notification.sub.ts
│   │       │   ├── context.ts            # GraphQL context (user, db, etc.)
│   │       │   └── directives/           # custom directives
│   │       │       ├── auth.directive.ts       # @auth
│   │       │       └── coupleOwner.directive.ts # @coupleOwner
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts     # JWT verification middleware
│   │       │   ├── rateLimit.middleware.ts
│   │       │   └── cors.middleware.ts
│   │       ├── services/                 # business logic layer
│   │       │   ├── auth.service.ts
│   │       │   ├── user.service.ts
│   │       │   ├── couple.service.ts
│   │       │   ├── milestone.service.ts
│   │       │   ├── post.service.ts
│   │       │   ├── album.service.ts
│   │       │   ├── wish.service.ts
│   │       │   ├── reaction.service.ts
│   │       │   ├── comment.service.ts
│   │       │   ├── event.service.ts
│   │       │   ├── rsvp.service.ts
│   │       │   ├── quiz.service.ts
│   │       │   ├── gift.service.ts
│   │       │   ├── notification.service.ts
│   │       │   ├── upload.service.ts
│   │       │   ├── email.service.ts
│   │       │   ├── push.service.ts
│   │       │   └── billing.service.ts
│   │       ├── utils/
│   │       │   ├── jwt.ts                # sign/verify JWT helpers
│   │       │   ├── password.ts           # hash/compare bcrypt
│   │       │   ├── slug.ts              # slug generation
│   │       │   ├── pagination.ts        # cursor-based pagination helper
│   │       │   └── errors.ts            # custom GraphQL errors
│   │       └── routes/
│   │           ├── webhook.route.ts      # POST /webhooks/stripe (REST, not GraphQL)
│   │           └── health.route.ts       # GET /health
│   │
│   └── web/                      # ← NEXT.JS FRONTEND
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── .env.local
│       ├── public/
│       │   ├── fonts/
│       │   ├── images/
│       │   └── sw.js              # service worker for push
│       └── src/
│           ├── app/
│           │   ├── (auth)/
│           │   │   ├── login/page.tsx
│           │   │   ├── register/page.tsx
│           │   │   └── forgot-password/page.tsx
│           │   ├── (marketing)/
│           │   │   ├── page.tsx           # landing page
│           │   │   ├── pricing/page.tsx
│           │   │   └── explore/page.tsx
│           │   ├── (dashboard)/
│           │   │   ├── layout.tsx
│           │   │   ├── dashboard/page.tsx
│           │   │   ├── dashboard/milestones/page.tsx
│           │   │   ├── dashboard/posts/page.tsx
│           │   │   ├── dashboard/albums/page.tsx
│           │   │   ├── dashboard/events/page.tsx
│           │   │   ├── dashboard/wishes/page.tsx
│           │   │   ├── dashboard/quiz/page.tsx
│           │   │   ├── dashboard/gift/page.tsx
│           │   │   ├── dashboard/analytics/page.tsx
│           │   │   └── dashboard/settings/
│           │   │       ├── page.tsx
│           │   │       ├── theme/page.tsx
│           │   │       ├── domain/page.tsx
│           │   │       ├── notifications/page.tsx
│           │   │       └── billing/page.tsx
│           │   ├── (admin)/
│           │   │   └── admin/
│           │   │       ├── page.tsx
│           │   │       ├── users/page.tsx
│           │   │       └── couples/page.tsx
│           │   ├── [slug]/page.tsx         # public couple page
│           │   ├── u/[username]/page.tsx   # user profile
│           │   ├── layout.tsx
│           │   └── globals.css
│           ├── components/
│           │   ├── ui/                     # Button, Input, Card, Modal, etc.
│           │   ├── layout/                 # Navbar, Sidebar, Footer
│           │   ├── couple/                 # Timeline, Gallery, WishForm, etc.
│           │   ├── dashboard/
│           │   ├── landing/
│           │   └── shared/                 # EmojiPicker, FileUpload, etc.
│           ├── lib/
│           │   ├── apollo-client.ts        # Apollo Client setup
│           │   ├── apollo-provider.tsx      # React context provider
│           │   ├── auth-context.tsx         # JWT auth context
│           │   ├── utils.ts
│           │   └── constants.ts
│           ├── graphql/
│           │   ├── queries/                # .ts files with gql`` tagged queries
│           │   │   ├── couple.queries.ts
│           │   │   ├── post.queries.ts
│           │   │   ├── wish.queries.ts
│           │   │   └── ...
│           │   ├── mutations/
│           │   │   ├── auth.mutations.ts
│           │   │   ├── couple.mutations.ts
│           │   │   ├── post.mutations.ts
│           │   │   └── ...
│           │   └── subscriptions/
│           │       ├── wish.subscriptions.ts
│           │       └── notification.subscriptions.ts
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useCouple.ts
│           │   ├── useNotifications.ts
│           │   └── useMediaUpload.ts
│           ├── types/
│           └── middleware.ts               # Next.js middleware for auth redirect
```

---

## DATABASE SCHEMA (PostgreSQL + Kysely Migrations)

All migrations use Kysely's migration API. Enums are PostgreSQL native enums.
ID generation uses `cuid2` via a helper function or `gen_random_uuid()` for UUIDs.

### Migration 001: Users

```typescript
// apps/server/src/db/migrations/001_create_users.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create enums
  await sql`CREATE TYPE user_role AS ENUM ('user', 'admin')`.execute(db);
  await sql`CREATE TYPE plan_type AS ENUM ('free', 'premium', 'premium_plus')`.execute(db);

  await db.schema
    .createTable('users')
    .addColumn('id', 'varchar(30)', (col) => col.primaryKey()) // cuid2
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password', 'varchar(255)') // null if OAuth
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('avatar', 'text')
    .addColumn('provider', 'varchar(20)') // google, facebook, email
    .addColumn('provider_id', 'varchar(255)')
    .addColumn('email_verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('role', sql`user_role`, (col) => col.notNull().defaultTo('user'))
    .addColumn('plan', sql`plan_type`, (col) => col.notNull().defaultTo('free'))
    .addColumn('refresh_token', 'text') // hashed refresh token
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Index for OAuth lookup
  await db.schema
    .createIndex('idx_users_provider')
    .on('users')
    .columns(['provider', 'provider_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
  await sql`DROP TYPE IF EXISTS plan_type`.execute(db);
  await sql`DROP TYPE IF EXISTS user_role`.execute(db);
}
```

### Migration 002: Couples

```typescript
// apps/server/src/db/migrations/002_create_couples.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('couples')
    .addColumn('id', 'varchar(30)', (col) => col.primaryKey())
    .addColumn('slug', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('display_name', 'varchar(200)', (col) => col.notNull())
    .addColumn('partner1_id', 'varchar(30)', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('partner2_id', 'varchar(30)', (col) =>
      col.references('users.id').onDelete('set null'),
    )
    .addColumn('invite_code', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('cover_photo', 'text')
    .addColumn('bio', 'text')
    .addColumn('anniversary', 'date')
    .addColumn('wedding_date', 'date')
    .addColumn('theme', 'varchar(30)', (col) => col.notNull().defaultTo('coral'))
    .addColumn('custom_domain', 'varchar(255)', (col) => col.unique())
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('view_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('plan', sql`plan_type`, (col) => col.notNull().defaultTo('free'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('idx_couples_slug').on('couples').column('slug').execute();
  await db.schema.createIndex('idx_couples_partner1').on('couples').column('partner1_id').execute();
}
```

### Migration 003: Milestones

```typescript
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('milestones')
    .addColumn('id', 'varchar(30)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(30)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('icon', 'varchar(10)') // emoji
    .addColumn('photo', 'text')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_milestones_couple')
    .on('milestones')
    .column('couple_id')
    .execute();
}
```

### Migration 004: Posts & Media

```typescript
export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE post_type AS ENUM ('photo', 'video', 'story', 'letter', 'milestone')`.execute(
    db,
  );
  await sql`CREATE TYPE visibility AS ENUM ('public', 'friends_only', 'private')`.execute(db);
  await sql`CREATE TYPE media_type AS ENUM ('image', 'video', 'gif')`.execute(db);

  await db.schema
    .createTable('posts')
    .addColumn('id', 'varchar(30)', (col) => col.primaryKey())
    .addColumn('couple_id', 'varchar(30)', (col) =>
      col.notNull().references('couples.id').onDelete('cascade'),
    )
    .addColumn('caption', 'text')
    .addColumn('type', sql`post_type`, (col) => col.notNull().defaultTo('photo'))
    .addColumn('visibility', sql`visibility`, (col) => col.notNull().defaultTo('public'))
    .addColumn('is_pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_posts_couple_date')
    .on('posts')
    .columns(['couple_id', 'created_at'])
    .execute();

  await db.schema
    .createTable('media')
    .addColumn('id', 'varchar(30)', (col) => col.primaryKey())
    .addColumn('post_id', 'varchar(30)', (col) =>
      col.notNull().references('posts.id').onDelete('cascade'),
    )
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('thumbnail', 'text')
    .addColumn('blur_hash', 'varchar(50)')
    .addColumn('type', sql`media_type`, (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();
}
```

### Migration 005–013 (same pattern)

Follow the same Kysely migration pattern for: albums, wishes, reactions, comments, events, rsvps, quizzes, gifts, notifications, push_subscriptions, subscriptions.

Each table uses:

- `varchar(30)` for IDs (cuid2)
- `timestamptz` for timestamps
- Foreign keys with `onDelete('cascade')` where appropriate
- Indexes on frequently queried columns (couple_id, user_id, created_at)

### Kysely Database Interface

```typescript
// apps/server/src/db/types.ts
import { Generated, ColumnType } from 'kysely';

// Example for core tables — extend for all tables

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
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

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
  plan: 'free' | 'premium' | 'premium_plus';
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

// ... define interfaces for ALL remaining tables following the same pattern
```

### Database Connection

```typescript
// apps/server/src/config/database.ts
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../db/types';
import { env } from './env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export { pool };
```

---

## GRAPHQL SCHEMA (Key Types)

```graphql
# ============================================
# AUTH
# ============================================

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  loginWithGoogle(token: String!): AuthPayload!
  refreshToken(token: String!): AuthPayload!
  forgotPassword(email: String!): Boolean!
  resetPassword(token: String!, password: String!): Boolean!
  logout: Boolean!
}

input RegisterInput {
  email: String!
  password: String!
  name: String!
}

input LoginInput {
  email: String!
  password: String!
}

# ============================================
# USER
# ============================================

type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  role: UserRole!
  plan: PlanType!
  couples: [Couple!]!
  createdAt: DateTime!
}

enum UserRole {
  USER
  ADMIN
}
enum PlanType {
  FREE
  PREMIUM
  PREMIUM_PLUS
}

type Query {
  me: User # current logged-in user
  user(id: ID!): User
}

# ============================================
# COUPLE
# ============================================

type Couple {
  id: ID!
  slug: String!
  displayName: String!
  partner1: User!
  partner2: User
  inviteCode: String # only visible to owners
  coverPhoto: String
  bio: String
  anniversary: Date
  weddingDate: Date
  theme: String!
  customDomain: String
  isPublic: Boolean!
  viewCount: Int!
  plan: PlanType!

  # nested resolvers (loaded on demand)
  milestones: [Milestone!]!
  posts(first: Int, after: String): PostConnection!
  albums: [Album!]!
  wishes(first: Int, after: String): WishConnection!
  events: [Event!]!
  quizzes: [Quiz!]!
  giftAccounts: [GiftAccount!]!

  # computed fields
  daysTogether: Int!
  totalWishes: Int!
  totalPhotos: Int!

  createdAt: DateTime!
}

type CoupleConnection {
  edges: [CoupleEdge!]!
  pageInfo: PageInfo!
}

type Query {
  couple(slug: String!): Couple # public page
  coupleById(id: ID!): Couple # dashboard
  myCouple: Couple # current user's couple
  exploreCouples(first: Int, after: String, sort: CoupleSortBy): CoupleConnection!
}

type Mutation {
  createCouple(input: CreateCoupleInput!): Couple!
  updateCouple(id: ID!, input: UpdateCoupleInput!): Couple!
  deleteCouple(id: ID!): Boolean!
  acceptInvite(inviteCode: String!): Couple!
  incrementViewCount(slug: String!): Boolean!
}

enum CoupleSortBy {
  NEWEST
  POPULAR
  TRENDING
}

# ============================================
# MILESTONES
# ============================================

type Milestone {
  id: ID!
  title: String!
  description: String
  date: Date!
  icon: String
  photo: String
  sortOrder: Int!
  createdAt: DateTime!
}

type Mutation {
  createMilestone(coupleId: ID!, input: MilestoneInput!): Milestone!
  updateMilestone(id: ID!, input: MilestoneInput!): Milestone!
  deleteMilestone(id: ID!): Boolean!
  reorderMilestones(coupleId: ID!, orderedIds: [ID!]!): [Milestone!]!
}

# ============================================
# POSTS & MEDIA
# ============================================

type Post {
  id: ID!
  couple: Couple!
  caption: String
  type: PostType!
  visibility: Visibility!
  isPinned: Boolean!
  media: [Media!]!
  reactions: [ReactionGroup!]!
  reactionCount: Int!
  commentCount: Int!
  comments(first: Int, after: String): CommentConnection!
  createdAt: DateTime!
}

type Media {
  id: ID!
  url: String!
  thumbnail: String
  blurHash: String
  type: MediaType!
  width: Int
  height: Int
}

type ReactionGroup {
  emoji: String!
  count: Int!
  hasReacted: Boolean! # current user reacted with this emoji?
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

enum PostType {
  PHOTO
  VIDEO
  STORY
  LETTER
  MILESTONE
}
enum Visibility {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}
enum MediaType {
  IMAGE
  VIDEO
  GIF
}

type Mutation {
  createPost(coupleId: ID!, input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  pinPost(id: ID!, pinned: Boolean!): Post!
}

# ============================================
# WISHES
# ============================================

type Wish {
  id: ID!
  user: User
  guestName: String
  message: String!
  isApproved: Boolean!
  reactions: [ReactionGroup!]!
  createdAt: DateTime!
}

type WishConnection {
  edges: [WishEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Mutation {
  createWish(coupleId: ID!, input: WishInput!): Wish!
  approveWish(id: ID!, approved: Boolean!): Wish!
  deleteWish(id: ID!): Boolean!
}

type Subscription {
  wishAdded(coupleId: ID!): Wish! # realtime
}

# ============================================
# REACTIONS & COMMENTS
# ============================================

type Mutation {
  toggleReaction(input: ReactionInput!): Boolean! # add or remove
}

input ReactionInput {
  targetType: ReactionTarget! # POST or WISH
  targetId: ID!
  emoji: String! # ❤️ 😍 🎉 😂 🥹 💕
}

enum ReactionTarget {
  POST
  WISH
}

type Comment {
  id: ID!
  user: User
  guestName: String
  content: String!
  parentId: ID
  replies: [Comment!]!
  createdAt: DateTime!
}

type Mutation {
  createComment(postId: ID!, input: CommentInput!): Comment!
  deleteComment(id: ID!): Boolean!
}

# ============================================
# EVENTS & RSVP
# ============================================

type Event {
  id: ID!
  title: String!
  description: String
  date: DateTime!
  time: String
  location: String
  address: String
  mapUrl: String
  dressCode: String
  icon: String
  rsvpStats: RSVPStats!
  rsvps: [RSVP!]! # only visible to couple owners
}

type RSVPStats {
  attending: Int!
  notAttending: Int!
  totalGuests: Int!
}

type RSVP {
  id: ID!
  name: String!
  phone: String
  attending: Boolean!
  guestCount: Int!
  dietary: String
  note: String
  createdAt: DateTime!
}

type Mutation {
  createEvent(coupleId: ID!, input: EventInput!): Event!
  updateEvent(id: ID!, input: EventInput!): Event!
  deleteEvent(id: ID!): Boolean!
  submitRSVP(eventId: ID!, input: RSVPInput!): RSVP!
}

# ============================================
# QUIZ
# ============================================

type Quiz {
  id: ID!
  isActive: Boolean!
  questions: [QuizQuestion!]!
  leaderboard: [QuizResponse!]!
}

type QuizQuestion {
  id: ID!
  question: String!
  options: [String!]!
  correctIdx: Int # null for public (hidden), shown to owners
}

type Mutation {
  createQuiz(coupleId: ID!): Quiz!
  addQuizQuestion(quizId: ID!, input: QuizQuestionInput!): QuizQuestion!
  updateQuizQuestion(id: ID!, input: QuizQuestionInput!): QuizQuestion!
  deleteQuizQuestion(id: ID!): Boolean!
  submitQuizResponse(quizId: ID!, input: QuizResponseInput!): QuizResult!
}

type QuizResult {
  score: Int!
  total: Int!
  correctAnswers: [Int!]! # reveal correct answers after submission
}

# ============================================
# GIFTS, NOTIFICATIONS, BILLING, UPLOAD
# ============================================

# (Follow the same pattern for GiftAccount CRUD,
#  Notification queries, Billing mutations, Upload mutations)

# ============================================
# PAGINATION HELPERS
# ============================================

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

scalar DateTime
scalar Date
scalar Upload
```

---

## PHASE BREAKDOWN

---

### PHASE 1: Foundation — Monorepo, Database, Auth

**Estimated: 3-4 days**
**Goal: Monorepo running, DB connected, register + login + JWT working via GraphQL**

```
TASK 1.1 — Monorepo Scaffold
- Initialize monorepo:
  $ mkdir momentee && cd momentee && npm init -y
  $ mkdir -p packages/shared/src apps/server/src apps/web
- Configure npm workspaces in root package.json:
  "workspaces": ["packages/*", "apps/*"]
- Initialize Next.js frontend:
  $ cd apps/web && npx create-next-app@latest . --typescript --tailwind --app --src-dir
- Initialize Express backend:
  $ cd apps/server && npm init -y
  $ npm install express cors helmet compression morgan dotenv
  $ npm install @apollo/server graphql graphql-tag graphql-subscriptions graphql-ws ws
  $ npm install kysely pg
  $ npm install bcryptjs jsonwebtoken passport passport-google-oauth20
  $ npm install zod sharp @aws-sdk/client-s3 stripe resend web-push
  $ npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken
  $ npm install -D @types/passport @types/passport-google-oauth20 @types/cors @types/ws
  $ npm install -D tsx nodemon                 # dev runner
- Initialize shared package:
  $ cd packages/shared && npm init -y
  $ npm install zod
- Setup TypeScript configs (tsconfig.json) for server, web, shared
- Docker Compose for local dev:
  docker-compose.yml:
    postgres:16 (port 5432, volume for data persistence)
    redis:7 (port 6379, optional for caching/sessions)
    pgadmin (port 5050, optional)
- Root scripts in package.json:
  "dev:server": "npm run dev --workspace=apps/server"
  "dev:web": "npm run dev --workspace=apps/web"
  "dev": "concurrently \"npm:dev:server\" \"npm:dev:web\""
  "db:migrate": "npm run migrate --workspace=apps/server"
  "db:seed": "npm run seed --workspace=apps/server"

TASK 1.2 — Database Setup
- Create Kysely database instance (apps/server/src/config/database.ts)
- Create typed env config with Zod (apps/server/src/config/env.ts)
- Create Kysely Database interface (apps/server/src/db/types.ts)
- Write migrations 001-013 (all tables)
- Create migration runner script:
  apps/server/src/db/migrate.ts
  $ tsx src/db/migrate.ts    (runs all pending migrations)
- Create seed script with realistic test data:
  apps/server/src/db/seed.ts
  - 5 test users
  - 3 test couples with milestones, posts, wishes
- Test: run migrations + seed, verify tables in pgAdmin

TASK 1.3 — Express + Apollo Server Setup
- Create Express app with middleware:
  - cors, helmet, compression, morgan
  - JSON body parser
  - Rate limiting (express-rate-limit)
- Mount Apollo Server v4 as Express middleware:
  - expressMiddleware(apolloServer)
  - GraphQL endpoint: POST /graphql
  - GraphQL Playground enabled in dev
- Setup GraphQL context:
  - Parse JWT from Authorization header
  - Attach db instance
  - Attach current user (if authenticated)
- REST routes (non-GraphQL):
  - GET /health → { status: 'ok', timestamp }
  - POST /webhooks/stripe → Stripe webhook handler
- Server starts on port 4000

TASK 1.4 — Authentication (GraphQL)
- Implement auth service (apps/server/src/services/auth.service.ts):
  - register(email, password, name) → creates user, returns JWT pair
  - login(email, password) → validates, returns JWT pair
  - loginWithGoogle(googleToken) → verify with Google, upsert user
  - refreshToken(token) → issue new JWT pair
  - forgotPassword(email) → send reset email
  - resetPassword(token, newPassword) → update password
- JWT strategy:
  - Access token: 15 min expiry, contains { userId, email, role }
  - Refresh token: 7 days, stored hashed in DB
  - Both tokens returned on login/register
- GraphQL auth resolvers:
  - Mutation: register, login, loginWithGoogle, refreshToken, forgotPassword, resetPassword, logout
  - Query: me (returns current user from JWT)
- Auth directive @auth for protected resolvers
- Test with GraphQL Playground:
  mutation { register(input: { email, password, name }) { accessToken user { id name } } }
  query { me { id email name } }  # with Authorization header

TASK 1.5 — Frontend Auth + Design System
- Install Apollo Client:
  $ cd apps/web && npm install @apollo/client graphql
  $ npm install framer-motion lucide-react react-hook-form @hookform/resolvers zod
- Setup Apollo Client (apps/web/src/lib/apollo-client.ts):
  - HTTP link to http://localhost:4000/graphql
  - Auth link: inject JWT from cookie/localStorage
  - WebSocket link for subscriptions
- Create AuthContext + AuthProvider:
  - Store access/refresh tokens
  - Auto-refresh on 401
  - Login/logout/register functions
- Configure Tailwind theme with Momentee colors + fonts:
  coral: #FF6B6B, orange: #FF8E53, gold: #FFC371,
  teal: #4ECDC4, purple: #A18CD1, dark: #1a1a2e
  Fonts: Outfit, Sora, Caveat (via next/font/google)
- Build design system components (apps/web/src/components/ui/):
  Button, Input, Textarea, Card, Modal, Avatar, Badge, Toast,
  Navbar, Footer, Sidebar, LoadingSpinner, EmptyState
- Auth pages:
  /login — email/password form + Google button
  /register — signup form
  /forgot-password — email input
- Next.js middleware for auth redirects (redirect to /login if no token)
```

**Checkpoint: Full stack running. User registers, logs in, gets JWT. GraphQL Playground works. Auth pages styled.**

---

### PHASE 2: Couple Profile & Public Page

**Estimated: 2-3 days**

```
TASK 2.1 — Couple Service + Resolvers
- couple.service.ts:
  - create(userId, input) → generate slug + invite code, insert couple
  - getBySlug(slug) → with partner1, partner2 joined
  - getById(id)
  - update(id, input) → update fields, re-slug if name changed
  - delete(id)
  - acceptInvite(userId, inviteCode) → set partner2_id
  - incrementViews(slug) → atomic increment view_count
- Kysely query examples:
  db.selectFrom('couples')
    .innerJoin('users as p1', 'p1.id', 'couples.partner1_id')
    .leftJoin('users as p2', 'p2.id', 'couples.partner2_id')
    .where('couples.slug', '=', slug)
    .select([...coupleColumns, ...userColumns])
    .executeTakeFirst()
- GraphQL resolvers for all couple queries/mutations
- Field resolvers for computed fields:
  daysTogether, totalWishes, totalPhotos (use db subqueries)

TASK 2.2 — Onboarding Wizard (Frontend)
- /dashboard/onboarding — 3-step wizard:
  Step 1: Couple name + slug preview
  Step 2: Anniversary date picker
  Step 3: Cover photo upload (crop & preview)
- After creation → redirect to /dashboard

TASK 2.3 — Dashboard Layout + Home
- Dashboard shell: sidebar + main content
- Sidebar: navigation links (Overview, Milestones, Posts, Albums,
  Events, Wishes, Quiz, Gift, Analytics, Settings)
- Dashboard home:
  - Stats cards: Days together, Wishes, Photos, Views (animated counters)
  - Quick actions grid
  - Recent activity feed (last 5 wishes, posts)

TASK 2.4 — Public Couple Page (/[slug])
- Next.js dynamic route with SSR (fetch couple data server-side)
- Dynamic OG tags via generateMetadata()
- Render all sections from couple data
- Increment view count on page load (client-side mutation)
- Share button with copy link + social media links

TASK 2.5 — Settings
- /dashboard/settings — couple profile edit form
- Theme selector (visual presets)
- Slug editor with availability check
- Privacy toggle
- Partner invite link display + resend email
- Delete couple (danger zone with confirmation)
```

**Checkpoint: Couples create page, dashboard works, public page renders with SSR + OG tags.**

---

### PHASE 3–7: Feature Phases (same scope as before, now using GraphQL)

Each phase follows the same pattern:

1. **Service layer** — write Kysely queries in `services/[feature].service.ts`
2. **GraphQL types** — define in `typeDefs/[feature].graphql.ts`
3. **Resolvers** — implement in `resolvers/[feature].resolver.ts`
4. **Frontend queries** — write in `graphql/queries/[feature].queries.ts`
5. **Frontend mutations** — write in `graphql/mutations/[feature].mutations.ts`
6. **Dashboard UI** — CRUD management pages
7. **Public UI** — beautiful display components

```
PHASE 3: Milestones & Love Story Timeline  (1-2 days)
  → milestone.service.ts + resolver + Timeline component

PHASE 4: Posts, Media Upload & Gallery     (2-3 days)
  → upload.service.ts (S3 presign) + post.service.ts
  → multi-file upload + image processing pipeline
  → Masonry gallery + Polaroid cards + Lightbox

PHASE 5: Wishes, Reactions & Comments      (2 days)
  → wish.service.ts + reaction.service.ts + comment.service.ts
  → GraphQL Subscription for realtime wishes
  → Reaction picker + animated counts
  → Guest wish form (no login required)

PHASE 6: Events, RSVP & Quiz Game         (2 days)
  → event.service.ts + rsvp.service.ts + quiz.service.ts
  → RSVP form with dietary chips
  → Dashboard RSVP tracker with CSV export
  → Interactive quiz game with leaderboard

PHASE 7: Gift Accounts & Love Letters      (1 day)
  → gift.service.ts + love letter post type
  → QR code display + copy-to-clipboard
  → Envelope animation + handwritten letter UI
```

---

### PHASE 8: Notifications

**Estimated: 2 days**

```
TASK 8.1 — In-App Notifications
- notification.service.ts:
  - create(userId, type, title, body, link)
  - getByUser(userId, { unreadOnly, limit, cursor })
  - markAllRead(userId)
  - getUnreadCount(userId)
- GraphQL:
  Query: notifications, unreadNotificationCount
  Mutation: markNotificationsRead
  Subscription: notificationReceived(userId)
- Trigger notifications on: new wish, reaction, comment, RSVP, partner invite
- Frontend: notification bell with badge count, dropdown list

TASK 8.2 — Email Notifications
- email.service.ts using Resend:
  - sendWishNotification(to, coupleName, wishMessage)
  - sendDailyDigest(to, stats)
  - sendRSVPConfirmation(to, eventName, attending)
  - sendPartnerInvite(to, coupleName, inviteLink)
  - sendWelcome(to, name)
- Email templates (HTML with inline CSS)
- User email preferences (stored in users table or separate prefs table)
- Notification settings page: /dashboard/settings/notifications

TASK 8.3 — Web Push
- push.service.ts using web-push:
  - subscribe(userId, subscription)
  - unsubscribe(userId, endpoint)
  - sendPush(userId, title, body, url)
- Service worker (apps/web/public/sw.js)
- Push permission request UI component
- GraphQL mutations: subscribePush, unsubscribePush
```

---

### PHASE 9: Monetization & Stripe

**Estimated: 2-3 days**

```
TASK 9.1 — Pricing Plans (same tiers as before)
  FREE / PREMIUM ($4.99/mo) / PREMIUM PLUS ($9.99/mo)

TASK 9.2 — Stripe Integration
- billing.service.ts:
  - createCheckoutSession(coupleId, plan)
  - createPortalSession(coupleId)
  - handleWebhook(event) → process Stripe events
- REST webhook route (NOT GraphQL — Stripe needs raw body):
  POST /webhooks/stripe → verify signature, process events
- GraphQL mutations:
  createCheckoutSession(plan) → returns Stripe Checkout URL
  createBillingPortal → returns Stripe Portal URL
- Webhook handlers:
  checkout.session.completed → activate plan
  invoice.paid → renew
  invoice.payment_failed → notify + grace period
  customer.subscription.deleted → downgrade

TASK 9.3 — Feature Gating
- Utility: checkPlanLimit(coupleId, feature) in services
- Enforce in resolvers before mutations:
  - Photo count limit (free: 50)
  - Milestone limit (free: 5)
  - Theme access
  - Custom domain (premium_plus only)
- Frontend: upgrade prompt modals when hitting limits

TASK 9.4 — Pricing Page (/pricing)
  3-column comparison, monthly/yearly toggle, FAQ
```

---

### PHASE 10: Explore & Community (2 days)

### PHASE 11: Landing Page & SEO (1-2 days)

### PHASE 12: Admin Panel & DevOps (2 days)

Same scope as original plan, adapted for GraphQL backend.

---

## KEY BACKEND PATTERNS

### Kysely Query Examples

```typescript
// ── Pagination (cursor-based) ──
async function getWishes(coupleId: string, cursor?: string, limit = 20) {
  let query = db
    .selectFrom('wishes')
    .leftJoin('users', 'users.id', 'wishes.user_id')
    .where('wishes.couple_id', '=', coupleId)
    .where('wishes.is_approved', '=', true)
    .orderBy('wishes.created_at', 'desc')
    .limit(limit + 1) // fetch 1 extra to check hasNextPage
    .select([
      'wishes.id',
      'wishes.message',
      'wishes.guest_name',
      'wishes.created_at',
      'users.name as user_name',
      'users.avatar as user_avatar',
    ]);

  if (cursor) {
    query = query.where('wishes.created_at', '<', new Date(cursor));
  }

  const rows = await query.execute();
  const hasNextPage = rows.length > limit;
  const edges = rows.slice(0, limit);

  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor: edges.at(-1)?.created_at?.toISOString() ?? null,
    },
    totalCount: await db
      .selectFrom('wishes')
      .where('couple_id', '=', coupleId)
      .select(db.fn.countAll().as('count'))
      .executeTakeFirstOrThrow()
      .then((r) => Number(r.count)),
  };
}

// ── Transaction ──
async function createPostWithMedia(coupleId: string, input: CreatePostInput) {
  return db.transaction().execute(async (trx) => {
    const post = await trx
      .insertInto('posts')
      .values({
        id: createId(),
        couple_id: coupleId,
        caption: input.caption,
        type: input.type,
        visibility: input.visibility,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    if (input.mediaUrls?.length) {
      await trx
        .insertInto('media')
        .values(
          input.mediaUrls.map((url, i) => ({
            id: createId(),
            post_id: post.id,
            url,
            type: 'image' as const,
            sort_order: i,
          })),
        )
        .execute();
    }

    return post;
  });
}

// ── Aggregation (reaction groups) ──
async function getReactionGroups(postId: string, currentUserId?: string) {
  const groups = await db
    .selectFrom('reactions')
    .where('post_id', '=', postId)
    .groupBy('type')
    .select(['type as emoji', db.fn.countAll().as('count')])
    .execute();

  // Check if current user reacted
  let userReactions: string[] = [];
  if (currentUserId) {
    const rows = await db
      .selectFrom('reactions')
      .where('post_id', '=', postId)
      .where('user_id', '=', currentUserId)
      .select('type')
      .execute();
    userReactions = rows.map((r) => r.type);
  }

  return groups.map((g) => ({
    emoji: g.emoji,
    count: Number(g.count),
    hasReacted: userReactions.includes(g.emoji),
  }));
}
```

### GraphQL Context

```typescript
// apps/server/src/graphql/context.ts
import { Request } from 'express';
import { db } from '../config/database';
import { verifyAccessToken } from '../utils/jwt';

export interface GQLContext {
  db: typeof db;
  user: { id: string; email: string; role: string } | null;
  req: Request;
}

export async function createContext({ req }: { req: Request }): Promise<GQLContext> {
  let user = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      user = verifyAccessToken(token);
    } catch {
      // token expired or invalid — user stays null
    }
  }

  return { db, user, req };
}
```

### Auth Guard in Resolvers

```typescript
// apps/server/src/utils/errors.ts
import { GraphQLError } from 'graphql';

export function requireAuth(ctx: GQLContext) {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.user;
}

export function requireCoupleOwner(ctx: GQLContext, couple: any) {
  const user = requireAuth(ctx);
  if (couple.partner1_id !== user.id && couple.partner2_id !== user.id) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
}
```

---

## ENVIRONMENT VARIABLES

```bash
# apps/server/.env.local

# Database
DATABASE_URL=postgresql://momentee:secret@localhost:5432/momentee

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# S3 / Cloudflare R2
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=momentee-uploads
S3_PUBLIC_URL=https://cdn.momentee.app

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=Momentee <hello@momentee.app>

# Push
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_EMAIL=mailto:hello@momentee.app

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

```bash
# apps/web/.env.local

NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
```

---

## DOCKER SETUP

```yaml
# docker-compose.yml (local development)
services:
  postgres:
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_DB: momentee
      POSTGRES_USER: momentee
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  pgdata:
```

```yaml
# docker-compose.prod.yml
services:
  server:
    build: ./apps/server
    ports: ['4000:4000']
    env_file: ./apps/server/.env.production
    depends_on: [postgres]
    restart: unless-stopped

  web:
    build: ./apps/web
    ports: ['3000:3000']
    env_file: ./apps/web/.env.production
    depends_on: [server]
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    env_file: .env.db
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports: ['80:80', '443:443']
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [server, web]
    restart: unless-stopped

volumes:
  pgdata:
  caddy_data:
```

---

## IMPLEMENTATION INSTRUCTIONS FOR CLAUDE CODE

1. **Work phase by phase.** Complete Phase 1 fully (monorepo + DB + auth) before Phase 2. Each phase ends with working, testable functionality.

2. **Backend first, frontend second.** For each feature: write Kysely migration → service → GraphQL typeDefs → resolver → test in Playground → then build frontend UI.

3. **Always run migrations** after adding new ones: `cd apps/server && npx tsx src/db/migrate.ts`

4. **Test resolvers in GraphQL Playground** (localhost:4000/graphql) before building frontend. Copy working queries into `apps/web/src/graphql/`.

5. **TypeScript strict everywhere.** No `any`. Kysely provides type-safe queries — leverage it. Use `@momentee/shared` for types shared between frontend and backend.

6. **Error handling:** Every resolver wraps in try/catch, returns proper GraphQL errors. Every form validates with Zod (shared schemas).

7. **Cursor-based pagination** for all list queries (posts, wishes, comments, explore). Never use offset pagination.

8. **Service layer pattern:** Resolvers should be thin — call service functions. Services contain all business logic + Kysely queries. This keeps resolvers clean and services testable.

9. **Gen-Z aesthetic:** Bold gradients, 16-28px border-radius, emoji everywhere, Framer Motion scroll reveals, playful micro-interactions. Use Tailwind + the Momentee color palette.

10. **Git commits:** `feat(server): add wish service + resolver`, `feat(web): build wish guestbook UI`, `fix(server): cursor pagination off-by-one`.

---

## PRIORITY ORDER (MVP)

1. **Phase 1** — Monorepo + DB + Auth (must have)
2. **Phase 2** — Couple page + dashboard (must have)
3. **Phase 4** — Photo gallery + upload (must have)
4. **Phase 5** — Wishes + reactions (must have)
5. **Phase 3** — Love story timeline (high value)
6. **Phase 6** — Events + RSVP + Quiz (high value)
7. **Phase 11** — Landing page (needed for launch)
8. **Phase 7** — Gift + letters (nice to have)
9. **Phase 8** — Notifications (nice to have)
10. **Phase 9** — Monetization (when users come)
11. **Phase 10** — Explore/community (growth)
12. **Phase 12** — Admin + DevOps (ongoing)

---

_This document is the single source of truth for building Momentee. Feed it to Claude Code phase by phase. Good luck building the next big thing for couples!_ 💕
