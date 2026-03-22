<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white" alt="GraphQL" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">Momentee</h1>
<p align="center"><strong>"Every couple has a story."</strong></p>
<p align="center">
  A Gen-Z social network where couples preserve memories, share their love stories,<br/>
  and receive blessings from friends & family.
</p>

---

## What is Momentee?

Momentee gives every couple a beautiful, shareable page at `momentee.app/your-slug` — a digital home for your love story. Upload photos, track milestones, collect wishes from loved ones, plan events, and more. Think of it as **Linktree meets wedding website meets Instagram**, designed specifically for couples.

**Target audience:** Gen-Z couples (18–30), Vietnamese market first, international expansion planned.

---

## Features

### For Couples

| Feature | Description |
|---------|-------------|
| **Couple Page** | Beautiful public profile with shareable URL, cover photo, bio, and stats |
| **Photo Gallery** | Upload multiple photos per post, masonry grid display, fullscreen lightbox |
| **Love Timeline** | Visual timeline of relationship milestones (first date, proposal, wedding...) |
| **Posts & Stories** | Share moments with captions, photo/video/story/letter types, visibility controls |
| **Events & RSVP** | Create events, collect guest RSVPs with plus-one and dietary notes |
| **Quiz Game** | "How well do you know us?" quizzes with auto-scoring and leaderboards |
| **Gift Registry** | Display bank accounts for monetary gifts with one-tap copy |
| **Wishes Wall** | Receive heartfelt messages and blessings from friends & family |
| **Notifications** | Real-time bell icon with unread count for new wishes, RSVPs, comments |
| **Settings** | Edit profile, theme, slug, privacy, partner invite code |

### For Visitors (No Login Required)

- Send wishes with emoji to any couple's public page
- RSVP to events with plus-one and dietary preferences
- Take "How well do you know us?" quizzes
- Leave comments and reactions on posts
- Browse and discover couples on the Explore page

### Platform

- **Explore** — Discover public couple pages from the community with search
- **Pricing** — Free / Premium ($4.99/mo) / Premium Plus ($9.99/mo) with feature gating
- **Admin Panel** — Platform stats, user management, couple moderation, role management
- **Plan Limits** — Enforced limits on milestones, posts, albums per plan tier

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion | SSR, modern React, utility-first CSS, smooth animations |
| **GraphQL Client** | Apollo Client 4 | Caching, optimistic UI, typed queries |
| **Forms** | React Hook Form + Zod | Validation, performance |
| **Backend** | Express.js, Apollo Server 4 (GraphQL) | Mature, typed API, single endpoint |
| **Database** | PostgreSQL 16, Kysely (query builder) | Type-safe SQL, relational, full control |
| **Auth** | Custom JWT (access + refresh tokens), bcryptjs | Full control, no vendor lock-in |
| **Media** | Cloudinary (base64 upload from GraphQL) | CDN, transforms, no separate upload step |
| **Shared** | TypeScript, Zod schemas, shared constants | Type safety across frontend & backend |
| **Tooling** | Yarn v4 (Berry), Turborepo, Rollup, ESLint 9, Prettier | Fast builds, consistent formatting |
| **Infra** | Docker Compose (Postgres + Redis) | One-command local dev |

---

## Project Structure

```
momentee/
├── apps/
│   ├── server/                  # Express + Apollo Server (GraphQL API)
│   │   └── src/
│   │       ├── config/          # database, env, cloudinary
│   │       ├── db/              # migrations (001-013), types, seed
│   │       ├── graphql/
│   │       │   ├── typeDefs/    # 15 GraphQL schema modules
│   │       │   └── resolvers/   # 15 resolver modules
│   │       ├── services/        # Business logic (12 services)
│   │       ├── routes/          # REST: health, webhooks, uploads
│   │       └── utils/           # JWT, errors, cloudinary helpers
│   │
│   └── web/                     # Next.js 16 Frontend
│       └── src/
│           ├── app/             # 19 routes (App Router)
│           │   ├── (auth)/      # login, register, forgot-password
│           │   ├── (dashboard)/ # dashboard + 7 feature pages
│           │   ├── [slug]/      # dynamic public couple pages
│           │   ├── admin/       # admin panel
│           │   ├── explore/     # discover couples
│           │   └── pricing/     # pricing plans
│           ├── components/
│           │   ├── ui/          # Button, Input, Card, Modal, Spinner
│           │   ├── layout/      # Navbar, Sidebar, Footer, NotificationBell
│           │   └── couple/      # Gallery, Timeline, PostCard, WishForm, etc.
│           ├── graphql/         # 24 query/mutation files (12 modules)
│           ├── hooks/           # useAuth, useCouple
│           └── lib/             # Apollo Client, Auth Context
│
├── packages/
│   └── shared/                  # Shared types, Zod schemas, constants, utils
│
├── e2e/                         # Playwright end-to-end tests (28 tests)
├── docker-compose.yml           # Local dev: Postgres + Redis
├── turbo.json                   # Turborepo build pipeline
└── PLAN.md                      # Full implementation plan (12 phases)
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Yarn** v4 (Berry) — `corepack enable && corepack prepare yarn@4 --activate`
- **Docker** & Docker Compose
- (Optional) **Cloudinary** account for media uploads

### Quick Start

```bash
# 1. Clone & install dependencies
git clone https://github.com/your-username/momentee.git
cd momentee
yarn install

# 2. Start databases
docker compose up -d

# 3. Configure environment
cp apps/server/.env.example apps/server/.env
# Edit .env with your DATABASE_URL, JWT secrets, etc.

# 4. Run database migrations & seed test data
yarn db:migrate
yarn db:seed

# 5. Start development servers
yarn dev
```

Open your browser:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| GraphQL Playground | http://localhost:4000/graphql |
| Health Check | http://localhost:4000/health |

### Test Accounts (after seeding)

| Email | Password | Notes |
|-------|----------|-------|
| test1@momentee.dev | password123 | Has couple page |
| test2@momentee.dev | password123 | Partner of test1 |
| test3@momentee.dev | password123 | Has couple page |
| test4@momentee.dev | password123 | |
| test5@momentee.dev | password123 | |

---

## Commands Reference

```bash
# ─── Development ─────────────────────────────────────────
yarn dev                    # Start server (4000) + web (3000)
yarn dev:server             # Server only
yarn dev:web                # Frontend only

# ─── Database ────────────────────────────────────────────
yarn db:migrate             # Run all pending migrations
yarn db:seed                # Seed test data (5 users, 3 couples)

# ─── Build ───────────────────────────────────────────────
yarn build                  # Build all (shared → server → web)
yarn build:shared           # Build shared package (Rollup)
yarn build:server           # Build server (Rollup)
yarn build:web              # Build frontend (Next.js)

# ─── Quality ─────────────────────────────────────────────
yarn lint                   # ESLint check
yarn lint:fix               # ESLint auto-fix
yarn format                 # Prettier format all files
yarn format:check           # Prettier check (CI)
yarn turbo run typecheck    # TypeScript check all workspaces

# ─── Testing ─────────────────────────────────────────────
npx playwright test         # Run all 28 e2e tests
npx playwright test --ui    # Interactive test runner
```

---

## Architecture

### Request Flow

```
Browser → Next.js (SSR/CSR) → Apollo Client → HTTP → Express → Apollo Server
                                                                    ↓
                                                               Resolver
                                                                    ↓
                                                               Service
                                                                    ↓
                                                            Kysely → PostgreSQL
```

### GraphQL Modules (15)

| Module | Queries | Mutations | Auth Required |
|--------|---------|-----------|---------------|
| Auth | — | register, login, refreshToken, logout | No |
| User | me | — | Yes |
| Couple | couple, coupleBySlug | createCouple, updateCouple, acceptInvite | Mixed |
| Milestone | milestones, milestone | create, update, delete, reorder | Yes |
| Post | posts, post | createPost, deletePost | Yes |
| Wish | wishes, wish | createWish, deleteWish, approveWish | Mixed |
| Reaction | reactions, reactionGroups, comments | toggleReaction, createComment, deleteComment | Mixed |
| Event | events, event, rsvps | createEvent, updateEvent, deleteEvent, createRsvp | Mixed |
| Quiz | quizzes, quiz, quizLeaderboard | createQuiz, deleteQuiz, submitQuiz | Mixed |
| Gift | giftAccounts | createGiftAccount, updateGiftAccount, deleteGiftAccount | Yes |
| Notification | notifications, unreadCount | markRead, markAllRead, delete | Yes |
| Billing | subscription, checkPlanLimit | createCheckoutSession, createBillingPortal | Yes |
| Explore | exploreCouples, trendingCouples | — | No |
| Admin | adminStats, adminUsers, adminCouples | adminDeleteUser, adminDeleteCouple, adminUpdateRole | Admin |

### Database Schema (16+ tables)

```sql
-- Core
users, couples

-- Content
milestones, posts, media, albums, album_photos

-- Social
wishes, reactions, comments

-- Events
events, rsvps, quizzes, quiz_questions, quiz_responses

-- Commerce
gift_accounts, subscriptions

-- System
notifications, push_subscriptions
```

All IDs use **cuid2** (varchar(30)). Timestamps use **timestamptz**.

---

## Environment Variables

<details>
<summary><strong>Server</strong> (<code>apps/server/.env</code>)</summary>

```bash
# Database
DATABASE_URL=postgresql://momentee:momentee@localhost:5432/momentee

# JWT
JWT_SECRET=your-access-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Media (optional — features work without it, uploads will fail)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Stripe (optional — plan upgrades work in dev mode without it)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

</details>

<details>
<summary><strong>Web</strong> (<code>apps/web/.env.local</code>)</summary>

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

</details>

---

## Deployment

### Docker Compose (Production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

Services: `server` (port 4000), `web` (port 3000), `postgres`, `caddy` (reverse proxy with auto HTTPS)

### Manual

```bash
yarn build

# Start server
cd apps/server && node dist/index.js

# Start web (separate terminal)
cd apps/web && yarn start
```

---

## Implementation Phases

The project was built in 12 incremental phases:

| Phase | Name | Status |
|-------|------|--------|
| 1 | Monorepo, Database, Auth | Done |
| 2 | Couple Profile & Public Page | Done |
| 3 | Milestones & Love Timeline | Done |
| 4 | Posts, Media Upload & Gallery | Done |
| 5 | Wishes, Reactions & Comments | Done |
| 6 | Events, RSVP & Quiz Game | Done |
| 7 | Gift Accounts & Love Letters | Done |
| 8 | Notifications | Done |
| 9 | Monetization & Stripe | Done |
| 10 | Explore & Community | Done |
| 11 | Landing Page & SEO | Done |
| 12 | Admin Panel | Done |

See [`PLAN.md`](./PLAN.md) for the detailed implementation plan.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes and ensure `yarn build` passes
4. Run tests: `npx playwright test`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feat/amazing-feature`
7. Open a Pull Request

---

## License

This project is private and proprietary.

---

<p align="center">
  Built with love for couples everywhere.
</p>
