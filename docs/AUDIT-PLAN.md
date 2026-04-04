# Momentee Audit & Fix Plan

## Phase 1: Critical Security Fixes
- [x] 1. **Wish auto-approval** — set `is_approved: false` by default
- [x] 2. **Post visibility enforcement** — filter by visibility + user context
- [x] 3. **`coupleById` access control** — check public/membership before returning data
- [x] 4. **Public query authorization** — add `verifyCoupleAccess` to album, milestone, event resolvers
- [x] 5. **Stripe production guard** — throw if `NODE_ENV=production && !STRIPE_SECRET_KEY`

## Phase 2: Frontend Error Handling & UX
- [x] 6. **Error boundaries** — added `error.tsx` to root, (dashboard), (auth); `loading.tsx` to (dashboard)
- [x] 7. **GraphQL error handling** — added error states to explore page, couple page (split error vs 404)
- [x] 8. **Auth guard race conditions** — consolidated dual `useEffect` into single guard in 5 pages
- [x] 9. **Forgot password** — real backend mutation + frontend flow with GraphQL

## Phase 3: Performance & Data Layer
- [x] 10. **Missing DB indexes** — migration 016: media, album_photos, reactions, comments, quiz_questions, quiz_responses, notifications
- [x] 11. **N+1 queries** — couple stats now cached per-parent via `_stats` promise
- [x] 12. **Unbounded list queries** — added default limits to events(50), milestones(100), albums(50)
- [x] 13. **GraphQL depth limiting** — already configured (depthLimit(7))

## Phase 4: SEO & Accessibility
- [x] 14. **Dynamic OG/meta tags** — `generateMetadata()` added to `[slug]/page.tsx` (server component)
- [x] 15. **Page metadata** — login, register, explore pages split into server+client for metadata exports; auth layout has template
- [x] 16. **ARIA labels & alt text** — fixed empty alt on login/register logos, post-card images, media-upload preview, explore search input
- [x] 17. **robots.txt & sitemap** — added `public/robots.txt` and `app/sitemap.ts`

## Phase 5: Data Integrity & Validation
- [x] 18. **Notification bell** — reduced poll frequency (60s idle, 15s when open)
- [x] 19. **Toast duration** — error: 6s, info: 3s, success: 4s
- [x] 20. **Explore search debounce** — 300ms debounce + error state added
- [x] 21. **Missing `updated_at`** — migration 017: milestones, wishes, quiz_responses, gift_accounts, rsvps
- [x] 22. **Zod validation gaps** — date format (YYYY-MM-DD regex), emoji max 4 chars, password reset schemas
- [x] 23. **Password reset DB fields** — migration 017: reset_token + reset_token_expires_at on users

## All 23 items complete
