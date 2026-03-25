import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ClapButton } from '@/components/ClapButton';
import { CommentSection } from '@/components/CommentSection';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const translation = post.translations.find((t) => t.locale === locale);
  const title = translation?.title || post.title;
  const excerpt = translation?.excerpt || post.excerpt;

  return {
    title,
    description: excerpt || undefined,
    openGraph: { title, description: excerpt || undefined, type: 'article' },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      translations: true,
    },
  });

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  // Get locale-aware content
  const translation = post.translations.find((t) => t.locale === locale);
  const displayTitle = translation?.title || post.title;
  const displayContent = translation?.content || post.content;
  const displayExcerpt = translation?.excerpt || post.excerpt;

  // Get clap count
  const clapCount = await prisma.clap.count({
    where: { postId: post.id },
  });

  // Check if current user has clapped
  let hasClapped = false;
  if (session?.user?.id) {
    const userClap = await prisma.clap.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });
    hasClapped = !!userClap;
  }

  // Get comments
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const commentsData = comments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }));

  return (
    <article className="container mx-auto py-12 md:py-24">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">{displayTitle}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{post.author.name}</span>
            <span>·</span>
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt && formatDate(post.publishedAt)}
            </time>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-gray-100 px-3 py-1 rounded dark:bg-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Clap Button */}
        <div className="mb-8">
          <ClapButton
            postId={post.id}
            initialClapCount={clapCount}
            initialHasClapped={hasClapped}
          />
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />

        {/* Comments Section */}
        <CommentSection postId={post.id} initialComments={commentsData} />
      </div>
    </article>
  );
}