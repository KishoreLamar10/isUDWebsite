import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    console.log(`[API Lookup] Project: ${id}, User: ${userId}`);

    // Check if user is the owner OR a team member with ACTIVE status
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { 
            teamMembers: { 
              some: { 
                userId,
                status: 'ACTIVE'
              } 
            } 
          }
        ]
      },
      include: {
        teamMembers: {
          where: { userId },
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const membership = project.teamMembers[0];
    const userRole = project.userId === userId ? 'ADMIN' : (membership?.permission || 'VIEWER');
    const userStatus = membership?.status || 'ACTIVE';

    // Fetch full hierarchy
    const chapters = await prisma.chapter.findMany({
      orderBy: { number: 'asc' },
      include: {
        sections: {
          orderBy: { number: 'asc' },
          include: {
            solutions: {
              orderBy: { standardNumber: 'asc' },
              include: {
                goals: true,
                phases: true,
              },
            },
          },
        },
      },
    });

    // Fetch existing responses and toggles for this project
    const responses = await prisma.projectResponse.findMany({
      where: { projectId: id },
    });

    const toggles = await prisma.sectionToggle.findMany({
      where: { projectId: id },
    });

    // Fetch all phases and goals for the UI matrix
    const allPhases = await prisma.phase.findMany({
      orderBy: { name: 'asc' },
    });
    const allGoals = await prisma.goal.findMany({
      orderBy: { text: 'asc' },
    });

    return NextResponse.json({
      chapters,
      responses,
      toggles,
      allPhases,
      allGoals,
      userRole,
      userStatus,
    });
  } catch (error: any) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
