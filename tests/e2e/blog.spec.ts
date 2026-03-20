import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog page loads and displays posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Blog');
  });

  test('blog post page renders', async ({ page }) => {
    await page.goto('/blog/welcome-to-our-blog');
    await expect(page.locator('article')).toBeVisible();
  });

  test('blog page has proper heading structure', async ({ page }) => {
    await page.goto('/blog');
    const heading = page.locator('h1');
    await expect(heading).toHaveCount(1);
  });
});

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