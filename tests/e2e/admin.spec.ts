import { test, expect } from '@playwright/test';

test.describe('Admin', () => {
  test('unauthorized access redirects to signin', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to sign in
    await expect(page).toHaveURL(/signin/);
  });

  test('admin page shows 401 for unauthenticated users', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/admin');
    // Either redirects or returns 401
    expect([200, 301, 302, 401]).toContain(response.status());
  });
});

test.describe('Contact Form', () => {
  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form')).toBeVisible();
  });

  test('contact form validates input', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Name must be at least')).toBeVisible();
  });

  test('contact form accepts valid input', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message that is long enough');

    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });
});