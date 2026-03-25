import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles',
};

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { name: true } },
      translations: {
        select: { locale: true, title: true, excerpt: true },
      },
    },
  });

  // Build locale-aware post data
  const postsWithLocale = posts.map((post) => {
    const translation = post.translations.find((t) => t.locale === locale);
    return {
      id: post.id,
      title: translation?.title || post.title,
      slug: post.slug,
      excerpt: translation?.excerpt || post.excerpt,
      tags: post.tags,
      publishedAt: post.publishedAt,
      author: post.author,
      hasTranslation: !!translation,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              Our Blog
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Read our latest articles and insights
          </p>
        </div>

        {postsWithLocale.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {postsWithLocale.map((post) => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                <Card className="card-hover h-full border-0 shadow-lg shadow-brand-500/5 bg-white dark:bg-slate-900">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        {post.publishedAt ? formatDate(post.publishedAt) : ''}
                      </div>
                      {post.hasTranslation && (
                        <span className="text-xs bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 px-2 py-1 rounded-full uppercase">
                          {locale}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {post.author.name}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
