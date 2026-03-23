# Plan: Gift Section UI Redesign + Album Feature Implementation

## Context

Momentee is a wedding couple page app. The **Gift Registry** section on the public couple page is currently too simple — it only shows plain text (bank name, account number) with a basic copy button. The `qr_code` field exists in the database but is never displayed. The **Album** feature has database tables (`albums`, `album_photos`) already created via migration, but has zero backend API or frontend implementation. This plan addresses both: redesigning the gift UI to prominently show QR codes with copyable bank info, and building out the full album feature end-to-end.

---

## Phase 1: Gift Section Improvements

### 1.1 Backend — Support QR Code Upload via Cloudinary

**Modify:** `apps/server/src/services/gift.service.ts`

- In `create()` (line 22): before DB insert, check if `input.qrCode` starts with `data:` (base64), then upload via `uploadImage(input.qrCode, 'gift-qr')` and store the returned Cloudinary URL
- Same logic in `update()` (line 63)
- Import `uploadImage` from `../utils/cloudinary.js`

### 1.2 Dashboard Gift Page — Add QR Code Upload

**Modify:** `apps/web/src/app/(dashboard)/dashboard/gift/page.tsx`

- Add `qrCodeFiles` state using `MediaFile[]`, import `MediaUpload` and `fileToBase64` from `../../components/couple/media-upload`
- Add QR code upload field in the create form modal (after the Note textarea), using `<MediaUpload maxFiles={1} />`
- Update `handleCreate()`: convert file to base64, include in mutation input as `qrCode`
- Display QR code thumbnail on existing account cards when `account.qrCode` exists
- Add **Edit** functionality for accounts (currently only Delete exists) — allow updating QR code on existing accounts

### 1.3 Public Page — Redesign Gift Section UI

**Modify:** `apps/web/src/app/[slug]/client.tsx`

**a) Fix TypeScript type (lines 103-114):** Add `qrCode: string | null` to the inline giftData query type

**b) Redesign gift section renderer (lines 268-304):**

New layout per gift account card:

```
┌──────────────────────────────┐
│  ╔══════════════════════╗    │  <- gradient top border
│  ║                      ║    │
│  ║     QR Code Image    ║    │  <- centered, rounded, shadow
│  ║                      ║    │
│  ╚══════════════════════╝    │
│                              │
│  🏦 Vietcombank              │  <- bank name (bold) with icon
│                              │
│  Account Holder: NGUYEN A  📋│  <- name + copy button
│  Account Number: 123456    📋│  <- monospace + copy button
│                              │
│  "For wedding gifts"         │  <- note (italic, muted)
└──────────────────────────────┘
```

Design details:
- Card with gradient top border (`linear-gradient` from `--theme-primary` to `--theme-secondary`)
- QR code image displayed at top, centered, `max-w-[200px]`, `rounded-xl`, subtle shadow. If no QR, show a decorative bank/gift icon
- Bank name: bold, with small bank SVG icon
- Account holder & account number: each with an inline copy button (clipboard icon -> checkmark for 2s after click, using `useState` + `setTimeout`)
- Note at bottom: italic, `--theme-text-muted`, 70% opacity
- Use `motion.div` from framer-motion for staggered entrance animation
- Responsive: 1 column on mobile, 2 columns on `sm:`
- CSS variables: `--theme-surface`, `--theme-text`, `--theme-text-muted`, `--theme-primary`, `--theme-secondary`

---

## Phase 2: Album Feature (Full Stack)

### 2.1 Backend — Album Service

**New file:** `apps/server/src/services/album.service.ts`

Following the pattern from `gift.service.ts`:
- `create(coupleId, userId, input)` — create album, upload `coverPhoto` via Cloudinary if base64, check plan limits from `PLAN_LIMITS` in `@momentee/shared`
- `getById(id)` — get album by ID
- `listByCoupleId(coupleId)` — list all albums for a couple, ordered by `created_at desc`
- `update(id, userId, input)` — update title/description/coverPhoto
- `remove(id, userId)` — delete album (FK cascade handles photos)
- `addPhoto(albumId, userId, input)` — upload photo to Cloudinary, insert into `album_photos`
- `removePhoto(photoId, userId)` — delete a photo
- `reorderPhotos(albumId, userId, photoIds)` — update `sort_order` for photos
- `getPhotos(albumId)` — fetch photos for an album, ordered by `sort_order`
- `verifyCoupleOwnership()` — helper to verify ownership through album -> couple chain

Key reusable utilities:
- `createId()` from `@paralleldrive/cuid2` for IDs
- `uploadImage()` from `../utils/cloudinary.js` (folder: `'albums'`)
- `deleteAsset()` from `../utils/cloudinary.js` for cleanup
- `NotFoundError`, `ForbiddenError` from `../utils/errors.js`

### 2.2 Backend — Album GraphQL TypeDefs

**New file:** `apps/server/src/graphql/typeDefs/album.graphql.ts`

```graphql
type Album {
  id: ID!
  coupleId: ID!
  title: String!
  description: String
  coverPhoto: String
  photos: [AlbumPhoto!]!
  photoCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AlbumPhoto {
  id: ID!
  albumId: ID!
  mediaUrl: String!
  caption: String
  sortOrder: Int!
  createdAt: DateTime!
}

input CreateAlbumInput { title: String!, description: String, coverPhoto: String }
input UpdateAlbumInput { title: String, description: String, coverPhoto: String }
input AddAlbumPhotoInput { file: String!, caption: String, sortOrder: Int }

extend type Query {
  albums(coupleId: ID!): [Album!]!
  album(id: ID!): Album
}

extend type Mutation {
  createAlbum(coupleId: ID!, input: CreateAlbumInput!): Album!
  updateAlbum(id: ID!, input: UpdateAlbumInput!): Album!
  deleteAlbum(id: ID!): Boolean!
  addAlbumPhoto(albumId: ID!, input: AddAlbumPhotoInput!): AlbumPhoto!
  removeAlbumPhoto(id: ID!): Boolean!
  reorderAlbumPhotos(albumId: ID!, photoIds: [ID!]!): Boolean!
}
```

### 2.3 Backend — Album Resolver

**New file:** `apps/server/src/graphql/resolvers/album.resolver.ts`

Following `gift.resolver.ts` pattern:
- **Query resolvers:** `albums`, `album`
- **Mutation resolvers:** all 6 mutations, each calling `requireAuth(context)` first
- **Album field resolvers:** `coupleId` <- `couple_id`, `coverPhoto` <- `cover_photo`, `createdAt` <- `created_at`, `updatedAt` <- `updated_at`, `photos` <- query `album_photos` table, `photoCount` <- count of photos
- **AlbumPhoto field resolvers:** `albumId` <- `album_id`, `mediaUrl` <- `media_url`, `sortOrder` <- `sort_order`, `createdAt` <- `created_at`

### 2.4 Backend — Register in Index Files

**Modify:** `apps/server/src/graphql/typeDefs/index.ts`
- Import `albumTypeDefs` from `./album.graphql.js`
- Add to the `typeDefs` array

**Modify:** `apps/server/src/graphql/resolvers/index.ts`
- Import `albumResolvers` from `./album.resolver.js`
- Spread `albumResolvers.Query` into Query, `albumResolvers.Mutation` into Mutation
- Add `Album: albumResolvers.Album` and `AlbumPhoto: albumResolvers.AlbumPhoto` as top-level entries

### 2.5 Frontend — GraphQL Queries & Mutations

**New file:** `apps/web/src/graphql/queries/album.queries.ts`
- `GET_ALBUMS` — query `albums(coupleId)` with all fields + nested photos
- `GET_ALBUM` — query `album(id)` with full detail

**New file:** `apps/web/src/graphql/mutations/album.mutations.ts`
- `CREATE_ALBUM`, `UPDATE_ALBUM`, `DELETE_ALBUM`
- `ADD_ALBUM_PHOTO`, `REMOVE_ALBUM_PHOTO`, `REORDER_ALBUM_PHOTOS`

### 2.6 Frontend — Dashboard Albums Page

**New file:** `apps/web/src/app/(dashboard)/dashboard/albums/page.tsx`

Following `gift/page.tsx` pattern:
- Auth/couple guards (same pattern as all dashboard pages)
- **Album list view:** Grid of album cards showing cover photo, title, photo count, edit/delete buttons
- **Create album modal:** Form with title, description, cover photo upload (reuse `MediaUpload` with `maxFiles={1}`)
- **Album detail/edit view:** Click on album card -> expanded view showing:
  - Photo grid with delete button per photo
  - Add photos button (using `MediaUpload`)
  - Edit album title/description
- **Delete confirmation:** Reuse `ConfirmModal` component

### 2.7 Frontend — Album Section on Public Couple Page

**Modify:** `apps/web/src/app/[slug]/client.tsx`

- Import `GET_ALBUMS` from album queries
- Add `useQuery(GET_ALBUMS, { variables: { coupleId: couple.id } })`
- Add `albums` section renderer in `sectionRenderers`:
  - Display albums as cards with cover photo, title, photo count
  - Click album -> expand to show photos using existing `Gallery` component (adapter maps album photos to `PostData` format: `{ caption, media: [{ url }] }`)
  - Use Framer Motion `AnimatePresence` for expand/collapse animation
- Update `defaultOrder` (line 134): add `'albums'` after `'gallery'`

### 2.8 Frontend — Register in Section Reorder

**Modify:** `apps/web/src/components/ui/section-reorder.tsx`
- Add `{ id: 'albums', label: 'Albums', icon: '📸' }` to `DEFAULT_SECTIONS` array (after gallery entry)

---

## Phase 3: UI Polish

### 3.1 Animations (Framer Motion)
- **Gift cards:** stagger entrance using `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `whileInView`, `transition={{ delay: index * 0.1 }}`
- **QR code reveal:** `motion.img` with `initial={{ scale: 0.8, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`
- **Copy button feedback:** `whileTap={{ scale: 0.95 }}`
- **Album cards:** same stagger pattern as gift cards
- **Album expand:** `layoutId` for shared element transitions

### 3.2 Theme Integration
- All new components must use existing theme CSS variables: `--theme-bg`, `--theme-surface`, `--theme-text`, `--theme-text-muted`, `--theme-border`, `--theme-primary`, `--theme-secondary`
- Verify across all 4 themes: Sunset Coral, Midnight Garden, Minimal Luxe, Neon Love

---

## Implementation Order

| # | Task | Files |
|---|------|-------|
| 1 | Gift service: add Cloudinary upload for QR code | `apps/server/src/services/gift.service.ts` |
| 2 | Gift dashboard: add QR upload + edit | `apps/web/src/app/(dashboard)/dashboard/gift/page.tsx` |
| 3 | Gift public: fix type + redesign UI | `apps/web/src/app/[slug]/client.tsx` (lines 103-114, 268-304) |
| 4 | Album service (backend) | `apps/server/src/services/album.service.ts` (new) |
| 5 | Album GraphQL typeDefs | `apps/server/src/graphql/typeDefs/album.graphql.ts` (new) |
| 6 | Album resolver | `apps/server/src/graphql/resolvers/album.resolver.ts` (new) |
| 7 | Register album in backend indexes | `apps/server/src/graphql/{typeDefs,resolvers}/index.ts` |
| 8 | Album frontend queries/mutations | `apps/web/src/graphql/{queries,mutations}/album.*.ts` (new) |
| 9 | Dashboard albums page | `apps/web/src/app/(dashboard)/dashboard/albums/page.tsx` (new) |
| 10 | Album public section + section reorder | `apps/web/src/app/[slug]/client.tsx`, `section-reorder.tsx` |
| 11 | UI polish: animations, theme testing | Across all modified files |

---

## Verification

1. **Gift section:** Create gift account with QR code upload in dashboard -> verify QR displays on public page -> test all copy buttons work with feedback
2. **Album feature:** Create album in dashboard -> add photos -> verify display on public page with lightbox navigation
3. **Theme testing:** Switch across all 4 themes, verify gift + album sections render with correct colors
4. **Responsive:** Test mobile viewport for both gift and album sections
5. **Build:** `yarn build` passes without errors
