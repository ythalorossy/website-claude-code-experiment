import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const formatted = {
      ...project,
      members: project.members.map((m) => ({
        memberId: m.memberId,
        name: m.member.name,
        image: m.member.image,
        role: m.role,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      image,
      githubUrl,
      demoUrl,
      status,
      startDate,
      endDate,
      technologies,
      members,
    } = body;

    // If members are provided, replace all existing members
    if (members !== undefined) {
      // Delete existing members and create new ones
      await prisma.projectMember.deleteMany({
        where: { projectId: id },
      });

      if (members.length > 0) {
        await prisma.projectMember.createMany({
          data: members.map((m: { memberId: string; role: string }) => ({
            projectId: id,
            memberId: m.memberId,
            role: m.role,
          })),
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(demoUrl !== undefined && { demoUrl }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(technologies !== undefined && { technologies }),
      },
      include: {
        members: {
          include: {
            member: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    const formatted = {
      ...project,
      members: project.members.map((m) => ({
        memberId: m.memberId,
        name: m.member.name,
        image: m.member.image,
        role: m.role,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
