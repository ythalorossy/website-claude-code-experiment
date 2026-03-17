'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { slugify } from '@/lib/utils';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  contentMDX: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      contentMDX: '',
      excerpt: '',
      tags: '',
      status: 'DRAFT',
    },
  });

  const title = watch('title');

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const post = await response.json();
          setValue('title', post.title);
          setValue('slug', post.slug);
          setValue('contentMDX', post.contentMDX);
          setValue('excerpt', post.excerpt || '');
          setValue('tags', post.tags?.join(', ') || '');
          setValue('status', post.status);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, setValue]);

  function generateSlug() {
    if (title) {
      setValue('slug', slugify(title));
    }
  }

  async function onSubmit(data: PostFormData) {
    setIsSubmitting(true);
    setError(null);

    const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags,
        }),
      });

      if (response.ok) {
        router.push('/admin/posts');
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to update post');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              id="title"
              placeholder="Post title"
              error={errors.title?.message}
              {...register('title')}
              onBlur={generateSlug}
            />

            <Input
              label="Slug"
              id="slug"
              placeholder="post-slug"
              error={errors.slug?.message}
              {...register('slug')}
            />

            <Textarea
              label="Content (MDX)"
              id="contentMDX"
              placeholder="Write your content in MDX format..."
              rows={20}
              error={errors.contentMDX?.message}
              {...register('contentMDX')}
            />

            <Textarea
              label="Excerpt"
              id="excerpt"
              placeholder="Brief description for the post..."
              rows={3}
              error={errors.excerpt?.message}
              {...register('excerpt')}
            />

            <Input
              label="Tags (comma separated)"
              id="tags"
              placeholder="nextjs, react, tutorial"
              {...register('tags')}
            />

            <Select
              label="Status"
              id="status"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Post'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/posts')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}