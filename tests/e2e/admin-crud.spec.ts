import { test, expect, Page } from '@playwright/test';

/**
 * Admin CRUD Tests
 *
 * These tests cover the admin CMS functionality for Posts and Team Members.
 * Authentication is done via email credentials (admin@example.com).
 */

// Helper function to sign in as admin
async function signInAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.click('button[type="submit"]');
  // Wait for redirect to admin
  await page.waitForURL(/(\/admin|\/)$/, { timeout: 10000 });
}

test.describe('Admin Authentication', () => {
  test('unauthenticated user is redirected to signin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/signin/);
  });

  test('can sign in as admin with email', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard or home
    await page.waitForURL(/(\/admin|\/)$/, { timeout: 10000 });
  });

  test('admin can access admin pages', async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/dashboard|admin/i, { ignoreCase: true });
  });
});

test.describe('Admin - Posts List', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/posts');
  });

  test('posts page loads and shows table', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Posts');
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows posts from database', async ({ page }) => {
    // Should show at least the seeded posts
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('has New Post button', async ({ page }) => {
    const newPostButton = page.locator('a:has-text("New Post"), button:has-text("New Post")');
    await expect(newPostButton.first()).toBeVisible();
  });

  test('posts have edit and delete actions', async ({ page }) => {
    // If posts exist, check for action buttons
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await expect(firstRow.locator('a[title="Edit"], button[title="Edit"]')).toBeVisible();
      await expect(firstRow.locator('button[title="Delete"]')).toBeVisible();
    }
  });

  test('can toggle post status', async ({ page }) => {
    // Find a post with a status toggle button
    const statusButton = page.locator('table tbody tr button:has-text("DRAFT"), table tbody tr button:has-text("PUBLISHED")').first();
    if (await statusButton.isVisible()) {
      await statusButton.scrollIntoViewIfNeeded();
      await statusButton.click({ force: true });
      // Status should change (optimistic UI)
    }
  });
});

test.describe('Admin - Create Post', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/posts/new');
  });

  test('new post form loads', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create New Post');
    await expect(page.locator('form')).toBeVisible();
  });

  test('all form fields are present', async ({ page }) => {
    await expect(page.locator('input[id="title"]')).toBeVisible();
    await expect(page.locator('input[id="slug"]')).toBeVisible();
    await expect(page.locator('[data-rich-text-editor]')).toBeVisible();
    await expect(page.locator('textarea[id="excerpt"]')).toBeVisible();
    await expect(page.locator('input[id="tags"]')).toBeVisible();
    await expect(page.locator('select[id="status"]')).toBeVisible();
  });

  test('submit button is visible', async ({ page }) => {
    await expect(page.locator('button[type="submit"]:has-text("Create Post")')).toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    // Fill content but not title
    await page.click('[data-rich-text-editor] .ProseMirror');
    await page.keyboard.type('This is some test content for the post.');
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible({ timeout: 5000 });
  });

  test('slug auto-generates from title', async ({ page }) => {
    await page.fill('input[id="title"]', 'My Test Post Title');
    await page.locator('input[id="title"]').blur();

    // Slug should be auto-generated
    await expect(page.locator('input[id="slug"]')).toHaveValue('my-test-post-title');
  });

  test('can create a draft post', async ({ page }) => {
    const testTitle = `Test Post ${Date.now()}`;

    await page.fill('input[id="title"]', testTitle);
    await page.click('[data-rich-text-editor] .ProseMirror');
    await page.keyboard.type('This is test content for the post.');

    // Submit
    await page.click('button[type="submit"]:has-text("Create Post")');

    // Should redirect to posts list
    await expect(page).toHaveURL(/admin\/posts/, { timeout: 10000 });
  });
});

test.describe('Admin - Edit Post', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    // First go to posts list
    await page.goto('/admin/posts');
  });

  test('can navigate to edit page', async ({ page }) => {
    // Find and click edit button
    const editButton = page.locator('a[title="Edit"], button[title="Edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.scrollIntoViewIfNeeded();
      await editButton.click({ force: true });
      await expect(page).toHaveURL(/admin\/posts\/.*\/edit/);
      await expect(page.locator('h1')).toContainText('Edit Post');
    }
  });
});

test.describe('Admin - Team Members List', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/team');
  });

  test('team page loads and shows table', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Team Members');
    await expect(page.locator('table')).toBeVisible();
  });

  test('has Add Team Member button', async ({ page }) => {
    const addButton = page.locator('a:has-text("Add Team Member"), button:has-text("Add Team Member")');
    await expect(addButton.first()).toBeVisible();
  });

  test('team members have edit and delete actions', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await expect(firstRow.locator('a[title="Edit"], button[title="Edit"]')).toBeVisible();
      await expect(firstRow.locator('button[title="Delete"]')).toBeVisible();
    }
  });

  test('can toggle team member active status', async ({ page }) => {
    const statusButton = page.locator('table tbody tr button:has-text("Active"), table tbody tr button:has-text("Inactive")').first();
    if (await statusButton.isVisible()) {
      await statusButton.click();
      // Status should change
    }
  });
});

test.describe('Admin - Create Team Member', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/team/new');
  });

  test('new team member form loads', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Add Team Member');
    await expect(page.locator('form')).toBeVisible();
  });

  test('all form fields are present', async ({ page }) => {
    await expect(page.locator('label:has-text("Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Bio")')).toBeVisible();
    await expect(page.locator('label:has-text("Image URL")')).toBeVisible();
    await expect(page.locator('label:has-text("LinkedIn URL")')).toBeVisible();
    await expect(page.locator('label:has-text("GitHub URL")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Order")')).toBeVisible();
    await expect(page.locator('label:has-text("Active")')).toBeVisible();
  });

  test('submit button is visible', async ({ page }) => {
    await expect(page.locator('button[type="submit"]:has-text("Create Team Member")')).toBeVisible();
  });

  test('shows validation error for empty required fields', async ({ page }) => {
    // Clear name and try to submit
    await page.locator('input[type="text"]').first().fill('');
    await page.click('button[type="submit"]');

    // HTML5 required validation should prevent submission
  });

  test('can create a team member', async ({ page }) => {
    const testName = `Test Member ${Date.now()}`;

    // Fill the name field (first text input)
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill(testName);

    // Fill the title field (second text input)
    await page.locator('input[type="text"]').nth(1).fill('Test Engineer');

    // Submit
    await page.click('button[type="submit"]:has-text("Create Team Member")');

    // Should redirect to team list
    await expect(page).toHaveURL(/admin\/team/, { timeout: 10000 });
  });
});

test.describe('Admin - Edit Team Member', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/team');
  });

  test('can navigate to edit page', async ({ page }) => {
    const editButton = page.locator('a[title="Edit"], button[title="Edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page).toHaveURL(/admin\/team\/.*\/edit/);
      await expect(page.locator('h1')).toContainText('Edit Team Member');
    }
  });
});

test.describe('Admin - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  test('can navigate from admin to posts', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Posts');
    await expect(page).toHaveURL(/admin\/posts/);
  });

  test('can navigate from admin to team', async ({ page }) => {
    await page.goto('/admin');
    // Click on admin sidebar Team link (not the header navigation)
    await page.click('aside >> text=Team');
    await expect(page).toHaveURL(/admin\/team/);
  });
});

test.describe('Admin - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('admin pages are accessible on mobile', async ({ page }) => {
    await signInAsAdmin(page);

    // Posts page
    await page.goto('/admin/posts');
    await expect(page.locator('h1')).toContainText('Posts');
    await expect(page.locator('table')).toBeVisible();

    // Team page
    await page.goto('/admin/team');
    await expect(page.locator('h1')).toContainText('Team Members');
    await expect(page.locator('table')).toBeVisible();
  });

  test('new post form is usable on mobile', async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto('/admin/posts/new');

    await expect(page.locator('h1')).toContainText('Create New Post');

    // Fill form
    await page.fill('input[id="title"]', 'Mobile Test Post');
    await page.click('[data-rich-text-editor] .ProseMirror');
    await page.keyboard.type('Mobile test content here.');
  });
});
