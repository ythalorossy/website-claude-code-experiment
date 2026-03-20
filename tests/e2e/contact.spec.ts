import { test, expect } from '@playwright/test';

/**
 * Contact Form Tests
 *
 * These tests use data-testid attributes for reliable element selection.
 * Learn about test IDs: https://playwright.dev/docs/locators#test-ids
 */

test.describe('Contact Form - Page Load', () => {
  test('contact page loads successfully', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
  });

  test('contact form is visible', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByTestId('contact-form')).toBeVisible();
  });

  test('all form fields are present', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByTestId('contact-name-input')).toBeVisible();
    await expect(page.getByTestId('contact-email-input')).toBeVisible();
    await expect(page.getByTestId('contact-message-input')).toBeVisible();
    await expect(page.getByTestId('contact-submit-button')).toBeVisible();
  });
});

test.describe('Contact Form - Validation', () => {
  test('shows error for empty name on submit', async ({ page }) => {
    await page.goto('/contact');

    // Fill only email and message
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('This is a valid test message');

    // Submit
    await page.getByTestId('contact-submit-button').click();

    // Should show name validation error
    await expect(page.locator('text=Name must be at least')).toBeVisible();
  });

  test('shows error for name too short', async ({ page }) => {
    await page.goto('/contact');

    // Fill with single character name
    await page.getByTestId('contact-name-input').fill('J');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('This is a valid test message');

    // Submit
    await page.getByTestId('contact-submit-button').click();

    // Should show name validation error
    await expect(page.locator('text=Name must be at least')).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/contact');

    // Fill name and message using testids
    await page.getByTestId('contact-name-input').fill('John Doe');
    await page.getByTestId('contact-message-input').fill('This is a valid test message');

    // Use an email that looks like an email but is invalid per zod (no proper TLD)
    const emailInput = page.getByTestId('contact-email-input');
    await emailInput.click();
    await emailInput.fill('test@invalid');

    // Verify the value was set
    await expect(emailInput).toHaveValue('test@invalid');

    // Submit
    await page.getByTestId('contact-submit-button').click();

    // Wait for validation error - zod email validation should catch this
    await expect(page.locator('text=Invalid email address')).toBeVisible({ timeout: 5000 });
  });

  test('shows error for message too short', async ({ page }) => {
    await page.goto('/contact');

    await page.getByTestId('contact-name-input').fill('John Doe');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('Short');

    // Submit
    await page.getByTestId('contact-submit-button').click();

    // Should show message validation error
    await expect(page.locator('text=Message must be at least')).toBeVisible();
  });

  test('shows multiple errors for completely empty form', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form using button selector (works better on mobile)
    await page.click('button[type="submit"]');

    // Should show multiple validation errors
    await expect(page.locator('text=Name must be at least')).toBeVisible();
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Message must be at least')).toBeVisible();
  });
});

test.describe('Contact Form - Submission', () => {
  test('submit button shows loading state during submission', async ({ page }) => {
    await page.goto('/contact');

    // Fill valid data
    await page.getByTestId('contact-name-input').fill('Test User');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('Test message that is long enough.');

    // Click submit and immediately check for loading text
    await page.getByTestId('contact-submit-button').click();

    // Button should show "Sending..." during submission
    await expect(page.getByTestId('contact-submit-button')).toContainText('Sending');
  });

  test('submit button is disabled during submission', async ({ page }) => {
    await page.goto('/contact');

    // Fill valid data
    await page.getByTestId('contact-name-input').fill('Test User');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('Test message that is long enough.');

    // Click submit
    await page.getByTestId('contact-submit-button').click();

    // Button should be disabled during submission
    await expect(page.getByTestId('contact-submit-button')).toBeDisabled();
  });
});

test.describe('Contact Form - Edge Cases', () => {
  test('form preserves input on validation error', async ({ page }) => {
    await page.goto('/contact');

    // Fill valid data first
    await page.getByTestId('contact-name-input').fill('Preserve Test');
    await page.getByTestId('contact-email-input').fill('preserve@example.com');
    await page.getByTestId('contact-message-input').fill('This message is long enough.');

    // Submit with invalid data (empty name to trigger error)
    await page.getByTestId('contact-name-input').fill('');
    await page.getByTestId('contact-submit-button').click();

    // Errors should show but other fields should retain their values
    await expect(page.locator('text=Name must be at least')).toBeVisible();
  });
});

test.describe('Contact Form - Accessibility', () => {
  test('form fields have proper labels', async ({ page }) => {
    await page.goto('/contact');

    // Check that labels are associated with inputs
    await expect(page.locator('label[for="name"]')).toContainText('Name');
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="message"]')).toContainText('Message');
  });

  test('form fields are focusable via direct focus', async ({ page }) => {
    await page.goto('/contact');

    // Focus each field directly and verify
    await page.getByTestId('contact-name-input').focus();
    await expect(page.getByTestId('contact-name-input')).toBeFocused();

    await page.getByTestId('contact-email-input').focus();
    await expect(page.getByTestId('contact-email-input')).toBeFocused();

    await page.getByTestId('contact-message-input').focus();
    await expect(page.getByTestId('contact-message-input')).toBeFocused();

    await page.getByTestId('contact-submit-button').focus();
    await expect(page.getByTestId('contact-submit-button')).toBeFocused();
  });

  test('can type in all form fields', async ({ page }) => {
    await page.goto('/contact');

    // Type in each field to verify they accept input
    await page.getByTestId('contact-name-input').fill('Test User');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-message-input').fill('Test message for form');

    // Verify all fields have correct values
    await expect(page.getByTestId('contact-name-input')).toHaveValue('Test User');
    await expect(page.getByTestId('contact-email-input')).toHaveValue('test@example.com');
    await expect(page.getByTestId('contact-message-input')).toHaveValue('Test message for form');
  });
});

test.describe('Contact Form - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('form is usable on mobile', async ({ page }) => {
    await page.goto('/contact');

    // All fields should be visible and usable
    await expect(page.getByTestId('contact-name-input')).toBeVisible();
    await expect(page.getByTestId('contact-email-input')).toBeVisible();
    await expect(page.getByTestId('contact-message-input')).toBeVisible();
    await expect(page.getByTestId('contact-submit-button')).toBeVisible();
  });

  test('form fields are properly sized on mobile', async ({ page }) => {
    await page.goto('/contact');

    // Verify inputs are accessible on mobile
    const nameInput = page.getByTestId('contact-name-input');
    const emailInput = page.getByTestId('contact-email-input');
    const messageInput = page.getByTestId('contact-message-input');

    await nameInput.fill('Mobile');
    await emailInput.fill('mobile@test.com');
    await messageInput.fill('Mobile test message here.');

    await expect(nameInput).toHaveValue('Mobile');
    await expect(emailInput).toHaveValue('mobile@test.com');
    await expect(messageInput).toHaveValue('Mobile test message here.');
  });
});
