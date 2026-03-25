import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AdminPostsClient } from '@/app/admin/posts/AdminPostsClient';
import { startTransition } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AdminPostsClient', () => {
  const initialPosts = [
    { id: '1', title: 'Post 1', slug: 'post-1', status: 'DRAFT' as const, updatedAt: '2024-01-01T00:00:00Z', translations: [] },
    { id: '2', title: 'Post 2', slug: 'post-2', status: 'PUBLISHED' as const, updatedAt: '2024-01-02T00:00:00Z', translations: [] },
    { id: '3', title: 'Post 3', slug: 'post-3', status: 'DRAFT' as const, updatedAt: '2024-01-03T00:00:00Z', translations: [] },
  ];

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', status: 'PUBLISHED' }),
    });
  });

  it('updates status optimistically when toggleStatus is called', async () => {
    render(<AdminPostsClient initialPosts={initialPosts} />);

    // Find the first DRAFT button (post 1)
    const draftBadge = screen.getAllByText('DRAFT')[0];
    expect(draftBadge).toBeInTheDocument();

    // Click the toggle button
    fireEvent.click(draftBadge);

    // Should immediately show PUBLISHED (optimistic update)
    await waitFor(() => {
      // Use getAllByText since there are multiple PUBLISHED badges
      expect(screen.getAllByText('PUBLISHED').length).toBeGreaterThan(1);
    });

    // Verify fetch was called
    expect(mockFetch).toHaveBeenCalledWith('/api/posts/1', expect.any(Object));
  });

  it('toggles back to DRAFT when clicking PUBLISHED button', async () => {
    render(<AdminPostsClient initialPosts={initialPosts} />);

    // Find the first PUBLISHED button
    const publishedBadge = screen.getAllByText('PUBLISHED')[0];
    expect(publishedBadge).toBeInTheDocument();

    // Click the toggle button
    fireEvent.click(publishedBadge);

    // Should immediately show DRAFT (optimistic update)
    await waitFor(() => {
      expect(screen.getAllByText('DRAFT').length).toBeGreaterThan(1);
    });
  });

  it('rapid toggles: second toggle uses fresh state', async () => {
    render(<AdminPostsClient initialPosts={initialPosts} />);

    // Get the first DRAFT badge (post 1)
    const draftBadge = screen.getAllByText('DRAFT')[0];

    // Mock fetch to resolve with a delay to simulate network latency
    let resolveFetch: (value: unknown) => void;
    mockFetch.mockImplementation(() => new Promise(resolve => {
      resolveFetch = resolve;
    }));

    // First click - starts the transition
    fireEvent.click(draftBadge);

    // At this point, posts state should have been updated optimistically
    // But if there's a bug, posts might be stale

    // Second click immediately after - should use the NEW state, not original
    // This is where the stale closure bug would manifest
    const draftBadgeAgain = screen.queryAllByText('DRAFT')[0];
    if (draftBadgeAgain) {
      // If DRAFT is still visible, click it again
      // With the bug, this might toggle back to original state instead of current
      fireEvent.click(draftBadgeAgain);
    }

    // Resolve the fetch
    await act(async () => {
      resolveFetch!({ id: '1', status: 'PUBLISHED' });
    });

    // After all transitions complete, we should see PUBLISHED
    await waitFor(() => {
      expect(screen.getAllByText('PUBLISHED').length).toBeGreaterThan(1);
    });
  });
});
