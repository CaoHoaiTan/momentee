# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Momentee — "Every couple has a story." A Gen-Z couple-focused social network where couples preserve memories, share love stories, and receive blessings from friends & family. Vietnamese market first.

## Architecture

Monorepo with Yarn v4 workspaces:

- `apps/server` — Express.js + Apollo Server v5 (GraphQL), Kysely (PostgreSQL), JWT auth
- `apps/web` — Next.js 16 (App Router), Apollo Client v4, Tailwind CSS v4
- `packages/shared` — Shared types, Zod validations, constants, utils

## Commands

```bash
# Start services
docker compose up -d              # Start Postgres + Redis (dev)

# Development
yarn dev                          # Start both server (4000) and web (3000)
yarn dev:server                   # Server only
yarn dev:web                      # Frontend only

# Database
yarn db:migrate                   # Run all pending migrations
yarn db:seed                      # Seed test data (5 users, 3 couples, etc.)

# Build (Turborepo: shared → server + web in parallel)
yarn build                        # Build all workspaces
yarn build:shared                 # Build shared package (Rollup)
yarn build:server                 # Build server (Rollup → dist/)
yarn build:web                    # Build frontend (Next.js → .next/)

# Lint & Format
yarn lint                         # ESLint 9 flat config
yarn lint:fix                     # ESLint auto-fix
yarn format                       # Prettier write
yarn format:check                 # Prettier check

# Type check
yarn turbo run typecheck          # All workspaces (requires shared to be built first)

# E2E tests (Playwright, requires dev servers running)
npx playwright test               # Run all e2e tests (chromium)
npx playwright test --ui          # Interactive UI mode

# Docker — local builds
yarn docker:build:server          # Build server image (momentee-server:local)
yarn docker:build:web             # Build web image (momentee-web:local)
yarn docker:build                 # Build both

# Docker — production stack
yarn docker:prod:up               # Start full stack (postgres+redis+server+web+nginx)
yarn docker:prod:down             # Stop full stack
yarn docker:prod:logs             # Tail logs
```

## Server Architecture (`apps/server/src/`)

**Request flow:** Express middleware → Apollo Server → Resolver → Service → Kysely (DB)

**GraphQL module pattern:** Each feature has three files that must be kept in sync:
- `typeDefs/{entity}.graphql.ts` — Schema definitions (gql tagged templates)
- `resolvers/{entity}.resolver.ts` — Thin layer: validates input with Zod, calls service
- `services/{entity}.service.ts` — Business logic, direct Kysely queries (no repository layer)

All modules are registered in `typeDefs/index.ts` and `resolvers/index.ts`.

**Auth flow:**
- Every GraphQL request: context extracts Bearer token → verifies JWT → sets `context.user = { userId }` or null
- `requireAuth(context)` helper in resolvers to enforce authentication
- Access tokens (15m) + Refresh tokens (7d, hashed in DB), separate secrets
- Custom errors in `utils/errors.ts`: `AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ValidationError` — all extend `GraphQLError` with `extensions.code`

**Env validation:** Zod schema in `config/env.ts` validates all required env vars at startup (JWT secret min 32 chars).

## Web Architecture (`apps/web/src/`)

**Route groups (Next.js App Router):**
- `(auth)/` — Login, register, forgot-password (unauthenticated)
- `(dashboard)/` — Protected pages: dashboard, milestones, posts, events, wishes, albums, quiz, gift, settings, onboarding
- `[slug]/` — Dynamic public couple pages
- `admin/` — Admin panel
- `explore/` — Discover couples

**Provider hierarchy** (root `layout.tsx`): `ApolloProvider` → `AuthProvider` → children

**Apollo Client setup** (`lib/apollo-client.ts`):
- AuthLink injects token from localStorage (`momentee_access_token`)
- ErrorLink intercepts 401, auto-refreshes token, queues concurrent requests during refresh
- GraphQL operations in `graphql/queries/` and `graphql/mutations/` as exported `gql` constants

**Auth context** (`lib/auth-context.tsx`): `useAuth()` hook provides `user`, `loading`, `isAuthenticated`, `login()`, `register()`, `logout()`. Syncs with `ME_QUERY` on token load.

**Standalone output:** `next.config.ts` uses `output: 'standalone'` with `outputFileTracingRoot` pointing to the monorepo root. This produces `.next/standalone/apps/web/server.js` — required for Docker; has no effect on `yarn dev`.

## Shared Package (`packages/shared/src/`)

Exports types, enums (`UserRole`, `PlanType`, `Visibility`, etc.), Zod validation schemas (used by both server resolvers and web forms), `PLAN_LIMITS` constants for feature gating, and utility functions (`slugify`, `sanitizeCss`, etc.). Built with Rollup (ESM, preserveModules). **Must be built before typechecking server or web.**

## Key Patterns

- **Package manager:** Yarn v4 with `nodeLinker: node-modules` (.yarnrc.yml). Use `workspace:*` for internal deps.
- **Server ES modules:** Uses `.js` extensions in all imports (`import { foo } from './bar.js'`)
- **Tailwind v4:** CSS-based config (`@theme` in `globals.css`), not `tailwind.config.ts`
- **Apollo Client hooks:** Import from `@apollo/client/react`, not `@apollo/client`
- **Input validation:** Zod `.parse()` in resolvers before calling services; same schemas reused in React Hook Form on the frontend
- **IDs:** cuid2 (varchar(30)), timestamps use `timestamptz`
- **Plan limits:** Enforced in services, constants defined in shared `PLAN_LIMITS`
- **Rate limiting:** Two levels — GraphQL endpoint + upload endpoint

## Adding a New Feature (checklist)

1. **Schema:** Add types/inputs/queries/mutations in `typeDefs/{entity}.graphql.ts`
2. **Validation:** Add Zod schemas in `packages/shared/src/validations/`
3. **Service:** Add business logic in `services/{entity}.service.ts` (use Kysely directly)
4. **Resolver:** Wire up in `resolvers/{entity}.resolver.ts` (validate → call service)
5. **Register:** Add to `typeDefs/index.ts` and `resolvers/index.ts`
6. **Migration:** If new tables needed, add in `db/migrations/` (follow existing naming: `NNN_description.ts`)
7. **Frontend:** Add `gql` operations in `graphql/{queries,mutations}/`, create route in `app/`

## Database

- Connection: `DATABASE_URL=postgresql://momentee:momentee@localhost:5432/momentee`
- Kysely Database type in `db/types.ts` — update when adding tables/columns
- Migrations in `db/migrations/` (001–019), seed in `db/seed.ts`

## CI/CD

- **CI** (`.github/workflows/ci.yml`): lint → typecheck → build, runs on every push/PR. Yarn cache keyed on `yarn.lock`.
- **CD** (`.github/workflows/cd.yml`): triggers on `main` push. Builds Docker images → pushes to GHCR → deploys to VPS via SSH.
- **Required GitHub Secrets:** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- **Required GitHub Variables:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Production stack uses `docker-compose.prod.yml`; server+web+postgres+redis all on internal Docker network, only nginx exposes ports 80/443.

## Test Accounts (after seeding)

- test1@momentee.dev through test5@momentee.dev, password: `Password123`
