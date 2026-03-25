'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { slugify } from '@/lib/utils';
import { RichTextEditorHandle } from '@/components/RichTextEditor';
import { TranslationEditor } from '@/components/TranslationEditor';

const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false }
);

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

type PostFormData = z.infer<typeof postSchema>;

interface Translation {
  locale: string;
  title: string;
  content: string;
  excerpt?: string;
}

interface PostWithTranslations {
  title: string;
  content: string;
  excerpt?: string;
  translations: Translation[];
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [post, setPost] = useState<PostWithTranslations | null>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);

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
      content: '',
      excerpt: '',
      tags: '',
      status: 'DRAFT',
    },
  });

  const title = watch('title');

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const post = await response.json();
          setPost(post);
          setValue('title', post.title);
          setValue('slug', post.slug);
          setValue('excerpt', post.excerpt || '');
          setValue('tags', post.tags?.join(', ') || '');
          setValue('status', post.status);
          setInitialContent(post.content);
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
    const content = editorRef.current?.getHTML() ?? '';
    setIsSubmitting(true);
    setError(null);

    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          content,
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

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <RichTextEditor
                ref={editorRef}
                toolbar="post"
                placeholder="Write your content..."
                content={initialContent}
                onUpdate={() => {
                  const html = editorRef.current?.getHTML() ?? '';
                  setValue('content', html, { shouldValidate: true });
                }}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

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

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTranslations(!showTranslations)}
              className="mt-4"
            >
              {showTranslations ? 'Hide' : 'Manage'} Translations
            </Button>

            {showTranslations && post && (
              <div className="mt-6">
                <TranslationEditor post={post} postId={postId} />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
