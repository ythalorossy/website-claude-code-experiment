import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AdminPostsClient } from './AdminPostsClient';

export default async function AdminPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin/posts');
  }

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      translations: {
        select: { locale: true },
      },
    },
  });

  // Convert Date to string for client component
  const initialPosts = posts.map((post) => ({
    ...post,
    updatedAt: post.updatedAt.toISOString(),
  }));

  return <AdminPostsClient initialPosts={initialPosts} />;
}
