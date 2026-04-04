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
- [ ] 9. **Forgot password** — needs backend mutation (deferred: requires email service setup)

## Phase 3: Performance & Data Layer
- [x] 10. **Missing DB indexes** — migration 016: media, album_photos, reactions, comments, quiz_questions, quiz_responses, notifications
- [x] 11. **N+1 queries** — couple stats now cached per-parent via `_stats` promise
- [x] 12. **Unbounded list queries** — added default limits to events(50), milestones(100), albums(50)
- [x] 13. **GraphQL depth limiting** — already configured (depthLimit(7))

## Phase 4: SEO & Accessibility
- [x] 14. **Dynamic OG/meta tags** — `generateMetadata()` added to `[slug]/page.tsx` (server component)
- [ ] 15. **Page metadata** — login, register, explore, dashboard pages (lower priority)
- [ ] 16. **Image optimization** — replace raw `<img>` with Next.js `Image` (large diff, deferred)
- [ ] 17. **ARIA labels & alt text** — scattered across components (lower priority)
- [ ] 18. **robots.txt & sitemap** — not yet added

## Phase 5: Quick Wins
- [x] 19. **Notification bell** — reduced poll frequency (60s idle, 15s when open)
- [x] 20. **Toast duration** — error: 6s, info: 3s, success: 4s
- [x] 21. **Explore search debounce** — 300ms debounce + error state added
- [ ] 22. **Missing `updated_at`** — needs migration (deferred)
- [ ] 23. **Zod validation gaps** — date format, JSON structure (deferred)

## Files Modified
### Server
- `services/wish.service.ts` — is_approved: false
- `services/media.service.ts` — visibility filtering + isCoupleMember helper
- `services/couple.service.ts` — getById access control + verifyCoupleAccess helper
- `services/billing.service.ts` — production Stripe guard
- `services/event.service.ts` — pagination
- `services/milestone.service.ts` — pagination
- `services/album.service.ts` — pagination
- `resolvers/post.resolver.ts` — pass userId to posts query
- `resolvers/couple.resolver.ts` — pass userId to coupleById, cached stats
- `resolvers/album.resolver.ts` — verifyCoupleAccess
- `resolvers/milestone.resolver.ts` — verifyCoupleAccess
- `resolvers/event.resolver.ts` — verifyCoupleAccess
- `db/migrations/016_add_missing_indexes.ts` — 7 new indexes

### Web
- `app/page.tsx` — use Navbar component, auth-aware CTAs
- `app/error.tsx` — global error boundary
- `app/(dashboard)/error.tsx` — dashboard error boundary
- `app/(dashboard)/loading.tsx` — dashboard loading state
- `app/(auth)/error.tsx` — auth error boundary
- `app/[slug]/page.tsx` — server component with generateMetadata
- `app/[slug]/wrapper.tsx` — client wrapper (split error vs 404)
- `app/explore/page.tsx` — debounced search, error state
- `app/(dashboard)/dashboard/page.tsx` — consolidated auth guard
- `app/(dashboard)/dashboard/events/page.tsx` — consolidated auth guard
- `app/(dashboard)/dashboard/albums/page.tsx` — consolidated auth guard
- `app/(dashboard)/dashboard/quiz/page.tsx` — consolidated auth guard
- `app/(dashboard)/dashboard/gift/page.tsx` — consolidated auth guard
- `components/layout/notification-bell.tsx` — reduced poll frequency
- `lib/toast-context.tsx` — type-based duration
