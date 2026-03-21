# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Momentee — "Every couple has a story." A Gen-Z couple-focused social network where couples preserve memories, share love stories, and receive blessings from friends & family. Vietnamese market first.

## Architecture

Monorepo with Yarn v4 workspaces:

- `apps/server` — Express.js + Apollo Server v4 (GraphQL), Kysely (PostgreSQL), JWT auth
- `apps/web` — Next.js 16 (App Router), Apollo Client v4, Tailwind CSS v4
- `packages/shared` — Shared types, Zod validations, constants, utils

## Tech Stack

- **Backend:** Node.js + TypeScript, Express, Apollo Server (GraphQL), Kysely (query builder), PostgreSQL 16, bcryptjs, jsonwebtoken
- **Frontend:** Next.js 16, React 19, Apollo Client 4, Tailwind CSS 4, Framer Motion, React Hook Form + Zod
- **Tooling:** Yarn v4 (Berry, node-modules linker), Rollup (server + shared builds), ESLint 9 (flat config), Prettier, Turborepo
- **Infra:** Docker Compose (Postgres + Redis)

## Commands

```bash
# Start services
docker compose up -d              # Start Postgres + Redis

# Development
yarn dev                          # Start both server (4000) and web (3000)
yarn dev:server                   # Server only
yarn dev:web                      # Frontend only

# Database
yarn db:migrate                   # Run all pending migrations
yarn db:seed                      # Seed test data (5 users, 3 couples, etc.)

# Build
yarn build                        # Build all (shared → server → web via Turborepo)
yarn build:shared                 # Build shared package (Rollup)
yarn build:server                 # Build server (Rollup)
yarn build:web                    # Build frontend (Next.js)

# Lint & Format
yarn lint                         # ESLint (flat config, eslint.config.js)
yarn lint:fix                     # ESLint auto-fix
yarn format                       # Prettier write
yarn format:check                 # Prettier check

# Type check
yarn turbo run typecheck          # All workspaces
```

## Key Patterns

- **Package manager:** Yarn v4 with `nodeLinker: node-modules` (.yarnrc.yml). Use `workspace:*` for internal deps.
- **Build:** Rollup for `@momentee/shared` and `@momentee/server`, Next.js for `@momentee/web`
- **Linting:** ESLint 9 flat config at root (eslint.config.js) with typescript-eslint + react plugins + prettier integration
- **Formatting:** Prettier (.prettierrc) — run `yarn format` before committing
- Server uses ES modules (`"type": "module"`) with `.js` extensions in imports
- Kysely migrations in `apps/server/src/db/migrations/` (001-013)
- GraphQL schema split into typeDefs + resolvers under `apps/server/src/graphql/`
- Frontend auth via localStorage tokens + Apollo Client auth link
- Tailwind v4 uses CSS-based config (`@theme` in globals.css), not tailwind.config.ts
- Apollo Client v4 hooks import from `@apollo/client/react`

## Database

- Connection: `DATABASE_URL=postgresql://momentee:momentee@localhost:5432/momentee`
- 16+ tables: users, couples, milestones, posts, media, albums, wishes, reactions, comments, events, rsvps, quizzes, quiz_questions, quiz_responses, gift_accounts, notifications, push_subscriptions, subscriptions
- IDs use cuid2 (varchar(30))
- Timestamps use `timestamptz`

## GraphQL API

- Endpoint: `POST http://localhost:4000/graphql`
- Health check: `GET http://localhost:4000/health`
- Auth: Bearer token in Authorization header
- Key mutations: register, login, refreshToken, logout
- Key queries: me

## Test Accounts (after seeding)

- test1@momentee.dev through test5@momentee.dev, password: `password123`
