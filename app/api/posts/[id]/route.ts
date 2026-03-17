import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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
  const { title, slug, contentMDX, excerpt, status, tags } = body;

  // Check if slug is being changed and if it's unique
  if (slug) {
    const existingPost = await prisma.post.findFirst({
      where: { slug: slugify(slug), NOT: { id } },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug already exists. Please use a different slug.' },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};

  if (title) updateData.title = title;
  if (slug) updateData.slug = slugify(slug);
  if (contentMDX) updateData.contentMDX = contentMDX;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (status) {
    updateData.status = status;
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }
  }
  if (tags) updateData.tags = tags;

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(post);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
