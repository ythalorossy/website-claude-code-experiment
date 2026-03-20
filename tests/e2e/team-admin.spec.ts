import { test, expect, Page } from '@playwright/test';

/**
 * Admin Team Dashboard Tests
 *
 * Tests for the Team Members stat card on the admin dashboard
 * and navigation to team management.
 */

// Helper function to sign in as admin
async function signInAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.click('button[type="submit"]');
  await page.waitForURL(/(\/admin|\/)$/, { timeout: 10000 });
}

test.describe('Admin Dashboard - Team Section', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin');
  });

  test('team members stat card is visible on dashboard', async ({ page }) => {
    await expect(page.locator('text=Team Members')).toBeVisible();
  });

  test('team members stat card shows a number', async ({ page }) => {
    // The Team Members card should display a count
    // Card structure: Card > CardHeader(CardTitle) + CardContent(div.text-3xl)
    const teamCard = page.locator('text=Team Members').locator('..').locator('..');
    await expect(teamCard).toBeVisible();
    // The number is in the CardContent div with text-3xl font
    const countText = await teamCard.locator('.text-3xl').textContent();
    expect(countText).toMatch(/\d+/);
  });

  test('can navigate to team management from dashboard', async ({ page }) => {
    // Click on Team in the sidebar
    await page.click('aside >> text=Team');
    await expect(page).toHaveURL(/admin\/team/);
    await expect(page.locator('h1')).toContainText('Team Members');
  });
});

test.describe('Admin Dashboard - Stats Cards Layout', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin');
  });

  test('all five stat cards are present', async ({ page }) => {
    await expect(page.locator('text=Total Posts')).toBeVisible();
    await expect(page.locator('text=Published')).toBeVisible();
    await expect(page.locator('text=Drafts')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
  });
});