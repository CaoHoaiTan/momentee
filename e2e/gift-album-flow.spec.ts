import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/graphql';
const uniqueSuffix = Date.now();
const TINY_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcOrAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ─── Helpers (copied from couple-flow.spec.ts — no shared module) ───

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

// ─── New helpers ────────────────────────────────────────────────────

async function createGiftAccountAPI(
  accessToken: string,
  coupleId: string,
  input: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrCode?: string;
    note?: string;
  },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation CreateGiftAccount($coupleId: ID!, $input: CreateGiftAccountInput!) {
        createGiftAccount(coupleId: $coupleId, input: $input) {
          id coupleId bankName accountNumber accountHolder qrCode note isActive createdAt
        }
      }`,
      variables: { coupleId, input },
    }),
  });
  const json = await res.json();
  return json.data.createGiftAccount;
}

async function updateGiftAccountAPI(
  accessToken: string,
  id: string,
  input: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrCode?: string;
    note?: string;
    isActive?: boolean;
  },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation UpdateGiftAccount($id: ID!, $input: UpdateGiftAccountInput!) {
        updateGiftAccount(id: $id, input: $input) {
          id bankName accountNumber accountHolder qrCode note isActive
        }
      }`,
      variables: { id, input },
    }),
  });
  const json = await res.json();
  return json.data.updateGiftAccount;
}

async function createAlbumAPI(
  accessToken: string,
  coupleId: string,
  input: { title: string; description?: string; coverPhoto?: string },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation CreateAlbum($coupleId: ID!, $input: CreateAlbumInput!) {
        createAlbum(coupleId: $coupleId, input: $input) {
          id coupleId title description coverPhoto photoCount createdAt updatedAt
        }
      }`,
      variables: { coupleId, input },
    }),
  });
  const json = await res.json();
  return json.data.createAlbum;
}

async function addAlbumPhotoAPI(
  accessToken: string,
  albumId: string,
  input: { file: string; caption?: string; sortOrder?: number },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation AddAlbumPhoto($albumId: ID!, $input: AddAlbumPhotoInput!) {
        addAlbumPhoto(albumId: $albumId, input: $input) {
          id albumId mediaUrl caption sortOrder createdAt
        }
      }`,
      variables: { albumId, input },
    }),
  });
  const json = await res.json();
  return json.data.addAlbumPhoto;
}

// ─── Suite 1: GraphQL API — Gift Account CRUD ───────────────────────

test.describe('GraphQL API — Gift Account CRUD', () => {
  let accessToken: string;
  let coupleId: string;
  let giftAccountId: string;

  test.beforeAll(async () => {
    const email = `e2e-gift-api-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Gift API User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Gift API Couple ${uniqueSuffix}`,
      { anniversary: '2023-06-01' },
    );
    coupleId = couple.id;
  });

  test('createGiftAccount returns correct fields', async () => {
    const account = await createGiftAccountAPI(accessToken, coupleId, {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'NGUYEN VAN A',
      note: 'For wedding gifts',
    });

    expect(account.bankName).toBe('Vietcombank');
    expect(account.accountNumber).toBe('1234567890');
    expect(account.accountHolder).toBe('NGUYEN VAN A');
    expect(account.note).toBe('For wedding gifts');
    expect(account.isActive).toBe(true);
    expect(account.qrCode).toBeNull();
    expect(account.id).toBeTruthy();
    expect(account.coupleId).toBe(coupleId);

    giftAccountId = account.id;
  });

  test('giftAccounts query returns list', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query GiftAccounts($coupleId: ID!) { giftAccounts(coupleId: $coupleId) { id bankName accountNumber } }`,
        variables: { coupleId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.giftAccounts.length).toBeGreaterThanOrEqual(1);
    expect(json.data.giftAccounts[0].bankName).toBe('Vietcombank');
  });

  test('giftAccount query returns single account', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query GiftAccount($id: ID!) { giftAccount(id: $id) { id bankName accountNumber accountHolder note isActive qrCode } }`,
        variables: { id: giftAccountId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.giftAccount.bankName).toBe('Vietcombank');
    expect(json.data.giftAccount.accountNumber).toBe('1234567890');
    expect(json.data.giftAccount.accountHolder).toBe('NGUYEN VAN A');
    expect(json.data.giftAccount.note).toBe('For wedding gifts');
    expect(json.data.giftAccount.isActive).toBe(true);
  });

  test('updateGiftAccount changes fields', async () => {
    const updated = await updateGiftAccountAPI(accessToken, giftAccountId, {
      bankName: 'Techcombank',
      isActive: false,
    });

    expect(updated.bankName).toBe('Techcombank');
    expect(updated.isActive).toBe(false);
  });

  test('createGiftAccount with qrCode stores URL', async () => {
    const account = await createGiftAccountAPI(accessToken, coupleId, {
      bankName: 'MBBank',
      accountNumber: '9876543210',
      qrCode: TINY_PNG_BASE64,
    });

    expect(account.qrCode).toBeTruthy();
    expect(account.id).toBeTruthy();
  });

  test('deleteGiftAccount returns true', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation DeleteGiftAccount($id: ID!) { deleteGiftAccount(id: $id) }`,
        variables: { id: giftAccountId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.deleteGiftAccount).toBe(true);
  });

  test('giftAccounts after delete has reduced count', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query GiftAccounts($coupleId: ID!) { giftAccounts(coupleId: $coupleId) { id bankName } }`,
        variables: { coupleId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    // Only the MBBank account should remain (Vietcombank was deleted)
    expect(json.data.giftAccounts.length).toBe(1);
  });

  test('createGiftAccount without auth returns UNAUTHENTICATED', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation CreateGiftAccount($coupleId: ID!, $input: CreateGiftAccountInput!) {
          createGiftAccount(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { bankName: 'Unauthorized', accountNumber: '000' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  test('createGiftAccount on wrong couple returns FORBIDDEN', async () => {
    const otherEmail = `e2e-gift-other-${uniqueSuffix}@test.dev`;
    const otherAuth = await registerUser(
      otherEmail,
      'Password123',
      'Other Gift User',
    );

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherAuth.accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation CreateGiftAccount($coupleId: ID!, $input: CreateGiftAccountInput!) {
          createGiftAccount(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { bankName: 'Wrong Couple', accountNumber: '000' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});

// ─── Suite 2: GraphQL API — Album CRUD ──────────────────────────────

test.describe('GraphQL API — Album CRUD', () => {
  let accessToken: string;
  let coupleId: string;
  let albumId: string;
  let photoId1: string;
  let photoId2: string;

  test.beforeAll(async () => {
    const email = `e2e-album-api-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Album API User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Album API Couple ${uniqueSuffix}`,
      { anniversary: '2023-06-01' },
    );
    coupleId = couple.id;
  });

  test('createAlbum returns correct fields', async () => {
    const album = await createAlbumAPI(accessToken, coupleId, {
      title: 'Our Wedding Day',
      description: 'The best day ever',
    });

    expect(album.title).toBe('Our Wedding Day');
    expect(album.description).toBe('The best day ever');
    expect(album.coverPhoto).toBeNull();
    expect(album.photoCount).toBe(0);
    expect(album.id).toBeTruthy();
    expect(album.coupleId).toBe(coupleId);

    albumId = album.id;
  });

  test('albums query returns list', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Albums($coupleId: ID!) { albums(coupleId: $coupleId) { id title photoCount } }`,
        variables: { coupleId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.albums.length).toBeGreaterThanOrEqual(1);
  });

  test('album query with empty photos', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Album($id: ID!) { album(id: $id) { id title photos { id } photoCount } }`,
        variables: { id: albumId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.album.photos).toEqual([]);
    expect(json.data.album.photoCount).toBe(0);
  });

  test('updateAlbum changes title', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) { id title }
        }`,
        variables: {
          id: albumId,
          input: { title: 'Updated Wedding Album' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.updateAlbum.title).toBe('Updated Wedding Album');
  });

  test('addAlbumPhoto stores first photo', async () => {
    const photo = await addAlbumPhotoAPI(accessToken, albumId, {
      file: TINY_PNG_BASE64,
      caption: 'First photo',
      sortOrder: 0,
    });

    expect(photo.mediaUrl).toBeTruthy();
    expect(photo.caption).toBe('First photo');
    expect(photo.sortOrder).toBe(0);
    expect(photo.id).toBeTruthy();

    photoId1 = photo.id;
  });

  test('addAlbumPhoto stores second photo', async () => {
    const photo = await addAlbumPhotoAPI(accessToken, albumId, {
      file: TINY_PNG_BASE64,
      caption: 'Second photo',
      sortOrder: 1,
    });

    expect(photo.sortOrder).toBe(1);
    expect(photo.id).toBeTruthy();

    photoId2 = photo.id;
  });

  test('album query shows photoCount=2', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Album($id: ID!) { album(id: $id) { id photoCount photos { id caption sortOrder } } }`,
        variables: { id: albumId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.album.photoCount).toBe(2);
    expect(json.data.album.photos.length).toBe(2);
  });

  test('reorderAlbumPhotos returns true', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation ReorderAlbumPhotos($albumId: ID!, $photoIds: [ID!]!) {
          reorderAlbumPhotos(albumId: $albumId, photoIds: $photoIds)
        }`,
        variables: { albumId, photoIds: [photoId2, photoId1] },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.reorderAlbumPhotos).toBe(true);
  });

  test('album photos reflect new order', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Album($id: ID!) { album(id: $id) { photos { id sortOrder } } }`,
        variables: { id: albumId },
      }),
    });
    const json = await res.json();
    const photos = json.data.album.photos.sort(
      (a: { sortOrder: number }, b: { sortOrder: number }) =>
        a.sortOrder - b.sortOrder,
    );
    expect(photos[0].id).toBe(photoId2);
    expect(photos[1].id).toBe(photoId1);
  });

  test('removeAlbumPhoto returns true', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation RemoveAlbumPhoto($id: ID!) { removeAlbumPhoto(id: $id) }`,
        variables: { id: photoId1 },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.removeAlbumPhoto).toBe(true);
  });

  test('album after removal shows count=1', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Album($id: ID!) { album(id: $id) { photoCount } }`,
        variables: { id: albumId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.album.photoCount).toBe(1);
  });

  test('deleteAlbum returns true', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation DeleteAlbum($id: ID!) { deleteAlbum(id: $id) }`,
        variables: { id: albumId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.deleteAlbum).toBe(true);
  });

  test('albums after delete is empty', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Albums($coupleId: ID!) { albums(coupleId: $coupleId) { id } }`,
        variables: { coupleId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.albums.length).toBe(0);
  });

  test('createAlbum without auth returns UNAUTHENTICATED', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation CreateAlbum($coupleId: ID!, $input: CreateAlbumInput!) {
          createAlbum(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { title: 'Unauthorized Album' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  test('createAlbum on wrong couple returns FORBIDDEN', async () => {
    const otherEmail = `e2e-album-other-${uniqueSuffix}@test.dev`;
    const otherAuth = await registerUser(
      otherEmail,
      'Password123',
      'Other Album User',
    );

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherAuth.accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation CreateAlbum($coupleId: ID!, $input: CreateAlbumInput!) {
          createAlbum(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { title: 'Wrong Couple Album' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});

// ─── Suite 3: GraphQL API — Album plan limits ───────────────────────

test.describe('GraphQL API — Album plan limits', () => {
  let accessToken: string;
  let coupleId: string;

  test.beforeAll(async () => {
    const email = `e2e-album-limit-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Album Limit User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `Album Limit Couple ${uniqueSuffix}`,
      { anniversary: '2023-06-01' },
    );
    coupleId = couple.id;
  });

  test('can create albums up to free plan limit', async () => {
    for (let i = 1; i <= 3; i++) {
      const album = await createAlbumAPI(accessToken, coupleId, {
        title: `Limit Album ${i}`,
      });
      expect(album.id).toBeTruthy();
    }
  });

  test('4th album returns BAD_USER_INPUT', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation CreateAlbum($coupleId: ID!, $input: CreateAlbumInput!) {
          createAlbum(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { title: 'Over Limit Album' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(json.errors[0].message).toContain('limit');
  });
});

// ─── Suite 4: Frontend — Gift Dashboard page ────────────────────────

test.describe('Frontend — Gift Dashboard page', () => {
  const email = `e2e-gift-ui-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Gift UI User');
    await createCoupleAPI(auth.accessToken, `Gift UI Couple ${uniqueSuffix}`, {
      anniversary: '2023-01-01',
    });
  });

  test('shows empty state', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Gift' }).click();
    await page.waitForURL('**/dashboard/gift', { timeout: 5000 });

    await expect(page.getByText('No gift accounts yet')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: 'Add Account' }),
    ).toBeVisible();
  });

  test('create gift account via form', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Gift' }).click();
    await page.waitForURL('**/dashboard/gift', { timeout: 5000 });

    await page.getByRole('button', { name: 'Add Account' }).first().click();

    await page.getByPlaceholder('e.g. Vietcombank').fill('Vietcombank');
    await page.getByPlaceholder('e.g. 1234567890').fill('1234567890');
    await page.getByPlaceholder('e.g. NGUYEN VAN A').fill('NGUYEN VAN A');
    await page.getByPlaceholder('e.g. For wedding gifts').fill('Wedding fund');

    await page.getByRole('button', { name: 'Add Account' }).last().click();

    await expect(page.getByText('Vietcombank')).toBeVisible({
      timeout: 10000,
    });
  });

  test('edit gift account', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Gift' }).click();
    await page.waitForURL('**/dashboard/gift', { timeout: 5000 });

    await expect(page.getByText('Vietcombank')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Edit' }).first().click();

    const bankInput = page.getByPlaceholder('e.g. Vietcombank');
    await bankInput.clear();
    await bankInput.fill('Techcombank');

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Techcombank')).toBeVisible({
      timeout: 10000,
    });
  });

  test('delete gift account', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Gift' }).click();
    await page.waitForURL('**/dashboard/gift', { timeout: 5000 });

    await expect(page.getByText('Techcombank')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText('Delete Gift Account')).toBeVisible({
      timeout: 5000,
    });
    await page
      .locator('.fixed')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page.getByText('No gift accounts yet')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Suite 5: Frontend — Album Dashboard page ───────────────────────

test.describe('Frontend — Album Dashboard page', () => {
  const email = `e2e-album-ui-${uniqueSuffix}@test.dev`;
  const password = 'Password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Album UI User');
    await createCoupleAPI(
      auth.accessToken,
      `Album UI Couple ${uniqueSuffix}`,
      { anniversary: '2023-01-01' },
    );
  });

  test('shows empty state', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await expect(page.getByText('No albums yet')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: 'Create Album' }),
    ).toBeVisible();
  });

  test('create album via form', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await page.getByRole('button', { name: 'Create Album' }).first().click();

    await page
      .getByPlaceholder('e.g. Our Wedding Day')
      .fill('Honeymoon Album');
    await page
      .getByPlaceholder('A short description of this album')
      .fill('Our amazing honeymoon');

    await page.getByRole('button', { name: 'Create Album' }).last().click();

    await expect(page.getByText('Honeymoon Album')).toBeVisible({
      timeout: 10000,
    });
  });

  test('click album card opens detail', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await expect(page.getByText('Honeymoon Album')).toBeVisible({
      timeout: 10000,
    });

    // Click the album card (not the Edit/Delete buttons)
    await page.getByText('Honeymoon Album').click();

    // Detail view
    await expect(
      page.locator('h1', { hasText: 'Honeymoon Album' }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: 'Back' }),
    ).toBeVisible();
    await expect(page.getByText('No photos yet')).toBeVisible();
    await expect(page.getByText('Add Photos')).toBeVisible();
  });

  test('edit album from detail', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await expect(page.getByText('Honeymoon Album')).toBeVisible({
      timeout: 10000,
    });
    await page.getByText('Honeymoon Album').click();

    await expect(
      page.locator('h1', { hasText: 'Honeymoon Album' }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Edit' }).click();

    const titleInput = page.getByPlaceholder('e.g. Our Wedding Day');
    await titleInput.clear();
    await titleInput.fill('Updated Honeymoon');

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(
      page.locator('h1', { hasText: 'Updated Honeymoon' }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigate back to list', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await expect(page.getByText('Updated Honeymoon')).toBeVisible({
      timeout: 10000,
    });
    await page.getByText('Updated Honeymoon').click();

    await expect(
      page.locator('h1', { hasText: 'Updated Honeymoon' }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Back' }).click();

    // Back to list view — album title should be visible
    await expect(page.getByText('Updated Honeymoon')).toBeVisible({
      timeout: 10000,
    });
    // h1 should now be "Albums" (list heading)
    await expect(page.locator('h1', { hasText: 'Albums' })).toBeVisible();
  });

  test('delete album', async ({ page }) => {
    await loginViaUI(page, email, password);
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Albums' }).click();
    await page.waitForURL('**/dashboard/albums', { timeout: 5000 });

    await expect(page.getByText('Updated Honeymoon')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText('Delete Album')).toBeVisible({
      timeout: 5000,
    });
    await page
      .locator('.fixed')
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(page.getByText('No albums yet')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Suite 6: Frontend — Gift on Public page ────────────────────────

test.describe('Frontend — Gift on Public page', () => {
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-gift-pub-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Gift Public User');
    const couple = await createCoupleAPI(
      auth.accessToken,
      `Gift Public Test ${uniqueSuffix}`,
      { anniversary: '2023-01-01', bio: 'A love story with gifts' },
    );
    coupleSlug = couple.slug;

    // Create an active gift account
    await createGiftAccountAPI(auth.accessToken, couple.id, {
      bankName: 'ActiveBank',
      accountNumber: '1111111111',
      accountHolder: 'Active Holder',
    });

    // Create a deactivated gift account
    const deactivated = await createGiftAccountAPI(
      auth.accessToken,
      couple.id,
      {
        bankName: 'DeactivatedBank',
        accountNumber: '2222222222',
        accountHolder: 'Deactivated Holder',
      },
    );
    await updateGiftAccountAPI(auth.accessToken, deactivated.id, {
      isActive: false,
    });
  });

  test('shows Gift Registry with active accounts only', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Gift Registry')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('ActiveBank')).toBeVisible();
    await expect(page.getByText('DeactivatedBank')).not.toBeVisible();
  });

  test('shows account info with copy buttons', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Gift Registry')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Account Holder')).toBeVisible();
    await expect(page.getByText('Account Number')).toBeVisible();
  });

  test('no edit/delete buttons on public page', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Gift Registry')).toBeVisible({
      timeout: 15000,
    });

    // Within the gift section, there should be no Edit or Delete buttons
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });
});

// ─── Suite 7: Frontend — Albums on Public page ──────────────────────

test.describe('Frontend — Albums on Public page', () => {
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-album-pub-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Album Public User');
    const couple = await createCoupleAPI(
      auth.accessToken,
      `Album Public Test ${uniqueSuffix}`,
      { anniversary: '2023-01-01', bio: 'A love story with albums' },
    );
    coupleSlug = couple.slug;

    const album = await createAlbumAPI(auth.accessToken, couple.id, {
      title: 'Public Album',
      description: 'Visible on public page',
    });

    await addAlbumPhotoAPI(auth.accessToken, album.id, {
      file: TINY_PNG_BASE64,
      caption: 'Photo 1',
      sortOrder: 0,
    });
    await addAlbumPhotoAPI(auth.accessToken, album.id, {
      file: TINY_PNG_BASE64,
      caption: 'Photo 2',
      sortOrder: 1,
    });
  });

  test('shows Photo Albums section', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Photo Albums')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Public Album')).toBeVisible();
    await expect(page.getByText('2 photos')).toBeVisible();
  });

  test('expand album shows gallery', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Photo Albums')).toBeVisible({
      timeout: 15000,
    });

    // Click the album button to expand
    await page.getByText('Public Album').click();

    // Gallery images should appear
    await expect(page.locator('img[alt="Photo 1"]').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('collapse album hides gallery', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Photo Albums')).toBeVisible({
      timeout: 15000,
    });

    // Expand
    await page.getByText('Public Album').click();
    await expect(page.locator('img[alt="Photo 1"]').first()).toBeVisible({
      timeout: 10000,
    });

    // Collapse
    await page.getByText('Public Album').click();
    await expect(
      page.locator('img[alt="Photo 1"]').first(),
    ).not.toBeVisible({ timeout: 5000 });
  });
});

// ─── Suite 8: Frontend — Public page with no gifts/albums ───────────

test.describe('Frontend — Public page with no gifts/albums', () => {
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-empty-pub-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'Password123', 'Empty Public User');
    const couple = await createCoupleAPI(
      auth.accessToken,
      `Empty Public Test ${uniqueSuffix}`,
      { anniversary: '2023-01-01', bio: 'No gifts or albums' },
    );
    coupleSlug = couple.slug;
  });

  test('no Gift Registry when empty', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to fully load
    await expect(
      page.getByText(`Empty Public Test ${uniqueSuffix}`),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText('Gift Registry')).toHaveCount(0);
  });

  test('no Photo Albums when empty', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText(`Empty Public Test ${uniqueSuffix}`),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText('Photo Albums')).toHaveCount(0);
  });
});
