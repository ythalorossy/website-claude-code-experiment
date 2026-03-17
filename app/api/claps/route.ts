import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Check if user already clapped
  const existingClap = await prisma.clap.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  let clapped: boolean;

  if (existingClap) {
    // Remove clap (toggle off)
    await prisma.clap.delete({
      where: { id: existingClap.id },
    });
    clapped = false;
  } else {
    // Add clap
    await prisma.clap.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
    clapped = true;
  }

  // Get updated clap count
  const clapCount = await prisma.clap.count({
    where: { postId },
  });

  return NextResponse.json({ clapped, clapCount });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  const clapCount = await prisma.clap.count({
    where: { postId },
  });

  // Check if current user has clapped
  const session = await getServerSession(authOptions);
  let hasClapped = false;

  if (session?.user?.id) {
    const userClap = await prisma.clap.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    hasClapped = !!userClap;
  }

  return NextResponse.json({ clapCount, hasClapped });
}
