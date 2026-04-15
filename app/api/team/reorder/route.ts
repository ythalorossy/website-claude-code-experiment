import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, direction } = body;

    if (!id || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid request: id and direction (up/down) are required' },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    let neighbor;

    if (direction === 'up') {
      // Find the member with the highest order less than current (first below current order)
      neighbor = await prisma.teamMember.findFirst({
        where: {
          order: { lt: member.order },
        },
        orderBy: { order: 'desc' },
      });
    } else {
      // Find the member with the lowest order greater than current (first above current order)
      neighbor = await prisma.teamMember.findFirst({
        where: {
          order: { gt: member.order },
        },
        orderBy: { order: 'asc' },
      });
    }

    if (!neighbor) {
      const message = direction === 'up' ? 'Already at top' : 'Already at bottom';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const [updatedMember1, updatedMember2] = await prisma.$transaction([
      prisma.teamMember.update({
        where: { id: member.id },
        data: { order: neighbor.order },
      }),
      prisma.teamMember.update({
        where: { id: neighbor.id },
        data: { order: member.order },
      }),
    ]);

    return NextResponse.json({
      member1: updatedMember1,
      member2: updatedMember2,
    });
  } catch (error) {
    console.error('Error reordering team member:', error);
    return NextResponse.json({ error: 'Failed to reorder team member' }, { status: 500 });
  }
}
