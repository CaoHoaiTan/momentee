import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/graphql';
const REST_BASE = 'http://localhost:4000';
const uniqueSuffix = Date.now();

// Fake URLs that pass validation
const FAKE_CLOUDINARY_AUDIO = 'https://res.cloudinary.com/demo/video/upload/test-audio.mp3';
const FAKE_CLOUDINARY_ID = 'momentee/music/test-audio';
const FAKE_SPOTIFY_ID = '4uLU6hMCjMI75M1A2tKUQC';
const FAKE_SPOTIFY_URI = `spotify:track:${FAKE_SPOTIFY_ID}`;
const FAKE_SPOTIFY_ART = 'https://i.scdn.co/image/test.jpg';

// Valid 1-track backgroundMusic (Spotify, for PREMIUM plan tests)
const MUSIC_CONFIG_1_SPOTIFY = JSON.stringify({
  enabled: true,
  tracks: [
    {
      id: 'test-track-1',
      source: 'spotify',
      spotifyId: FAKE_SPOTIFY_ID,
      spotifyUri: FAKE_SPOTIFY_URI,
      previewUrl: null,
      title: 'Test Song',
      artist: 'Test Artist',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 180,
      sortOrder: 0,
    },
  ],
  volume: 30,
  loop: true,
});

// 1-track upload config
const MUSIC_CONFIG_1_UPLOAD = JSON.stringify({
  enabled: true,
  tracks: [
    {
      id: 'test-upload-1',
      source: 'upload',
      audioUrl: FAKE_CLOUDINARY_AUDIO,
      cloudinaryId: FAKE_CLOUDINARY_ID,
      title: 'Uploaded Song',
      artist: 'My Artist',
      albumArt: '',
      duration: 180,
      clipStart: 0,
      clipEnd: 30,
      sortOrder: 0,
    },
  ],
  volume: 30,
  loop: true,
});

// 2-track config (exceeds PREMIUM limit of 1)
const MUSIC_CONFIG_2_TRACKS = JSON.stringify({
  enabled: true,
  tracks: [
    {
      id: 'track-1',
      source: 'spotify',
      spotifyId: FAKE_SPOTIFY_ID,
      spotifyUri: FAKE_SPOTIFY_URI,
      previewUrl: null,
      title: 'Song 1',
      artist: 'Artist 1',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 180,
      sortOrder: 0,
    },
    {
      id: 'track-2',
      source: 'upload',
      audioUrl: FAKE_CLOUDINARY_AUDIO,
      cloudinaryId: FAKE_CLOUDINARY_ID,
      title: 'Song 2',
      artist: 'Artist 2',
      albumArt: '',
      duration: 200,
      clipStart: 10,
      clipEnd: 40,
      sortOrder: 1,
    },
  ],
  volume: 50,
  loop: false,
});

// 3-track config (valid for PREMIUM_PLUS with limit 3)
const MUSIC_CONFIG_3_TRACKS = JSON.stringify({
  enabled: true,
  tracks: [
    {
      id: 'track-1',
      source: 'spotify',
      spotifyId: FAKE_SPOTIFY_ID,
      spotifyUri: FAKE_SPOTIFY_URI,
      previewUrl: null,
      title: 'Song 1',
      artist: 'Artist 1',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 180,
      sortOrder: 0,
    },
    {
      id: 'track-2',
      source: 'upload',
      audioUrl: FAKE_CLOUDINARY_AUDIO,
      cloudinaryId: FAKE_CLOUDINARY_ID,
      title: 'Song 2',
      artist: 'Artist 2',
      albumArt: '',
      duration: 200,
      clipStart: 10,
      clipEnd: 40,
      sortOrder: 1,
    },
    {
      id: 'track-3',
      source: 'spotify',
      spotifyId: '1dGr1c8CrMLDpV6mPbImSI',
      spotifyUri: 'spotify:track:1dGr1c8CrMLDpV6mPbImSI',
      previewUrl: null,
      title: 'Song 3',
      artist: 'Artist 3',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 240,
      sortOrder: 2,
    },
  ],
  volume: 40,
  loop: true,
});

// Spotify track + autoplay: true (triggers Welcome Gate)
const MUSIC_CONFIG_SPOTIFY_AUTOPLAY = JSON.stringify({
  enabled: true,
  autoplay: true,
  tracks: [
    {
      id: 'gate-track-1',
      source: 'spotify',
      spotifyId: FAKE_SPOTIFY_ID,
      spotifyUri: FAKE_SPOTIFY_URI,
      previewUrl: null,
      title: 'Test Song',
      artist: 'Test Artist',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 180,
      sortOrder: 0,
    },
  ],
  volume: 30,
  loop: true,
});

// Upload track + autoplay: true (gate shows but upload path, no Spotify IFrame)
const MUSIC_CONFIG_UPLOAD_AUTOPLAY = JSON.stringify({
  enabled: true,
  autoplay: true,
  tracks: [
    {
      id: 'gate-upload-1',
      source: 'upload',
      audioUrl: FAKE_CLOUDINARY_AUDIO,
      cloudinaryId: FAKE_CLOUDINARY_ID,
      title: 'Uploaded Song',
      artist: 'My Artist',
      albumArt: '',
      duration: 180,
      clipStart: 0,
      clipEnd: 30,
      sortOrder: 0,
    },
  ],
  volume: 30,
  loop: true,
});

// Disabled config (enabled: false, has tracks)
const MUSIC_CONFIG_DISABLED = JSON.stringify({
  enabled: false,
  tracks: [
    {
      id: 'test-track-1',
      source: 'spotify',
      spotifyId: FAKE_SPOTIFY_ID,
      spotifyUri: FAKE_SPOTIFY_URI,
      previewUrl: null,
      title: 'Test Song',
      artist: 'Test Artist',
      albumArt: FAKE_SPOTIFY_ART,
      duration: 180,
      sortOrder: 0,
    },
  ],
  volume: 30,
  loop: true,
});

// ─── Helpers (copied pattern from gift-album-flow.spec.ts) ────────────

async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation Register($input: RegisterInput!) {
        register(input: $input) { accessToken refreshToken user { id email name } }
      }`,
      variables: { input: { email, password, name } },
    }),
  });
  const json = await res.json();
  return json.data.register;
}

async function loginViaUI(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}

async function createCoupleAPI(
  accessToken: string,
  displayName: string,
  options?: { anniversary?: string; bio?: string },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation CreateCouple($input: CreateCoupleInput!) {
        createCouple(input: $input) { id slug displayName inviteCode bio anniversary theme isPublic }
      }`,
      variables: {
        input: {
          displayName,
          anniversary: options?.anniversary,
          bio: options?.bio,
        },
      },
    }),
  });
  const json = await res.json();
  return json.data.createCouple;
}

// ─── New helpers ──────────────────────────────────────────────────────

async function upgradePlanAPI(
  accessToken: string,
  coupleId: string,
  plan: 'premium' | 'premium_plus',
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation CreateCheckoutSession($coupleId: ID!, $plan: String!) {
        createCheckoutSession(coupleId: $coupleId, plan: $plan)
      }`,
      variables: { coupleId, plan },
    }),
  });
  const json = await res.json();
  return json.data.createCheckoutSession;
}

async function setBackgroundMusicAPI(
  accessToken: string,
  coupleId: string,
  backgroundMusic: string | null,
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation UpdateCouple($id: ID!, $input: UpdateCoupleInput!) {
        updateCouple(id: $id, input: $input) {
          id backgroundMusic plan
        }
      }`,
      variables: { id: coupleId, input: { backgroundMusic } },
    }),
  });
  return res.json();
}

// ─── Suite 1: GraphQL API — backgroundMusic CRUD ─────────────────────

test.describe('GraphQL API — backgroundMusic CRUD', () => {
  let accessToken: string;
  let coupleId: string;
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-music-api-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Music API User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(accessToken, `Music API Couple ${uniqueSuffix}`, {
      anniversary: '2023-06-01',
    });
    coupleId = couple.id;
    coupleSlug = couple.slug;
    // Upgrade to PREMIUM so we can store 1 track
    await upgradePlanAPI(accessToken, coupleId, 'premium');
  });

  test('updateCouple stores backgroundMusic (Spotify track)', async () => {
    const json = await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
  });

  test('updateCouple stores backgroundMusic (Upload track)', async () => {
    const json = await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_UPLOAD);
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
  });

  test('myCouple query returns stored backgroundMusic', async () => {
    // Reset to Spotify config first
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query MyCouple { myCouple { id backgroundMusic plan } }`,
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.myCouple.backgroundMusic).toBeTruthy();
    const parsed = JSON.parse(json.data.myCouple.backgroundMusic);
    expect(parsed.enabled).toBe(true);
    expect(parsed.tracks.length).toBe(1);
    expect(parsed.tracks[0].source).toBe('spotify');
    expect(parsed.tracks[0].spotifyId).toBe(FAKE_SPOTIFY_ID);
  });

  test('couple (public) query by slug returns backgroundMusic', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query Couple($slug: String!) { couple(slug: $slug) { id backgroundMusic } }`,
        variables: { slug: coupleSlug },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.couple.backgroundMusic).toBeTruthy();
  });

  test('updateCouple with null clears backgroundMusic', async () => {
    const json = await setBackgroundMusicAPI(accessToken, coupleId, null);
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeNull();
  });

  test('invalid track source returns BAD_USER_INPUT', async () => {
    const badConfig = JSON.stringify({
      enabled: true,
      tracks: [
        {
          id: 'bad-track',
          source: 'invalid',
          title: 'Bad Track',
          artist: 'Bad Artist',
          albumArt: '',
          duration: 120,
          sortOrder: 0,
        },
      ],
      volume: 30,
      loop: false,
    });
    const json = await setBackgroundMusicAPI(accessToken, coupleId, badConfig);
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  test('invalid Cloudinary URL for upload returns BAD_USER_INPUT', async () => {
    const badConfig = JSON.stringify({
      enabled: true,
      tracks: [
        {
          id: 'bad-track',
          source: 'upload',
          audioUrl: 'https://example.com/bad-audio.mp3',
          cloudinaryId: 'fake',
          title: 'Bad Track',
          artist: 'Bad Artist',
          albumArt: '',
          duration: 120,
          clipStart: 0,
          clipEnd: 30,
          sortOrder: 0,
        },
      ],
      volume: 30,
      loop: false,
    });
    const json = await setBackgroundMusicAPI(accessToken, coupleId, badConfig);
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(json.errors[0].message).toContain('Cloudinary');
  });

  test('FREE plan: 1 track returns FORBIDDEN', async () => {
    const freeEmail = `e2e-music-free-${uniqueSuffix}@test.dev`;
    const freeAuth = await registerUser(freeEmail, 'Password123', 'Free Music User');
    const freeCouple = await createCoupleAPI(
      freeAuth.accessToken,
      `Free Music Couple ${uniqueSuffix}`,
    );
    const json = await setBackgroundMusicAPI(
      freeAuth.accessToken,
      freeCouple.id,
      MUSIC_CONFIG_1_SPOTIFY,
    );
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(json.errors[0].message).toContain('plan allows 0');
  });

  test('PREMIUM plan: 1 track succeeds', async () => {
    const json = await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
  });

  test('PREMIUM plan: 2 tracks returns FORBIDDEN', async () => {
    const json = await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_2_TRACKS);
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(json.errors[0].message).toContain('plan allows 1');
  });

  test('PREMIUM_PLUS plan: 3 tracks succeeds', async () => {
    await upgradePlanAPI(accessToken, coupleId, 'premium_plus');
    const json = await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_3_TRACKS);
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
    const parsed = JSON.parse(json.data.updateCouple.backgroundMusic);
    expect(parsed.tracks.length).toBe(3);
  });

  test('without auth returns UNAUTHENTICATED', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation UpdateCouple($id: ID!, $input: UpdateCoupleInput!) {
          updateCouple(id: $id, input: $input) { id backgroundMusic }
        }`,
        variables: {
          id: coupleId,
          input: { backgroundMusic: MUSIC_CONFIG_1_SPOTIFY },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});

// ─── Suite 2: REST API — /api/music routes ────────────────────────────

test.describe('REST API — /api/music routes', () => {
  let accessToken: string;

  test.beforeAll(async () => {
    const email = `e2e-music-rest-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Music REST User');
    accessToken = auth.accessToken;
  });

  test('GET /api/music/spotify/categories without auth returns 401', async () => {
    const res = await fetch(`${REST_BASE}/api/music/spotify/categories`);
    expect(res.status).toBe(401);
  });

  test('GET /api/music/spotify/categories with auth returns categories', async () => {
    const res = await fetch(`${REST_BASE}/api/music/spotify/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      categories: Array<{ id: string; label: string }>;
    };
    expect(Array.isArray(body.categories)).toBe(true);
    expect(body.categories.length).toBe(7);
    expect(body.categories[0]).toHaveProperty('id');
    expect(body.categories[0]).toHaveProperty('label');
  });

  test('GET /api/music/spotify/search without auth returns 401', async () => {
    const res = await fetch(`${REST_BASE}/api/music/spotify/search?q=love`);
    expect(res.status).toBe(401);
  });

  test('GET /api/music/spotify/search without credentials returns 503', async () => {
    const res = await fetch(`${REST_BASE}/api/music/spotify/search?q=romantic`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Returns 503 when SPOTIFY_CLIENT_ID/SECRET not configured in test env
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('not configured');
  });

  test('POST /api/music/upload without auth returns 401', async () => {
    const res = await fetch(`${REST_BASE}/api/music/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'data:audio/mpeg;base64,dGVzdA==' }),
    });
    expect(res.status).toBe(401);
  });
});

// ─── Suite 3: Frontend — Music Settings in Dashboard ─────────────────

test.describe('Frontend — Music Settings in Dashboard', () => {
  let accessToken: string;
  let coupleId: string;
  const email = `e2e-music-ui-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Music UI User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(accessToken, `Music UI Couple ${uniqueSuffix}`);
    coupleId = couple.id;
  });

  test('FREE user sees upgrade prompt', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Background Music', level: 2 })).toBeVisible();
    await expect(page.getByText('Upgrade to Premium to unlock')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Choose Music' })).toHaveCount(0);
  });

  test('after upgrade to PREMIUM_PLUS: music controls appear', async ({ page }) => {
    await upgradePlanAPI(accessToken, coupleId, 'premium_plus');
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Upgrade to Premium to unlock')).not.toBeVisible();

    await expect(page.getByRole('button', { name: 'Choose Music' })).toBeVisible();
  });

  test('enable toggle turns on music', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    const musicToggleLabel = page
      .locator('label.relative.flex.cursor-pointer.items-center')
      .first();
    const checkbox = musicToggleLabel.locator('input[type="checkbox"]');

    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await musicToggleLabel.click();
    }
    await expect(checkbox).toBeChecked();
  });

  test('"Choose Music" button opens picker with tabs', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(page.getByRole('heading', { name: 'Choose Music', level: 2 })).toBeVisible();

    // Verify tabs exist
    await expect(page.getByText('Search Spotify')).toBeVisible();
    await expect(page.getByText('Upload Your Own')).toBeVisible();
  });

  test('music picker shows category pills on Spotify tab', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(page.getByRole('heading', { name: 'Choose Music', level: 2 })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Romantic' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Happy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chill' })).toBeVisible();
  });

  test('music picker closes on backdrop click', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(page.getByRole('heading', { name: 'Choose Music', level: 2 })).toBeVisible();

    await page.locator('.fixed.inset-0.z-50 > .absolute.inset-0').click({ force: true });
    await expect(page.getByRole('heading', { name: 'Choose Music', level: 2 })).not.toBeVisible();
  });

  test('upload tab shows file upload area', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await page.getByText('Upload Your Own').click();

    await expect(page.getByText('Click to select an audio file')).toBeVisible();
    await expect(page.getByText('MP3, M4A, OGG, WAV, AAC')).toBeVisible();
  });
});

// ─── Suite 4: Frontend — Music Player on Public Page ─────────────────

test.describe('Frontend — Music Player on Public Page', () => {
  let accessToken: string;
  let coupleId: string;
  let coupleSlug: string;
  const email = `e2e-music-player-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Music Player User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(accessToken, `Music Player Couple ${uniqueSuffix}`);
    coupleId = couple.id;
    coupleSlug = couple.slug;
    await upgradePlanAPI(accessToken, coupleId, 'premium');
  });

  test('no music config → no player', async ({ page }) => {
    const noMusicEmail = `e2e-no-music-${uniqueSuffix}@test.dev`;
    const noMusicAuth = await registerUser(noMusicEmail, 'Password123', 'No Music User');
    const noMusicCouple = await createCoupleAPI(
      noMusicAuth.accessToken,
      `No Music Couple ${uniqueSuffix}`,
    );

    await page.goto(`/${noMusicCouple.slug}`);
    await page.waitForLoadState('networkidle');

    const player = page.locator('.fixed.bottom-4.left-4.z-30');
    await expect(player).toHaveCount(0);
  });

  test('music enabled=false → no player', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_DISABLED);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    const player = page.locator('.fixed.bottom-4.left-4.z-30');
    await expect(player).toHaveCount(0);
  });

  test('Spotify track → player visible with Spotify icon', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const player = page.locator('.fixed.bottom-4.left-4.z-30');
    await expect(player).toBeVisible();
  });

  test('Upload track → player shows needsInteraction label', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_UPLOAD);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    await expect(page.getByText('Tap to play music')).toBeVisible();
  });

  test('clicking Spotify player expands with embed iframe', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    // Expanded player should contain Spotify embed iframe
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toBeVisible();
  });

  test('clicking upload player expands with custom controls', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: function () {
          return Promise.resolve();
        },
      });
    });

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_UPLOAD);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    // Should show track title and custom controls (no Spotify iframe)
    await expect(page.getByText('Uploaded Song')).toBeVisible();
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toHaveCount(0);
  });

  test('collapse button closes expanded player', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: function () {
          return Promise.resolve();
        },
      });
    });

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_UPLOAD);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    const expanded = page.locator('.fixed.bottom-4.left-4.z-30.w-72');
    await expect(expanded).toBeVisible();

    const collapseBtn = expanded.getByRole('button').first();
    await collapseBtn.click();
    await page.waitForTimeout(300);

    await expect(page.locator('.fixed.bottom-4.left-4.z-30.w-72')).toHaveCount(0);
    await expect(page.locator('.fixed.bottom-4.left-4.z-30')).toBeVisible();
  });
});

// ─── Suite 5: Frontend — Music Search in Picker (mocked) ────────────

test.describe('Frontend — Music Search in Picker', () => {
  let accessToken: string;
  let coupleId: string;
  const email = `e2e-music-search-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  const MOCK_SPOTIFY_RESULTS = [
    {
      id: '2001',
      name: 'Ocean Waves',
      artist: 'Nature Sounds',
      albumArt: FAKE_SPOTIFY_ART,
      durationMs: 240000,
      previewUrl: null,
      spotifyUri: 'spotify:track:2001',
    },
    {
      id: '2002',
      name: 'Ocean Breeze',
      artist: 'Chill Vibes',
      albumArt: FAKE_SPOTIFY_ART,
      durationMs: 180000,
      previewUrl: null,
      spotifyUri: 'spotify:track:2002',
    },
  ];

  const MOCK_CATEGORY_RESULTS = [
    {
      id: '1001',
      name: 'Romantic Sunset',
      artist: 'Love Artist',
      albumArt: FAKE_SPOTIFY_ART,
      durationMs: 210000,
      previewUrl: null,
      spotifyUri: 'spotify:track:1001',
    },
  ];

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Music Search User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(accessToken, `Music Search Couple ${uniqueSuffix}`);
    coupleId = couple.id;
    await upgradePlanAPI(accessToken, coupleId, 'premium_plus');
  });

  async function mockSpotifySearchAPI(page: import('@playwright/test').Page) {
    await page.route('**/api/music/spotify/search*', (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';

      const authHeader = route.request().headers()['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      }

      const results = q.includes('ocean') ? MOCK_SPOTIFY_RESULTS : MOCK_CATEGORY_RESULTS;

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results }),
      });
    });
  }

  async function openMusicPicker(page: import('@playwright/test').Page) {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await mockSpotifySearchAPI(page);
    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(page.getByRole('heading', { name: 'Choose Music', level: 2 })).toBeVisible();
  }

  test('category tracks load on open with correct auth', async ({ page }) => {
    await openMusicPicker(page);
    await expect(page.getByText('Romantic Sunset')).toBeVisible({ timeout: 3000 });
  });

  test('typing search shows Spotify results', async ({ page }) => {
    await openMusicPicker(page);

    const searchInput = page.getByPlaceholder('Search by track name or artist...');
    await searchInput.fill('ocean');

    await expect(page.getByText('Ocean Waves')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Ocean Breeze')).toBeVisible();
  });

  test('clearing search reloads category tracks', async ({ page }) => {
    await openMusicPicker(page);

    const searchInput = page.getByPlaceholder('Search by track name or artist...');
    await searchInput.fill('ocean');
    await expect(page.getByText('Ocean Waves')).toBeVisible({ timeout: 3000 });

    await searchInput.fill('');
    await expect(page.getByText('Romantic Sunset')).toBeVisible({ timeout: 3000 });
  });

  test('search with no results shows empty state', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.route('**/api/music/spotify/search*', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      });
    });

    await page.getByRole('button', { name: 'Choose Music' }).click();

    const searchInput = page.getByPlaceholder('Search by track name or artist...');
    await searchInput.fill('xyznonexistent');

    await expect(page.getByText('No tracks found')).toBeVisible({ timeout: 3000 });
  });
});

// ─── Suite 6: Frontend — Welcome Gate ────────────────────────────────

test.describe('Frontend — Welcome Gate', () => {
  let accessToken: string;
  let coupleId: string;
  let coupleSlug: string;
  const email = `e2e-music-gate-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Gate User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(accessToken, `Gate Couple ${uniqueSuffix}`);
    coupleId = couple.id;
    coupleSlug = couple.slug;
    await upgradePlanAPI(accessToken, coupleId, 'premium');
  });

  test('autoplay=false → gate does not appear', async ({ page }) => {
    // MUSIC_CONFIG_1_SPOTIFY has no autoplay field (defaults to false)
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_SPOTIFY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toHaveCount(0);
    // Player should still render normally
    await expect(page.locator('.fixed.bottom-4.left-4.z-30')).toBeVisible();
  });

  test('music disabled + autoplay=true → gate does not appear', async ({ page }) => {
    const disabledAutoplay = JSON.stringify({
      enabled: false,
      autoplay: true,
      tracks: [
        {
          id: 'gate-track-disabled',
          source: 'spotify',
          spotifyId: FAKE_SPOTIFY_ID,
          spotifyUri: FAKE_SPOTIFY_URI,
          previewUrl: null,
          title: 'Test Song',
          artist: 'Test Artist',
          albumArt: FAKE_SPOTIFY_ART,
          duration: 180,
          sortOrder: 0,
        },
      ],
      volume: 30,
      loop: true,
    });
    await setBackgroundMusicAPI(accessToken, coupleId, disabledAutoplay);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toHaveCount(0);
  });

  test('first-time visitor: gate is visible fullscreen', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toBeVisible();
  });

  test('gate shows track title and artist', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await expect(page.getByText('♪ Test Song — Test Artist')).toBeVisible();
  });

  test('gate shows partner name', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    // partner1Name is 'Gate User' (registered name), no partner2 so no '&'
    await expect(page.getByText('Gate User')).toBeVisible();
  });

  test('clicking Enter dismisses gate and reveals music player', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await page.getByRole('button', { name: 'Enter & listen together' }).click();
    // Exit animation is 600ms; wait for it to complete + buffer
    await page.waitForTimeout(900);

    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toHaveCount(0);
    await expect(page.locator('.fixed.bottom-4.left-4.z-30')).toBeVisible();
  });

  test('clicking Enter sets sessionStorage gate key', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await page.getByRole('button', { name: 'Enter & listen together' }).click();
    await page.waitForTimeout(900);

    const gateValue = await page.evaluate(
      (slug) => sessionStorage.getItem(`momentee_gate_${slug}`),
      coupleSlug,
    );
    expect(gateValue).toBe('1');
  });

  test('returning visitor in same session: gate skipped, player visible immediately', async ({
    page,
  }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_SPOTIFY_AUTOPLAY);

    // Pre-set sessionStorage before page load to simulate a returning visitor in same session
    await page.addInitScript(
      ({ slug }) => {
        sessionStorage.setItem(`momentee_gate_${slug}`, '1');
      },
      { slug: coupleSlug },
    );

    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toHaveCount(0);
    await expect(page.locator('.fixed.bottom-4.left-4.z-30')).toBeVisible();
  });

  test('upload track + autoplay: gate shows, dismiss reveals Tap to play', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: function () {
          return Promise.resolve();
        },
      });
    });

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_UPLOAD_AUTOPLAY);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700);

    // Gate should show for upload track too
    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toBeVisible();

    await page.getByRole('button', { name: 'Enter & listen together' }).click();
    await page.waitForTimeout(900);

    // Gate gone, upload track shows needsInteraction label
    await expect(page.getByRole('button', { name: 'Enter & listen together' })).toHaveCount(0);
    await expect(page.getByText('Tap to play music')).toBeVisible();
  });
});
