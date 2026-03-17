import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { ClapButton } from '@/components/ClapButton';
import { CommentSection } from '@/components/CommentSection';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

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
          <h1 className="text-4xl font-bold md:text-5xl">{post.title}</h1>
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

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Render MDX content - in a real implementation, use next-mdx-remote or similar */}
          {post.contentMDX.split('\n').map((line, i) => {
            if (line.startsWith('# ')) {
              return <h1 key={i}>{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={i}>{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i}>{line.slice(4)}</h3>;
            }
            if (line.startsWith('- ')) {
              return <li key={i}>{line.slice(2)}</li>;
            }
            if (line.startsWith('```')) {
              return null;
            }
            if (line.trim()) {
              return <p key={i}>{line}</p>;
            }
            return null;
          })}
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} initialComments={commentsData} />
      </div>
    </article>
  );
}