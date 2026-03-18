import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, bio, image, linkedin, github, email, order, isActive } = body;

    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        title,
        bio,
        image,
        linkedin,
        github,
        email,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
