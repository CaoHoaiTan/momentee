import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/graphql';
const uniqueSuffix = Date.now();

// Helper: register a user via GraphQL and return tokens
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

// Helper: login via the UI
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
  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}

// Helper: create milestone via API
async function createMilestoneAPI(
  accessToken: string,
  coupleId: string,
  input: { title: string; date: string; description?: string; icon?: string },
) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `mutation CreateMilestone($coupleId: ID!, $input: MilestoneInput!) {
        createMilestone(coupleId: $coupleId, input: $input) { id coupleId title description date icon sortOrder createdAt }
      }`,
      variables: { coupleId, input },
    }),
  });
  const json = await res.json();
  return json.data.createMilestone;
}

// Helper: create couple via API
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

// ─── Test 1: GraphQL API — Couple CRUD ──────────────────────────────

test.describe('GraphQL API — Couple operations', () => {
  let accessToken: string;
  let coupleId: string;
  let coupleSlug: string;
  let inviteCode: string;

  test('register fresh user and create couple', async () => {
    const email = `e2e-creator-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'password123', 'Creator User');
    expect(auth.user.email).toBe(email);
    accessToken = auth.accessToken;

    const couple = await createCoupleAPI(
      accessToken,
      `E2E Couple ${uniqueSuffix}`,
      { anniversary: '2024-02-14', bio: 'Test couple bio' },
    );

    expect(couple.displayName).toBe(`E2E Couple ${uniqueSuffix}`);
    expect(couple.slug).toContain('e2e-couple');
    expect(couple.inviteCode).toBeTruthy();
    expect(couple.bio).toBe('Test couple bio');
    expect(couple.theme).toBe('coral');
    expect(couple.isPublic).toBe(true);

    coupleId = couple.id;
    coupleSlug = couple.slug;
    inviteCode = couple.inviteCode;
  });

  test('myCouple query returns the created couple', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query { myCouple { id slug displayName daysTogether totalWishes totalPhotos partner1 { id name } partner2 { id name } } }`,
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.myCouple.id).toBe(coupleId);
    expect(json.data.myCouple.partner1).toBeTruthy();
    expect(json.data.myCouple.partner2).toBeNull();
    expect(json.data.myCouple.daysTogether).toBeGreaterThan(0);
  });

  test('couple query by slug returns public data', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query Couple($slug: String!) { couple(slug: $slug) { id displayName isPublic viewCount } }`,
        variables: { slug: coupleSlug },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.couple.displayName).toBe(`E2E Couple ${uniqueSuffix}`);
  });

  test('update couple changes fields', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation UpdateCouple($id: ID!, $input: UpdateCoupleInput!) {
          updateCouple(id: $id, input: $input) { id displayName bio theme isPublic slug }
        }`,
        variables: {
          id: coupleId,
          input: {
            displayName: `Updated Couple ${uniqueSuffix}`,
            bio: 'Updated bio',
            theme: 'teal',
          },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();

    const couple = json.data.updateCouple;
    expect(couple.displayName).toBe(`Updated Couple ${uniqueSuffix}`);
    expect(couple.bio).toBe('Updated bio');
    expect(couple.theme).toBe('teal');
    expect(couple.slug).toContain('updated-couple');
    coupleSlug = couple.slug;
  });

  test('acceptInvite joins partner2', async () => {
    const partnerEmail = `e2e-partner-${uniqueSuffix}@test.dev`;
    const partnerAuth = await registerUser(
      partnerEmail,
      'password123',
      'Partner User',
    );

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerAuth.accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation AcceptInvite($inviteCode: String!) {
          acceptInvite(inviteCode: $inviteCode) { id partner1 { id name } partner2 { id name } }
        }`,
        variables: { inviteCode },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.acceptInvite.partner2).toBeTruthy();
    expect(json.data.acceptInvite.partner2.name).toBe('Partner User');
  });

  test('incrementViewCount works', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation IncrementViewCount($slug: String!) { incrementViewCount(slug: $slug) }`,
        variables: { slug: coupleSlug },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.incrementViewCount).toBe(true);
  });

  test('inviteCode is hidden for non-members', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query Couple($slug: String!) { couple(slug: $slug) { inviteCode } }`,
        variables: { slug: coupleSlug },
      }),
    });
    const json = await res.json();
    expect(json.data.couple.inviteCode).toBeNull();
  });
});

// ─── Test 2: Frontend — Onboarding Flow ─────────────────────────────

test.describe('Frontend — Onboarding wizard', () => {
  const email = `e2e-onboard-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    await registerUser(email, password, 'Onboard User');
  });

  test('redirects to onboarding when no couple exists', async ({ page }) => {
    await loginViaUI(page, email, password);
    // Should end up at onboarding since user has no couple
    await page.waitForURL('**/onboarding', { timeout: 10000 });
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('completes 3-step onboarding wizard', async ({ page }) => {
    // Fresh user for this test
    const email2 = `e2e-onboard2-${uniqueSuffix}@test.dev`;
    await registerUser(email2, password, 'Onboard User 2');
    await loginViaUI(page, email2, password);

    // Should redirect to onboarding
    await page.waitForURL('**/onboarding', { timeout: 10000 });

    // Step 1: Couple name
    await expect(
      page.getByText("What's your couple name?"),
    ).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('e.g. Minh & Linh').fill(
      `Onboard Couple ${uniqueSuffix}`,
    );
    await expect(page.getByText('momentee.dev/')).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2: Anniversary
    await expect(
      page.getByText('When did your love story begin?'),
    ).toBeVisible({ timeout: 5000 });
    await page.locator('input[type="date"]').fill('2023-06-15');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: Bio
    await expect(
      page.getByText('Tell your story'),
    ).toBeVisible({ timeout: 5000 });
    await page
      .getByPlaceholder('How did you two meet?')
      .fill('We met at a coffee shop');
    await page.getByRole('button', { name: 'Create Couple Page' }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

// ─── Test 3: Frontend — Dashboard with couple data ──────────────────

test.describe('Frontend — Dashboard', () => {
  const email = `e2e-dash-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Dashboard User');
    await createCoupleAPI(auth.accessToken, `Dash Couple ${uniqueSuffix}`, {
      anniversary: '2022-01-01',
    });
  });

  test('shows stats and quick actions for user with couple', async ({
    page,
  }) => {
    await loginViaUI(page, email, password);

    // Should go to dashboard (user has a couple)
    await expect(
      page.getByText('Welcome back,'),
    ).toBeVisible({ timeout: 15000 });

    // Stats cards should be visible
    await expect(page.getByText('Days Together')).toBeVisible();
    await expect(page.getByText('Total Wishes')).toBeVisible();
    await expect(page.getByText('Total Photos')).toBeVisible();
    await expect(page.getByText('Page Views')).toBeVisible();

    // Quick actions
    await expect(page.getByText('Create Post')).toBeVisible();
    await expect(page.getByText('View Public Page')).toBeVisible();

    // Invite partner section (no partner2)
    await expect(page.getByText('Invite Your Partner')).toBeVisible();
  });
});

// ─── Test 4: Frontend — Public couple page ──────────────────────────

test.describe('Frontend — Public couple page', () => {
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-public-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'password123', 'Public Test');
    const couple = await createCoupleAPI(
      auth.accessToken,
      `Public Page Test ${uniqueSuffix}`,
      { anniversary: '2023-01-01', bio: 'A beautiful love story' },
    );
    coupleSlug = couple.slug;
  });

  test('renders couple page with hero and stats', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);

    // Hero section
    await expect(
      page.getByText(`Public Page Test ${uniqueSuffix}`),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('A beautiful love story')).toBeVisible();

    // Stats (use .first() to avoid strict mode with duplicate text)
    await expect(page.getByText('Days Together').first()).toBeVisible();
    await expect(page.getByText('Wishes').first()).toBeVisible();
    await expect(page.getByText('Photos').first()).toBeVisible();
    await expect(page.getByText('Views').first()).toBeVisible();

    // Share button
    await expect(
      page.getByRole('button', { name: 'Share' }),
    ).toBeVisible();

    // Wishes section
    await expect(page.getByText('Wishes & Blessings')).toBeVisible();
  });

  test('shows 404 for invalid slug', async ({ page }) => {
    await page.goto('/nonexistent-slug-12345');
    await expect(page.getByText('Page Not Found')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Test 5: Frontend — Settings page ───────────────────────────────

test.describe('Frontend — Settings', () => {
  const email = `e2e-settings-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Settings User');
    await createCoupleAPI(auth.accessToken, `Settings Couple ${uniqueSuffix}`, {
      bio: 'Original bio',
    });
  });

  test('loads settings with current couple data', async ({ page }) => {
    await loginViaUI(page, email, password);

    // Wait for dashboard to load, then navigate to settings via sidebar
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.waitForURL('**/settings', { timeout: 5000 });

    // Wait for form to populate
    await expect(
      page.getByText('Manage your couple page settings.'),
    ).toBeVisible({ timeout: 10000 });

    // Form fields should have values
    const nameInput = page.locator('input').first();
    await expect(nameInput).toHaveValue(
      `Settings Couple ${uniqueSuffix}`,
      { timeout: 10000 },
    );

    // Theme selector
    await expect(page.getByText('Theme Color')).toBeVisible();

    // Privacy toggle
    await expect(page.getByText('Public Page')).toBeVisible();

    // Invite section (no partner2)
    await expect(page.getByText('Invite Partner')).toBeVisible();

    // Danger zone
    await expect(page.getByText('Danger Zone')).toBeVisible();
  });

  test('updates couple settings', async ({ page }) => {
    await loginViaUI(page, email, password);

    // Wait for dashboard, then navigate to settings
    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.waitForURL('**/settings', { timeout: 5000 });

    // Wait for form
    const nameInput = page.locator('input').first();
    await expect(nameInput).toHaveValue(
      `Settings Couple ${uniqueSuffix}`,
      { timeout: 10000 },
    );

    // Update display name
    await nameInput.clear();
    await nameInput.fill(`Renamed Couple ${uniqueSuffix}`);

    // Change theme to teal
    await page.locator('button[title="Teal"]').click();

    // Save
    await page.getByRole('button', { name: 'Save Settings' }).click();
    await expect(page.getByText('Settings saved!')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Test 6: GraphQL API — Milestone operations ─────────────────────

test.describe('GraphQL API — Milestone operations', () => {
  let accessToken: string;
  let coupleId: string;
  let milestoneId: string;

  test.beforeAll(async () => {
    const email = `e2e-ms-api-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'password123', 'Milestone API User');
    accessToken = auth.accessToken;
    const couple = await createCoupleAPI(
      accessToken,
      `MS API Couple ${uniqueSuffix}`,
      { anniversary: '2023-06-01' },
    );
    coupleId = couple.id;
  });

  test('createMilestone returns correct fields', async () => {
    const milestone = await createMilestoneAPI(accessToken, coupleId, {
      title: 'First Date',
      date: '2023-06-15',
      description: 'Our very first date',
      icon: '💕',
    });

    expect(milestone.title).toBe('First Date');
    expect(milestone.date).toBeTruthy();
    expect(milestone.description).toBe('Our very first date');
    expect(milestone.icon).toBe('💕');
    expect(milestone.sortOrder).toBe(0);
    expect(milestone.coupleId).toBe(coupleId);
    expect(milestone.id).toBeTruthy();

    milestoneId = milestone.id;
  });

  test('milestones query returns list', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Milestones($coupleId: ID!) { milestones(coupleId: $coupleId) { id title date sortOrder } }`,
        variables: { coupleId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.milestones.length).toBeGreaterThanOrEqual(1);
    expect(json.data.milestones[0].title).toBe('First Date');
  });

  test('milestone query returns single milestone', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `query Milestone($id: ID!) { milestone(id: $id) { id title description date icon } }`,
        variables: { id: milestoneId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.milestone.title).toBe('First Date');
    expect(json.data.milestone.description).toBe('Our very first date');
    expect(json.data.milestone.icon).toBe('💕');
  });

  test('updateMilestone changes fields', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation UpdateMilestone($id: ID!, $input: UpdateMilestoneInput!) {
          updateMilestone(id: $id, input: $input) { id title description }
        }`,
        variables: {
          id: milestoneId,
          input: { title: 'Updated First Date', description: 'Updated description' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.updateMilestone.title).toBe('Updated First Date');
    expect(json.data.updateMilestone.description).toBe('Updated description');
  });

  test('deleteMilestone returns true', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation DeleteMilestone($id: ID!) { deleteMilestone(id: $id) }`,
        variables: { id: milestoneId },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    expect(json.data.deleteMilestone).toBe(true);
  });

  test('reorderMilestones updates sortOrder', async () => {
    const m1 = await createMilestoneAPI(accessToken, coupleId, {
      title: 'Milestone A',
      date: '2023-07-01',
    });
    const m2 = await createMilestoneAPI(accessToken, coupleId, {
      title: 'Milestone B',
      date: '2023-08-01',
    });

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation ReorderMilestones($coupleId: ID!, $orderedIds: [ID!]!) {
          reorderMilestones(coupleId: $coupleId, orderedIds: $orderedIds) { id title sortOrder }
        }`,
        variables: { coupleId, orderedIds: [m2.id, m1.id] },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();

    const reordered = json.data.reorderMilestones;
    const milestoneB = reordered.find(
      (m: { title: string }) => m.title === 'Milestone B',
    );
    const milestoneA = reordered.find(
      (m: { title: string }) => m.title === 'Milestone A',
    );
    expect(milestoneB.sortOrder).toBeLessThan(milestoneA.sortOrder);
  });

  test('createMilestone without auth returns error', async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation CreateMilestone($coupleId: ID!, $input: MilestoneInput!) {
          createMilestone(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { title: 'Unauthorized', date: '2023-01-01' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  test('createMilestone on wrong couple returns error', async () => {
    const otherEmail = `e2e-ms-other-${uniqueSuffix}@test.dev`;
    const otherAuth = await registerUser(
      otherEmail,
      'password123',
      'Other User',
    );

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherAuth.accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation CreateMilestone($coupleId: ID!, $input: MilestoneInput!) {
          createMilestone(coupleId: $coupleId, input: $input) { id }
        }`,
        variables: {
          coupleId,
          input: { title: 'Wrong Couple', date: '2023-01-01' },
        },
      }),
    });
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});

// ─── Test 7: Frontend — Milestones page ─────────────────────────────

test.describe('Frontend — Milestones page', () => {
  const email = `e2e-ms-ui-${uniqueSuffix}@test.dev`;
  const password = 'password123';

  test.beforeAll(async () => {
    const auth = await registerUser(email, password, 'Milestone UI User');
    await createCoupleAPI(auth.accessToken, `MS UI Couple ${uniqueSuffix}`, {
      anniversary: '2023-01-01',
    });
  });

  test('shows empty state and add button', async ({ page }) => {
    await loginViaUI(page, email, password);

    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Milestones' }).click();
    await page.waitForURL('**/dashboard/milestones', { timeout: 5000 });

    await expect(page.getByText('No milestones yet')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: 'Add Milestone' }),
    ).toBeVisible();
  });

  test('create milestone via form', async ({ page }) => {
    await loginViaUI(page, email, password);

    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('link', { name: 'Milestones' }).click();
    await page.waitForURL('**/dashboard/milestones', { timeout: 5000 });

    await page.getByRole('button', { name: 'Add Milestone' }).click();

    // Fill the form
    await page.getByPlaceholder('e.g. First Date').fill('Our Anniversary');
    await page.locator('input[type="date"]').fill('2023-01-01');
    await page
      .getByPlaceholder('What made this moment special?')
      .fill('A wonderful day');

    // Submit — click the form's submit button
    await page.locator('button[type="submit"]').click();

    // Milestone should appear on page
    await expect(page.getByText('Our Anniversary')).toBeVisible({
      timeout: 10000,
    });
  });

  test('edit milestone', async ({ page }) => {
    await loginViaUI(page, email, password);

    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('link', { name: 'Milestones' }).click();
    await page.waitForURL('**/dashboard/milestones', { timeout: 5000 });

    // Wait for milestone to load
    await expect(page.getByText('Our Anniversary')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Edit' }).first().click();

    // Update title
    const titleInput = page.getByPlaceholder('e.g. First Date');
    await titleInput.clear();
    await titleInput.fill('Updated Anniversary');

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Updated Anniversary')).toBeVisible({
      timeout: 10000,
    });
  });

  test('delete milestone', async ({ page }) => {
    await loginViaUI(page, email, password);

    await expect(page.getByText('Welcome back,')).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('link', { name: 'Milestones' }).click();
    await page.waitForURL('**/dashboard/milestones', { timeout: 5000 });

    // Wait for milestone to load
    await expect(page.getByText('Updated Anniversary')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();

    // Confirm delete in modal
    await expect(page.getByText('Delete Milestone')).toBeVisible({
      timeout: 5000,
    });
    await page
      .locator('.fixed')
      .getByRole('button', { name: 'Delete' })
      .click();

    // Milestone should be gone
    await expect(page.getByText('No milestones yet')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Test 8: Frontend — Public page timeline ────────────────────────

test.describe('Frontend — Public page timeline', () => {
  let coupleSlug: string;

  test.beforeAll(async () => {
    const email = `e2e-ms-pub-${uniqueSuffix}@test.dev`;
    const auth = await registerUser(email, 'password123', 'Public MS User');
    const couple = await createCoupleAPI(
      auth.accessToken,
      `Public MS Test ${uniqueSuffix}`,
      { anniversary: '2023-01-01', bio: 'A love story with milestones' },
    );
    coupleSlug = couple.slug;

    await createMilestoneAPI(auth.accessToken, couple.id, {
      title: 'First Meeting',
      date: '2023-01-15',
      description: 'We met at a café',
      icon: '☕',
    });
    await createMilestoneAPI(auth.accessToken, couple.id, {
      title: 'First Trip',
      date: '2023-06-20',
      description: 'Road trip to Dalat',
      icon: '✈️',
    });
  });

  test('renders timeline with milestones', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Our Timeline')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('First Meeting')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('First Trip')).toBeVisible({
      timeout: 10000,
    });
  });

  test('no edit/delete buttons on public page', async ({ page }) => {
    await page.goto(`/${coupleSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Our Timeline')).toBeVisible({
      timeout: 15000,
    });

    // Edit and Delete buttons should NOT be visible
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  });
});
