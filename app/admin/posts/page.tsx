'use client';

import { useState, useOptimistic, startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

export default function AdminPostsPage({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setOptimisticPosts] = useOptimistic(
    initialPosts,
    (state: Post[], updatedPosts: Post[]) => updatedPosts
  );
  const router = useRouter();

  async function toggleStatus(post: Post) {
    const newStatus = post.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';

    // Optimistic update wrapped with startTransition
    startTransition(() => {
      setOptimisticPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, status: newStatus } : p
        )
      );
    });

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        router.refresh();
      }
    } catch {
      router.refresh();
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    startTransition(() => {
      setOptimisticPosts(posts.filter((p) => p.id !== id));
    });

    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        router.refresh();
      }
    } catch {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link href="/admin/posts/new">
          <Button>New Post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Slug</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b">
                      <td className="py-3 pr-4">{post.title}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500">{post.slug}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(post)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {post.status === 'DRAFT' ? 'Publish' : 'Unpublish'}
                          </button>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-sm text-green-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
