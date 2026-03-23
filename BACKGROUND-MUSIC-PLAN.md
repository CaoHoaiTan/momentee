# Background Music Feature — Implementation Plan

## Context

Couples want to add background music to their public pages to create a more emotional experience for visitors. The music selection UX should be similar to Facebook Stories — browse a library, preview tracks, and select a specific clip. This feature extends the existing customization system (theme, layout) to support audio.

**This feature requires PREMIUM or PREMIUM_PLUS plan.**

### Tier Gating
| Tier | Access |
|------|--------|
| FREE | No background music (shows upgrade prompt) |
| PREMIUM | 1 track |
| PREMIUM_PLUS | Up to 3 tracks (playlist) |

---

## Approach: Jamendo API + Clip Selection

### Music Source — Jamendo API
- 500K+ royalty-free tracks, searchable by mood/genre/artist
- Streaming URLs available via the `audio` field in API responses
- Free tier for development, commercial licensing when monetizing
- Primary endpoint: `GET https://api.jamendo.com/v3.0/tracks/?client_id={ID}&search={query}&tags={mood}`

### UX Flow (Facebook Stories-style)
1. User goes to Settings > Music > opens **Music Picker** modal
2. Browse by categories (Romantic, Happy, Chill, Emotional, Cinematic...)
3. Search by track name or artist
4. Preview tracks directly in the browser
5. Select a track > **Clip Selector** (waveform) appears > drag to select 15-60s clip
6. Save > music plays as background on the public page

---

## Security Considerations

Security is the **top priority** for this feature. Key concerns and mitigations:

### 1. API Key Protection
- Jamendo `client_id` is **never exposed to the frontend**
- All Jamendo API calls go through our backend proxy (`/api/music/search`)
- `JAMENDO_CLIENT_ID` stored only in server `.env`, validated at startup

### 2. Input Validation & Sanitization
- `backgroundMusic` field validated via Zod schema (max 5000 chars)
- All track data (title, artist, URLs) sanitized before storage
- `clipStart`/`clipEnd` validated as positive numbers within track duration
- `volume` constrained to 0-100 range

### 3. URL Validation
- Only allow `audioUrl` from trusted Jamendo domains (`*.jamendo.com`)
- Reject arbitrary URLs to prevent SSRF or malicious audio injection
- Validate `albumArt` URLs similarly (Jamendo CDN only)
- Frontend `<audio>` element only loads URLs matching allowed patterns

### 4. XSS Prevention
- Track `title` and `artist` strings are escaped before rendering
- No `dangerouslySetInnerHTML` usage in music components
- Album art loaded via `<img>` with validated `src` only

### 5. Rate Limiting
- `/api/music/search` endpoint rate-limited (e.g., 30 requests/minute per user)
- Prevents abuse of Jamendo API quota through our proxy

### 6. Data Integrity
- `backgroundMusic` JSONB is parsed with try/catch, defaults to null on invalid data
- Frontend `parseMusicConfig()` returns safe defaults on parse failure
- No execution of any data from the JSONB field — purely declarative config

---

## Implementation Steps

### Phase 1: Backend Foundation

**1.1. Database migration** — Create `apps/server/src/db/migrations/015_add_background_music.ts`
```sql
ALTER TABLE couples ADD COLUMN background_music jsonb DEFAULT NULL;
```

**1.2. Update DB types** — `apps/server/src/db/types.ts`
```typescript
// Add to CouplesTable (after layout_config, line 41)
background_music: Record<string, unknown> | null;
```

**1.3. Plan limits** — `packages/shared/src/constants.ts`
- Add `music_tracks` to `PLAN_LIMITS`: free=0, premium=1, premium_plus=3

**1.4. Validation** — `packages/shared/src/validations/index.ts`
- Add `backgroundMusic: z.string().max(5000).optional()` to `updateCoupleSchema`

**1.5. GraphQL schema** — `apps/server/src/graphql/typeDefs/couple.graphql.ts`
- Add `backgroundMusic: String` to `Couple` type (after `layoutConfig`)
- Add `backgroundMusic: String` to `UpdateCoupleInput`

**1.6. Resolver** — `apps/server/src/graphql/resolvers/couple.resolver.ts`
- Add field resolver: `backgroundMusic` → `JSON.stringify(parent.background_music)`

**1.7. Service** — `apps/server/src/services/couple.service.ts`
- Add `backgroundMusic` to `UpdateCoupleInput` interface
- In `update()`: parse JSON, validate structure, store in `background_music`
- **Enforce plan limits**: check `PLAN_LIMITS[couple.plan].music_tracks` against track count, throw `ForbiddenError` if exceeded
- Validate all URLs match `*.jamendo.com` domain pattern
- Validate `clipStart` < `clipEnd`, both within `duration`

**1.8. Jamendo proxy route** — Create `apps/server/src/routes/music.route.ts`
- `GET /api/music/search?q={query}&tags={mood}&limit=20` — proxy to Jamendo API (hides client_id)
- `GET /api/music/categories` — return predefined mood/genre category list
- Auth middleware (only logged-in users can search)
- Rate limiting: 30 requests/minute per user
- Response sanitization: only forward safe fields (id, name, artist_name, audio, image, duration)

**1.9. Environment config**
- `apps/server/.env` — add `JAMENDO_CLIENT_ID`
- `apps/server/src/config/env.ts` — add `JAMENDO_CLIENT_ID` to env schema
- `apps/server/src/index.ts` — mount music route

### Phase 2: Shared Types & Config

**2.1. Music config types** — Create `apps/web/src/lib/music-config.ts`
```typescript
interface BackgroundMusicConfig {
  enabled: boolean;
  tracks: MusicTrack[];
  volume: number;        // 0-100, default 30
  loop: boolean;         // default true
}

interface MusicTrack {
  id: string;            // cuid2
  jamendoId: string;     // Jamendo track ID
  title: string;         // sanitized
  artist: string;        // sanitized
  albumArt: string;      // Jamendo CDN URL (validated)
  audioUrl: string;      // Jamendo streaming URL (validated)
  duration: number;      // Full track duration (seconds)
  clipStart: number;     // Clip start time (seconds)
  clipEnd: number;       // Clip end time (seconds)
  sortOrder: number;
}
```
- `parseMusicConfig()` / `serializeMusicConfig()` — follow `layout-config.ts` pattern
- `isValidJamendoUrl(url: string): boolean` — URL validation helper

**2.2. Update GraphQL queries/mutations** — add `backgroundMusic` field
- `apps/web/src/graphql/queries/couple.queries.ts`
- `apps/web/src/graphql/mutations/couple.mutations.ts`

### Phase 3: Music Picker UI (Dashboard)

**3.1. Music Picker Modal** — Create `apps/web/src/components/settings/music-picker.tsx`
- Full-screen modal (mobile-friendly)
- **Category tabs**: Romantic, Happy, Chill, Emotional, Cinematic, Acoustic, Lo-fi
- **Search bar** with debounced input → calls `/api/music/search`
- **Track list**: album art thumbnail, title, artist, duration, play preview button
- Preview: click play → play 30s preview via `<audio>` element
- Select: click track → transition to Clip Selector

**3.2. Clip Selector** — Create `apps/web/src/components/settings/clip-selector.tsx`
- **Waveform visualization** (canvas or SVG bars)
- Draggable range selector (2 handles) to select a 15-60s clip
- Playback preview of the selected clip
- Timestamp display: `0:45 - 1:15` (30s)
- "Confirm" button → save track with clipStart/clipEnd

**3.3. Music Settings Section** — Create `apps/web/src/components/settings/music-settings.tsx`
- Card section in the settings page
- Toggle enable/disable
- Selected track(s) list: album art, title, artist, clip range, remove/change buttons
- Volume default slider
- Loop toggle
- "Choose Music" button → opens Music Picker Modal
- **Plan gate**: FREE users see upgrade prompt instead of music controls; PREMIUM users limited to 1 track

**3.4. Integrate into Settings page** — `apps/web/src/app/(dashboard)/dashboard/settings/page.tsx`
- Import and render `<MusicSettings>` between "Page Layout" and "Custom CSS"

### Phase 4: Music Player (Public Page)

**4.1. Background Music Hook** — Create `apps/web/src/hooks/useBackgroundMusic.ts`
- Manage `<audio>` element lifecycle
- Play only the clip portion (set `currentTime = clipStart`, pause at `clipEnd`)
- Loop: when clip ends → restart from clipStart (or next track if playlist)
- Volume control, mute/unmute
- Persist mute/volume to localStorage (`music-pref-{slug}`)
- Handle autoplay restriction:
  - Try `audio.play()` → if rejected → set `needsInteraction = true`
  - Return: `{ isPlaying, toggle, volume, setVolume, isMuted, toggleMute, currentTrack, next, prev, needsInteraction }`

**4.2. Music Player Component** — Create `apps/web/src/components/couple/music-player.tsx`
- **Position**: Fixed bottom-left (avoid MobileFab conflict at bottom-right)
- **When `needsInteraction`**: small round button with music icon + "Tap to play music" text with pulse animation
- **When playing (collapsed)**: small round button with album art, spinning animation
- **Expanded** (click to expand): track name + artist, play/pause, volume slider, next/prev
- Framer Motion for expand/collapse animations
- Styled with theme CSS variables (`--theme-primary`, `--theme-surface`)
- Volume fade-in from 0 → configured level over 1.5s

**4.3. Integrate into Public page** — `apps/web/src/app/[slug]/client.tsx`
- Parse `backgroundMusic` from couple data
- Render `<MusicPlayer>` if enabled and has tracks

---

## Critical Files

| File | Action |
|------|--------|
| `apps/server/src/db/migrations/015_add_background_music.ts` | **Create** — migration |
| `apps/server/src/db/types.ts` | Edit — add `background_music` field |
| `apps/server/src/routes/music.route.ts` | **Create** — Jamendo proxy with rate limiting |
| `apps/server/src/graphql/typeDefs/couple.graphql.ts` | Edit — add `backgroundMusic` |
| `apps/server/src/graphql/resolvers/couple.resolver.ts` | Edit — field resolver |
| `apps/server/src/services/couple.service.ts` | Edit — handle + validate backgroundMusic |
| `apps/server/src/config/env.ts` | Edit — JAMENDO_CLIENT_ID |
| `apps/server/src/index.ts` | Edit — mount music route |
| `packages/shared/src/constants.ts` | Edit — PLAN_LIMITS (music_tracks) |
| `packages/shared/src/validations/index.ts` | Edit — updateCoupleSchema |
| `apps/web/src/lib/music-config.ts` | **Create** — types, helpers, URL validation |
| `apps/web/src/hooks/useBackgroundMusic.ts` | **Create** — audio playback hook |
| `apps/web/src/components/couple/music-player.tsx` | **Create** — public page player |
| `apps/web/src/components/settings/music-picker.tsx` | **Create** — music browse modal |
| `apps/web/src/components/settings/clip-selector.tsx` | **Create** — waveform clip selector |
| `apps/web/src/components/settings/music-settings.tsx` | **Create** — settings card |
| `apps/web/src/graphql/queries/couple.queries.ts` | Edit — add backgroundMusic |
| `apps/web/src/graphql/mutations/couple.mutations.ts` | Edit — add backgroundMusic |
| `apps/web/src/app/(dashboard)/dashboard/settings/page.tsx` | Edit — render MusicSettings |
| `apps/web/src/app/[slug]/client.tsx` | Edit — render MusicPlayer |

## Verification

1. **Jamendo API**: Register client_id → test search endpoint → verify tracks with streaming URLs
2. **Security**: Verify client_id not exposed in frontend bundle or network requests
3. **Backend proxy**: Test `/api/music/search?q=romantic` → verify sanitized response, rate limiting works
4. **URL validation**: Attempt to save non-Jamendo URLs → verify rejection
5. **GraphQL**: Test `updateCouple` with `backgroundMusic` JSON → verify DB storage
6. **Music Picker**: Dashboard settings → "Choose Music" → browse/search → preview tracks
7. **Clip Selector**: Select track → drag to select 30s clip → preview → confirm
8. **Public page**: Visit `/[slug]` → music player visible → click play → music plays correct clip
9. **Autoplay**: Open new tab → verify "tap to play" prompt → click → music fades in
10. **Plan gating**: FREE user → verify upgrade prompt, cannot save music; PREMIUM → max 1 track enforced
11. **XSS**: Attempt to save malicious strings in title/artist → verify proper escaping on render
