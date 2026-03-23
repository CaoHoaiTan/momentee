# Momentee - Bug Fix & Security Hardening Plan

**Date:** 2026-03-23
**Status:** Implemented

## Summary of Issues Found & Fixed

### Phase 1: Critical UI Fixes (DONE)

#### 1.1 Quiz Section Missing on Public Page
- **Problem:** Public couple page (`/[slug]`) had no quiz section. `sectionRenderers` and `defaultOrder` didn't include quiz.
- **Fix:**
  - Created `apps/web/src/components/couple/quiz-player.tsx` — guest-facing quiz UI with step-by-step flow (select quiz -> answer questions -> enter name -> see score)
  - Added quiz data fetching, section renderer, and `'quiz'` to `defaultOrder` in `apps/web/src/app/[slug]/client.tsx`
  - Added `GET_QUIZ_FOR_GUEST` query (without `correctAnswer`) in `apps/web/src/graphql/queries/quiz.queries.ts`

#### 1.2 Post Card Layout Broken
- **Problem:** Single-image posts used `aspect-video` (16:9) while multi-image posts used `aspect-square`, causing inconsistent card heights in the grid.
- **Fix:** Changed single image to `aspect-square` in `apps/web/src/components/couple/post-card.tsx`. Also added CSS variable fallbacks for theme-aware colors.

#### 1.3 No "Back to Dashboard" on Public Page
- **Problem:** Logged-in owners viewing their public page had no way to navigate back to dashboard.
- **Fix:** Added floating "Dashboard" button (bottom-left) in `apps/web/src/app/[slug]/client.tsx` that only appears when the logged-in user is one of the couple's partners.

### Phase 2: Auth & Session Fixes (DONE)

#### 2.1 Token Refresh Missing
- **Problem:** Apollo Client had no error link for handling expired tokens. When JWT expired (~15min), users were forced to re-login.
- **Fix:** Added `onError` link in `apps/web/src/lib/apollo-client.ts` that:
  - Catches `UNAUTHENTICATED` errors
  - Uses refresh token via raw `fetch` to get new tokens
  - Retries the failed operation with new token
  - Implements request queue/lock for concurrent failures
  - Falls back to `/login` redirect if refresh fails

#### 2.2 Server-Side Logout Not Working
- **Problem:** `logout` mutation returned `true` without invalidating tokens. Refresh tokens stayed valid forever.
- **Fix:**
  - Added `logout()` function to `apps/server/src/services/auth.service.ts` that sets `refresh_token = null` in DB
  - Updated resolver in `apps/server/src/graphql/resolvers/auth.resolver.ts` to call it
  - Added `LOGOUT_MUTATION` to `apps/web/src/graphql/mutations/auth.mutations.ts`
  - Updated client `auth-context.tsx` to call server logout mutation before clearing localStorage

### Phase 3: Security Hardening (DONE)

#### 3.1 Quiz Answers Exposed to Guests
- **Problem:** `QuizQuestion.correctAnswer` was returned to everyone, letting guests cheat.
- **Fix:**
  - Made `correctAnswer` nullable in GraphQL schema (`apps/server/src/graphql/typeDefs/quiz.graphql.ts`)
  - Added context-aware resolver that returns `null` for non-owners (`apps/server/src/graphql/resolvers/quiz.resolver.ts`)

#### 3.2 Rate Limiting on Public Endpoints
- **Problem:** No per-operation rate limiting on wish creation, quiz submissions, or uploads.
- **Fix:**
  - Created `apps/server/src/utils/rate-limiter.ts` — in-memory per-key rate limiter
  - Applied to `createWish` (10/hour per IP) and `submitQuiz` (5/hour per IP per quiz)
  - Added express-rate-limit to upload routes (30/15min per IP)

#### 3.3 CSS Injection Sanitization
- **Problem:** `dangerouslySetInnerHTML` with weak regex that could be bypassed via CSS escapes.
- **Fix:** Created `apps/web/src/lib/css-sanitizer.ts` with comprehensive blocking (HTML tags, CSS escape decode, @import, @charset, url(), expression(), javascript:, -moz-binding, behavior:)

#### 3.4 Weak Password Validation
- **Problem:** Passwords only required minimum 8 characters.
- **Fix:** Updated `packages/shared/src/validations/index.ts` to require: min 8 chars, max 128, uppercase, lowercase, number.

#### 3.5 GraphQL Query Depth Limiting
- **Problem:** No depth limiting — deeply nested queries could cause DoS.
- **Fix:** Added `graphql-depth-limit` package with `depthLimit(7)` validation rule to Apollo Server in `apps/server/src/index.ts`.

#### 3.6 GraphQL Body Size Limit
- **Problem:** GraphQL endpoint accepted 50MB JSON bodies (excessive).
- **Fix:** Reduced to 2MB in `apps/server/src/index.ts`. File uploads use separate 10MB limit.

---

## Files Modified

### New Files
- `apps/web/src/components/couple/quiz-player.tsx`
- `apps/web/src/lib/css-sanitizer.ts`
- `apps/server/src/utils/rate-limiter.ts`

### Modified Files
- `apps/web/src/app/[slug]/client.tsx`
- `apps/web/src/components/couple/post-card.tsx`
- `apps/web/src/lib/apollo-client.ts`
- `apps/web/src/lib/auth-context.tsx`
- `apps/web/src/graphql/queries/quiz.queries.ts`
- `apps/web/src/graphql/mutations/auth.mutations.ts`
- `apps/server/src/index.ts`
- `apps/server/src/graphql/typeDefs/quiz.graphql.ts`
- `apps/server/src/graphql/resolvers/quiz.resolver.ts`
- `apps/server/src/graphql/resolvers/auth.resolver.ts`
- `apps/server/src/graphql/resolvers/wish.resolver.ts`
- `apps/server/src/services/auth.service.ts`
- `apps/server/src/routes/upload.route.ts`
- `packages/shared/src/validations/index.ts`

---

## Verification Checklist

- [ ] Visit public page → quiz section renders for active quizzes
- [ ] Play quiz as guest → score shown, leaderboard updated
- [ ] Dashboard posts page → consistent card heights for mixed media
- [ ] Login → visit own public page → floating "Dashboard" button visible
- [ ] Incognito → no Dashboard button
- [ ] Shorten JWT expiry → verify auto-refresh works
- [ ] Logout → refresh token invalidated in DB
- [ ] Query quiz as guest → `correctAnswer` is `null`
- [ ] Spam wishes → rate limited after 10
- [ ] Malicious CSS → blocked by sanitizer
- [ ] Deeply nested GraphQL query → rejected by depth limit
