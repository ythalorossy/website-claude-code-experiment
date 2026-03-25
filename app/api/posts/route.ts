import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where = status ? { status: status as 'DRAFT' | 'PUBLISHED' } : {};

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true, email: true },
      },
      translations: {
        select: { locale: true },
      },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const body = await request.json();
  const { title, slug, content, excerpt, status, tags } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: 'Title, slug, and content are required' },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });

  if (existingPost) {
    return NextResponse.json(
      { error: 'Slug already exists. Please use a different slug.' },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug: slugify(slug),
      content,
      excerpt,
      status: status || 'DRAFT',
      tags: tags || [],
      authorId: session.user.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}