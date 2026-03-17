import { prisma } from '@/lib/db';
import AdminPostsPage from './page';

export default async function AdminPostsLayout() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
    },
  });

  return <AdminPostsPage initialPosts={posts.map(p => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />;
}