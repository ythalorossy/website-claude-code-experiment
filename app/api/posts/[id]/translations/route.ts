import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post.translations);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { locale, title, content, excerpt } = body;

  if (!locale || !title || !content) {
    return NextResponse.json(
      { error: 'Locale, title, and content are required' },
      { status: 400 }
    );
  }

  if (locale === 'en') {
    return NextResponse.json(
      { error: 'Cannot create translation for English. Edit the main post.' },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const translation = await prisma.postTranslation.upsert({
    where: { postId_locale: { postId: id, locale } },
    update: { title, content, excerpt },
    create: { postId: id, locale, title, content, excerpt },
  });

  return NextResponse.json(translation, { status: 201 });
}
