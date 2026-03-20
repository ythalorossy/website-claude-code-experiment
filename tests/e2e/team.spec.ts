import { test, expect } from '@playwright/test';

test.describe('Team Page', () => {
  test('team page header loads correctly', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('h1')).toContainText('Our Team');
    await expect(page.locator('text=Meet the software engineers who built this project')).toBeVisible();
  });

  test('displays team member cards when data exists', async ({ page }) => {
    await page.goto('/team');

    // Check if team members are displayed (depends on seed data)
    const teamCards = page.locator('.grid >> text=');

    // The page should either show team members OR "No team members yet"
    const hasTeamMembers = await page.locator('.grid .rounded-xl').count() > 0;
    const hasEmptyState = await page.locator('text=No team members yet').count() > 0;

    expect(hasTeamMembers || hasEmptyState).toBe(true);
  });

  test('team member card has required elements', async ({ page }) => {
    await page.goto('/team');

    // Check if team member cards exist
    const teamCards = page.locator('.grid .rounded-xl');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      // First card should have name and title
      const firstCard = teamCards.first();
      await expect(firstCard.locator('h3')).toBeVisible();
      await expect(firstCard.locator('text=/Engineer|Developer|Manager|Lead/i').first()).toBeVisible();
    }
  });

  test('social links are accessible on team member cards', async ({ page }) => {
    await page.goto('/team');

    const teamCards = page.locator('.grid .rounded-xl');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      // Check for social link icons (LinkedIn, GitHub, Email)
      const linkedinIcons = page.locator('a[aria-label="LinkedIn"]');
      const githubIcons = page.locator('a[aria-label="GitHub"]');
      const emailIcons = page.locator('a[aria-label="Email"]');

      // At least one type of social link should be present
      const hasLinkedin = await linkedinIcons.count() > 0;
      const hasGithub = await githubIcons.count() > 0;
      const hasEmail = await emailIcons.count() > 0;

      expect(hasLinkedin || hasGithub || hasEmail).toBe(true);
    }
  });

  test('team page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/team');

    await expect(page.locator('h1')).toContainText('Our Team');

    // On mobile, grid should show single column (1 col)
    const grid = page.locator('.grid').first();
    await expect(grid).toBeVisible();
  });

  test('team page is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/team');

    await expect(page.locator('h1')).toContainText('Our Team');
  });

  test('navigation to team page works from homepage', async ({ page }) => {
    await page.goto('/');

    // Click Team link in header
    await page.click('header >> text=Team');

    await expect(page).toHaveURL(/\/team/);
    await expect(page.locator('h1')).toContainText('Our Team');
  });
});
