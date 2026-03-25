import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string; locale: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.postTranslation.delete({
      where: { postId_locale: { postId: id, locale } },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ success: true });
}
