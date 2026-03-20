import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Build Something');
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('About');
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('team page loads', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('h1')).toContainText('Team');
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Blog');
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy');
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText('Terms');
  });
});

test.describe('Header Navigation', () => {
  test('header has navigation links', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('navigation links navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Click Blog link
    await page.click('text=Blog');
    await expect(page).toHaveURL(/\/blog/);

    // Click Team link
    await page.click('text=Team');
    await expect(page).toHaveURL(/\/team/);

    // Click About link
    await page.click('text=About');
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe('Footer Navigation', () => {
  test('footer has links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('footer links navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Click Privacy link in footer
    await page.click('footer >> text=Privacy');
    await expect(page).toHaveURL(/\/privacy/);

    // Click Terms link in footer
    await page.click('footer >> text=Terms');
    await expect(page).toHaveURL(/\/terms/);
  });
});

test.describe('Accessibility', () => {
  test('page has proper language attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('main content has proper landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main#main-content')).toBeVisible();
  });

  test('skip link exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.skip-link')).toBeVisible();
  });
});
