import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/graphql';
const REST_BASE = 'http://localhost:4000';
const uniqueSuffix = Date.now();

// Fake Jamendo URLs that pass URL validation (*.jamendo.com domain)
const FAKE_AUDIO_URL = 'https://mp3l.jamendo.com/download/track/12345/mp31/';
const FAKE_IMAGE_URL = 'https://usercontent.jamendo.com/images/test.jpg';

// Valid 1-track backgroundMusic JSON (for PREMIUM plan tests)
const MUSIC_CONFIG_1_TRACK = JSON.stringify({
  enabled: true,
  tracks: [
    {
      id: 'test-track-1',
      jamendoId: '12345',
      title: 'Test Song',
      artist: 'Test Artist',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
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
      jamendoId: '111',
      title: 'Song 1',
      artist: 'Artist 1',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
      duration: 180,
      clipStart: 0,
      clipEnd: 30,
      sortOrder: 0,
    },
    {
      id: 'track-2',
      jamendoId: '222',
      title: 'Song 2',
      artist: 'Artist 2',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
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
      jamendoId: '111',
      title: 'Song 1',
      artist: 'Artist 1',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
      duration: 180,
      clipStart: 0,
      clipEnd: 30,
      sortOrder: 0,
    },
    {
      id: 'track-2',
      jamendoId: '222',
      title: 'Song 2',
      artist: 'Artist 2',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
      duration: 200,
      clipStart: 10,
      clipEnd: 40,
      sortOrder: 1,
    },
    {
      id: 'track-3',
      jamendoId: '333',
      title: 'Song 3',
      artist: 'Artist 3',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
      duration: 240,
      clipStart: 5,
      clipEnd: 35,
      sortOrder: 2,
    },
  ],
  volume: 40,
  loop: true,
});

// Disabled config (enabled: false, has tracks)
const MUSIC_CONFIG_DISABLED = JSON.stringify({
  enabled: false,
  tracks: [
    {
      id: 'test-track-1',
      jamendoId: '12345',
      title: 'Test Song',
      artist: 'Test Artist',
      albumArt: FAKE_IMAGE_URL,
      audioUrl: FAKE_AUDIO_URL,
      duration: 180,
      clipStart: 0,
      clipEnd: 30,
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

async function loginViaUI(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
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
    const auth = await registerUser(email, 'password123', 'Music API User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Music API Couple ${uniqueSuffix}`,
      { anniversary: '2023-06-01' },
    );
    coupleId = couple.id;
    coupleSlug = couple.slug;
    // Upgrade to PREMIUM so we can store 1 track
    await upgradePlanAPI(accessToken, coupleId, 'premium');
  });

  test('updateCouple stores backgroundMusic', async () => {
    const json = await setBackgroundMusicAPI(
      accessToken,
      coupleId,
      MUSIC_CONFIG_1_TRACK,
    );
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
  });

  test('myCouple query returns stored backgroundMusic', async () => {
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
    expect(parsed.tracks[0].title).toBe('Test Song');
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

  test('non-Jamendo audioUrl returns BAD_USER_INPUT', async () => {
    const badConfig = JSON.stringify({
      enabled: true,
      tracks: [
        {
          id: 'bad-track',
          jamendoId: '99999',
          title: 'Bad Track',
          artist: 'Bad Artist',
          albumArt: FAKE_IMAGE_URL,
          audioUrl: 'https://example.com/bad-audio.mp3',
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
    expect(json.errors[0].message).toContain('Jamendo');
  });

  test('FREE plan: 1 track returns FORBIDDEN', async () => {
    const freeEmail = `e2e-music-free-${uniqueSuffix}@test.dev`;
    const freeAuth = await registerUser(
      freeEmail,
      'password123',
      'Free Music User',
    );
    const freeCouple = await createCoupleAPI(
      freeAuth.accessToken,
      `Free Music Couple ${uniqueSuffix}`,
    );
    const json = await setBackgroundMusicAPI(
      freeAuth.accessToken,
      freeCouple.id,
      MUSIC_CONFIG_1_TRACK,
    );
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(json.errors[0].message).toContain('plan allows 0');
  });

  test('PREMIUM plan: 1 track succeeds', async () => {
    // coupleId is on PREMIUM (upgraded in beforeAll); re-set after null from earlier test
    const json = await setBackgroundMusicAPI(
      accessToken,
      coupleId,
      MUSIC_CONFIG_1_TRACK,
    );
    expect(json.errors).toBeUndefined();
    expect(json.data.updateCouple.backgroundMusic).toBeTruthy();
  });

  test('PREMIUM plan: 2 tracks returns FORBIDDEN', async () => {
    const json = await setBackgroundMusicAPI(
      accessToken,
      coupleId,
      MUSIC_CONFIG_2_TRACKS,
    );
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(json.errors[0].message).toContain('plan allows 1');
  });

  test('PREMIUM_PLUS plan: 3 tracks succeeds', async () => {
    await upgradePlanAPI(accessToken, coupleId, 'premium_plus');
    const json = await setBackgroundMusicAPI(
      accessToken,
      coupleId,
      MUSIC_CONFIG_3_TRACKS,
    );
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
          input: { backgroundMusic: MUSIC_CONFIG_1_TRACK },
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
    const auth = await registerUser(email, 'password123', 'Music REST User');
    accessToken = auth.accessToken;
  });

  test('GET /api/music/categories without auth returns 401', async () => {
    const res = await fetch(`${REST_BASE}/api/music/categories`);
    expect(res.status).toBe(401);
  });

  test('GET /api/music/categories with auth returns categories list', async () => {
    const res = await fetch(`${REST_BASE}/api/music/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      categories: Array<{ id: string; label: string; tags: string }>;
    };
    expect(Array.isArray(body.categories)).toBe(true);
    expect(body.categories.length).toBe(7);
    expect(body.categories[0]).toHaveProperty('id');
    expect(body.categories[0]).toHaveProperty('label');
    expect(body.categories[0]).toHaveProperty('tags');
  });

  test('GET /api/music/search without auth returns 401', async () => {
    const res = await fetch(`${REST_BASE}/api/music/search?q=love`);
    expect(res.status).toBe(401);
  });

  test('GET /api/music/search with auth but no JAMENDO_CLIENT_ID returns 503', async () => {
    const res = await fetch(`${REST_BASE}/api/music/search?q=romantic`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('not configured');
  });
});

// ─── Suite 3: Frontend — Music Settings in Dashboard ─────────────────

test.describe('Frontend — Music Settings in Dashboard', () => {
  let accessToken: string;
  let coupleId: string;
  const email = `e2e-music-ui-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Music UI User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Music UI Couple ${uniqueSuffix}`,
    );
    coupleId = couple.id;
  });

  test('FREE user sees upgrade prompt', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // The Background Music card h2 and the locked-state badge should be visible
    await expect(
      page.getByRole('heading', { name: 'Background Music', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('Upgrade to Premium to unlock')).toBeVisible();

    // The "Choose Music" button should not exist for free users
    await expect(
      page.getByRole('button', { name: 'Choose Music' }),
    ).toHaveCount(0);
  });

  test('after upgrade to PREMIUM_PLUS: music controls appear', async ({
    page,
  }) => {
    await upgradePlanAPI(accessToken, coupleId, 'premium_plus');
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // Upgrade prompt should be gone
    await expect(page.getByText('Upgrade to Premium to unlock')).not.toBeVisible();

    // "Choose Music" button should now be visible (no tracks yet → shows "Choose Music")
    await expect(
      page.getByRole('button', { name: 'Choose Music' }),
    ).toBeVisible();
  });

  test('enable toggle turns on music', async ({ page }) => {
    // Already upgraded to premium_plus in previous test
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // The music enable toggle label uses class "relative flex cursor-pointer items-center"
    // (distinct from privacy toggle which uses "flex cursor-pointer items-center gap-3")
    const musicToggleLabel = page.locator(
      'label.relative.flex.cursor-pointer.items-center',
    ).first();
    const checkbox = musicToggleLabel.locator('input[type="checkbox"]');

    // Toggle on if not already checked
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await musicToggleLabel.click();
    }
    await expect(checkbox).toBeChecked();
  });

  test('"Choose Music" button opens music picker modal', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(
      page.getByRole('heading', { name: 'Choose Music', level: 2 }),
    ).toBeVisible();
  });

  test('music picker shows category tabs', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(
      page.getByRole('heading', { name: 'Choose Music', level: 2 }),
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Romantic' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Happy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chill' })).toBeVisible();
  });

  test('music picker closes on backdrop click', async ({ page }) => {
    await loginViaUI(page, email, password);
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Choose Music' }).click();
    await expect(
      page.getByRole('heading', { name: 'Choose Music', level: 2 }),
    ).toBeVisible();

    // Click the backdrop (absolute inset-0 overlay inside the fixed modal container)
    await page
      .locator('.fixed.inset-0.z-50 > .absolute.inset-0')
      .click({ force: true });
    await expect(
      page.getByRole('heading', { name: 'Choose Music', level: 2 }),
    ).not.toBeVisible();
  });
});

// ─── Suite 4: Frontend — Music Player on Public Page ─────────────────

test.describe('Frontend — Music Player on Public Page', () => {
  let accessToken: string;
  let coupleId: string;
  let coupleSlug: string;
  const email = `e2e-music-player-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Music Player User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Music Player Couple ${uniqueSuffix}`,
    );
    coupleId = couple.id;
    coupleSlug = couple.slug;
    await upgradePlanAPI(accessToken, coupleId, 'premium');
  });

  test('no music config → no player', async ({ page }) => {
    // A fresh couple with no music set
    const noMusicEmail = `e2e-no-music-${uniqueSuffix}@test.dev`;
    const noMusicAuth = await registerUser(
      noMusicEmail,
      'password123',
      'No Music User',
    );
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

  test('music enabled + tracks → player visible', async ({ page }) => {
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_TRACK);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    // Wait for the player's enter animation (delay: 0.5s + duration: 0.3s)
    await page.waitForTimeout(900);

    const player = page.locator('.fixed.bottom-4.left-4.z-30');
    await expect(player).toBeVisible();
  });

  test('player shows needsInteraction label', async ({ page }) => {
    // No audio mock — headless Chromium blocks autoplay → needsInteraction = true
    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_TRACK);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    await expect(page.getByText('Tap to play music')).toBeVisible();
  });

  test('clicking player expands controls', async ({ page }) => {
    // Mock audio.play to always resolve so needsInteraction = false from mount
    await page.addInitScript(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: function () {
          return Promise.resolve();
        },
      });
    });

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_TRACK);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    // With play mocked, needsInteraction = false → click expands the player
    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    const expanded = page.locator('.fixed.bottom-4.left-4.z-30.w-64');
    await expect(expanded).toBeVisible();
  });

  test('play/pause button in expanded player shows track title', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        writable: true,
        value: function () {
          return Promise.resolve();
        },
      });
    });

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_TRACK);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    // Expanded panel shows track title and play button
    await expect(page.getByText('Test Song')).toBeVisible();
    const expanded = page.locator('.fixed.bottom-4.left-4.z-30.w-64');
    // Play/pause is the second button in expanded (after collapse)
    await expect(expanded.getByRole('button').nth(1)).toBeVisible();
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

    await setBackgroundMusicAPI(accessToken, coupleId, MUSIC_CONFIG_1_TRACK);
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);

    const playerBtn = page.locator('.fixed.bottom-4.left-4.z-30').locator('button').first();
    await playerBtn.click();
    await page.waitForTimeout(300);

    const expanded = page.locator('.fixed.bottom-4.left-4.z-30.w-64');
    await expect(expanded).toBeVisible();

    // Collapse button is the first button in the expanded panel header
    const collapseBtn = expanded.getByRole('button').first();
    await collapseBtn.click();
    await page.waitForTimeout(300);

    // Expanded panel disappears
    await expect(page.locator('.fixed.bottom-4.left-4.z-30.w-64')).toHaveCount(0);
    // Small collapsed button remains
    await expect(page.locator('.fixed.bottom-4.left-4.z-30')).toBeVisible();
  });
});
