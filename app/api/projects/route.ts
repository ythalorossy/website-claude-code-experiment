import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
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

    const formatted = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
      githubUrl: p.githubUrl,
      demoUrl: p.demoUrl,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      technologies: p.technologies,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      members: p.members.map((m) => ({
        memberId: m.memberId,
        name: m.member.name,
        image: m.member.image,
        role: m.role,
      })),
    }));

    return NextResponse.json({ projects: formatted });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image,
        githubUrl,
        demoUrl,
        status: status ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        technologies: technologies || [],
        members: members && members.length > 0
          ? {
              create: members.map((m: { memberId: string; role: string }) => ({
                memberId: m.memberId,
                role: m.role,
              })),
            }
          : undefined,
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

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
