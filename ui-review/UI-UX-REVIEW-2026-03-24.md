# Momentee UI/UX Review — 2026-03-24

Interactive Playwright-based review of all pages at desktop (1280x800) and mobile (375x812) viewports.

---

## Issue Summary

| # | Page | Viewport | Category | Severity | Description |
|---|------|----------|----------|----------|-------------|
| 1 | Dashboard (all) | Desktop | Interactivity | **Critical** | Sidebar overlay (`Close sidebar` button with `fixed inset-0 z-30`) blocks ALL clicks on main content. The `md:hidden` class does not take effect at 1280px — computed display is `block` with `pointer-events: auto`. Users must click the overlay to dismiss it before interacting with any content. |
| 2 | Dashboard (all) | Mobile | Layout | **Critical** | Sidebar renders open by default on mobile, covering the main content area with a semi-transparent overlay. Content is inaccessible until sidebar is dismissed. |
| 3 | All dashboard pages | Both | Interactivity | **Major** | ScrollReveal animations render content at near-zero opacity by default. On full-page screenshots, headings, stats, and text are barely visible/illegible until scrolling triggers the reveal. This also means content is invisible for users who don't scroll (e.g., accordion sections). |
| 4 | `/admin` | Both | Navigation | **Major** | Admin page always redirects to `/dashboard` even for admin users. **Root cause**: GraphQL returns role as `ADMIN` (uppercase enum) but `admin/page.tsx:50` checks `user?.role !== 'admin'` (lowercase). Case mismatch. |
| 5 | `/about`, `/privacy` | Both | Navigation | **Major** | Footer links to `/about` and `/privacy` lead to infinite loading spinners — no content, no 404 page. Routes don't exist but the catch-all couple slug handler picks them up and shows a loading state forever. |
| 6 | Landing `/` | Mobile | Navigation | **Major** | No hamburger menu on mobile — Explore, Pricing, and Login nav links are completely hidden. Only the "Get Started Free" button is accessible. Users cannot navigate to Explore or Pricing from the mobile navbar. |
| 7 | `/hao-trang` | Both | Interactivity | **Major** | Couple page theme not applied. Hao & Trang is seeded with `teal` theme but renders with the same coral/sunset gradient as minh-linh. Theme selection has no visual effect on the public page. |
| 8 | Dashboard quiz page | Both | Navigation | **Minor** | Brief flash of unauthenticated navbar (Login/Get Started buttons) before auth state loads. FOUC for auth state — the navbar renders public state for ~2-3 seconds before switching to authenticated state. |
| 9 | Landing `/` | Mobile | Layout | **Minor** | Trust badges below hero CTAs are truncated — only "100% Free to start" is visible; "Setup in 60 seconds" and "Private & secure" are hidden/clipped. |
| 10 | `/minh-linh` | Both | Content | **Minor** | Stats discrepancy: "Days Together" stat card shows `769` while the hero countdown timer shows `770` days. Off-by-one between the two calculations. |
| 11 | `/minh-linh` | Both | Content | **Minor** | "Our Gallery" section heading displays even when gallery is empty — shows just the heading with no content or empty-state message below it. |
| 12 | `/pricing` | Both | Interactivity | **Minor** | FAQ section is not collapsible/accordion — all 4 questions are expanded by default. Not a bug, but less interactive than planned. |
| 13 | Settings | Both | Interactivity | **Minor** | Custom CSS editor is visible and editable for free-plan users. The "Premium" badge is displayed but the editor is not disabled or hidden. Plan doc says it should be hidden on free plan. |
| 14 | Footer (dashboard) | Both | Navigation | **Minor** | Footer contains links to `/about`, `/privacy`, and `/terms` — all three routes produce infinite loading spinners (same as #5). Also, Twitter and Instagram links point to `#` (placeholder). |
| 15 | All pages | Both | Accessibility | **Minor** | `scroll-behavior: smooth` on `<html>` causes Next.js warning. Should add `data-scroll-behavior="smooth"` attribute per Next.js docs. |
| 16 | Register | Both | Interactivity | **Minor** | Confirm Password field has no validation error on empty submit — only Name, Email, and Password show errors. Confirm Password only validates when Password is filled (mismatch check). |
| 17 | Explore | Both | Content | **Minor** | DB has leftover test data (Music Player Couple, Public MS Test, No Music Couple) cluttering the explore page alongside seeded couples. Not a UI bug, but affects perceived quality. |

---

## Phase-by-Phase Notes

### Phase 1: Public Pages

#### Landing `/` (Desktop + Mobile)
- **Desktop**: Clean layout — navbar (logo, Explore, Pricing, Login, Get Started Free), hero with gradient text + CTAs, "How it works" 3-step section, 6 feature cards, CTA section, footer.
- **Mobile**: Hero and features stack properly. No hamburger menu (#6). Trust badges truncated (#9).
- **CTA links**: "Start Your Story" and "Create Your Page" correctly link to `/register`. "Explore Love Stories" links to `/explore`. "View Pricing" links to `/pricing`.
- **Footer**: Links to Explore/Pricing work. About/Privacy/Terms produce infinite spinners (#5).

#### Explore `/explore`
- Search filtering works — typing "minh" correctly filters to "Minh & Linh" couple.
- Couple cards: 3-column grid on desktop, show name, view count, creator name. Gradient placeholder for cover images.
- Card click correctly navigates to `/[slug]`.
- No pagination — all couples loaded at once (may be an issue at scale).

#### Public Couple Page `/minh-linh`
- **Hero**: Beautiful coral gradient, monogram circles (M & L), live countdown timer with days:hrs:min:sec. Floating heart emoji decorations.
- **Share**: QR code + Download QR button, Share (WhatsApp, Facebook, X, Copy link) — all functional.
- **Stats**: 4-card grid (Days Together, Wishes, Photos, Views). Days count off-by-one vs hero timer (#10).
- **Anniversary**: Clean card with date.
- **Timeline**: 3 milestones (First Date, First Kiss, Anniversary) with alternating layout, colored icon badges, dates and descriptions.
- **Gallery**: Empty section shows heading but no empty-state message (#11).
- **Wishes**: Send Wish form (name, message, emoji picker, anonymous toggle, Send button) works correctly. Submitted wish appears immediately at top of list. Existing wishes show emoji, message, author, relative time.
- **Mobile**: All sections stack well. QR + share slightly cramped but functional. Stats grid 2x2. Timeline single-column.

#### `/hao-trang` (teal theme)
- Renders with coral theme instead of teal (#7). Otherwise structurally identical to minh-linh.
- No milestones, no gallery, no wishes — empty sections properly hidden (except Gallery on minh-linh).

#### `/nonexistent-couple`
- Clean 404 page: broken heart emoji, "Page Not Found", "This couple page doesn't exist or has been made private.", "Go home" link.

#### Pricing `/pricing`
- 3-tier cards (Free $0, Premium $4.99/mo, Premium Plus $9.99/mo). Premium highlighted with gradient + "Most Popular" badge.
- Feature lists with checkmarks. CTAs all link to `/register`.
- FAQ section: 4 questions, all expanded (not collapsible accordion) (#12).

### Phase 2: Auth Flow

#### Login `/login`
- Centered card on gradient background. Logo, form (Email, Password), Forgot password link, Sign In button, Register link.
- **Empty form validation**: "Please enter a valid email" + "Password must be at least 6 characters" — works.
- **Wrong credentials**: Error toast "Invalid email or password" with close button — works.
- **Successful login**: Redirects to `/dashboard` — works.

#### Register `/register`
- Same gradient background. Name, Email, Password, Confirm Password fields.
- **Empty validation**: Name/Email/Password show errors, but Confirm Password does not (#16).
- **Password mismatch**: "Passwords do not match" — works.

#### Forgot Password `/forgot-password`
- Email form, submit shows success state: "Check your email for a password reset link." + "Back to login" link. Placeholder implementation confirmed.

### Phase 3: Onboarding
- Skipped (requires fresh user registration).

### Phase 4: Dashboard

#### Main `/dashboard`
- Sidebar: 9 nav items (Overview, Milestones, Posts, Albums, Events, Wishes, Quiz, Gift, Settings) with icons. Active state highlighted in coral.
- Welcome banner: "Welcome back, Minh" + "Managing Minh & Linh" + "View Public Page" button.
- Stats: 4 cards (Days Together: 769, Total Wishes: 3, Total Photos: 0, Page Views: 2).
- Quick Actions: 6 cards linking to sub-pages.
- **Critical**: Sidebar overlay blocks content (#1). ScrollReveal makes content faint (#3).
- **Mobile**: Sidebar open by default, covers content (#2). Hamburger menu present in navbar. Toggle sidebar FAB visible.

#### Milestones `/dashboard/milestones`
- Timeline view matching public page. Each milestone has Edit/Delete buttons.
- "Add Milestone" button opens modal with Title, Date, Description, Icon (emoji) fields + Cancel/Add buttons.

#### Posts `/dashboard/posts`
- 2 seeded posts shown as cards with content preview, type badge (Photo/Letter), visibility icon, relative time.
- "Create Post" button present. Each post has a menu button (trash icon for delete).

#### Wishes `/dashboard/wishes`
- 3 wishes displayed (including the one submitted during testing). Each has a delete button.
- Read-only — no "Create" button (as expected).
- Successfully shows the Playwright test wish ("Testing the wish form from Playwright review! — Anonymous — just now").

#### Events `/dashboard/events`
- Empty state: calendar emoji, "No events yet", "Create your first event to start collecting RSVPs", Create Event button.

#### Albums `/dashboard/albums`
- Empty state: camera emoji, "No albums yet", "Create your first album to start organizing photos", Create Album button.

#### Quiz `/dashboard/quiz`
- Empty state: puzzle emoji, "No quizzes yet", "Create a quiz to test how well your friends know you", Create Quiz button.
- Auth flash: briefly shows unauthenticated navbar before loading (#8).

#### Gift `/dashboard/gift`
- Empty state: gift emoji, "No gift accounts yet", "Add your bank accounts so friends can send gifts", Add Account button.

#### Settings `/dashboard/settings`
- **Profile**: Display Name, Page URL (read-only), Bio (0/500 counter), Anniversary, Wedding Date.
- **Appearance**: 12 theme options with visual previews (Sunset Coral active). Grid of theme cards.
- **Page Layout**: Section reorder with drag handles + up/down arrows. Hero fixed at top. Section Styles: Hero Layout (3 options), Timeline Layout (3), Gallery Style (3), Wishes Display (2).
- **Background Music**: Locked with "Upgrade to Premium to unlock" CTA.
- **Custom CSS**: Editor visible and editable despite free plan (#13). 0/5000 counter, no @import rule.
- **Privacy**: Public Page toggle (checked).
- **Save Settings** button.
- **Danger Zone**: "Delete Couple Page" destructive button in red.

### Phase 5: Admin
- Admin page unreachable due to role case mismatch (#4). GraphQL returns `ADMIN`, frontend checks `admin`.

### Phase 6: Cross-Cutting

#### Auth Redirect
- Clearing localStorage and navigating to `/dashboard` correctly redirects to `/login`.

#### Console Errors
- No JavaScript errors on any page. Only warnings:
  - `scroll-behavior: smooth` on `<html>` (Next.js recommendation)
  - `Please ensure that the container has a non-zero size` (Spotify embed container)

---

## What Works Well
- Overall visual design is cohesive and attractive — coral/pink gradients, rounded cards, emoji accents
- Landing page hero section is visually appealing with gradient text and floating hearts
- Couple page countdown timer is engaging and real-time
- Wish form interaction is smooth — emoji picker, anonymous toggle, instant feedback
- Empty states are consistent across all dashboard sub-pages (icon + message + CTA)
- 404 page (couple not found) is well-designed with appropriate tone
- Login/Register forms have proper client-side validation
- Settings page is comprehensive with theme previews and section layout customization
- Timeline component with alternating layout and icon badges looks great

## Priority Fixes
1. **Critical**: Fix sidebar overlay `md:hidden` not applying at desktop viewport (blocks ALL interaction)
2. **Critical**: Fix sidebar default state on mobile (should start collapsed)
3. **Major**: Fix admin role case mismatch (`ADMIN` vs `admin`)
4. **Major**: Create `/about`, `/privacy`, `/terms` pages or remove footer links
5. **Major**: Add hamburger menu for mobile landing page navigation
6. **Major**: Implement theme application on public couple pages
7. **Major**: Fix ScrollReveal — content should be visible by default, animate only on scroll

---

*Report generated via Playwright MCP browser automation*
*Screenshots saved to: `ui-review/screenshots/`*
