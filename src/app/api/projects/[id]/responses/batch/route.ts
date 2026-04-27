import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectScore } from '@/lib/scoring';

export async function POST(
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
    const systemRole = (session.user as any).role;
    const { responses, toggles } = await req.json();
    const responseItems = Array.isArray(responses) ? responses : [];
    const toggleItems = Array.isArray(toggles) ? toggles : [];

    // Check if user is the owner OR a team member with ACTIVE status and EDITOR/ADMIN permission
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        teamMembers: {
          where: { userId },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let membership = project.teamMembers[0];

    if (!membership && session.user.email) {
      membership = await prisma.teamMember.findUnique({
        where: {
          projectId_email: {
            projectId: id,
            email: session.user.email.toLowerCase(),
          },
        },
      }) as any;
    }

    const isOwner = project.userId === userId;
    const isSystemAdmin = systemRole === 'ADMIN';
    const isEditorOrAdmin = membership?.status === 'ACTIVE' && (membership?.permission === 'EDITOR' || membership?.permission === 'ADMIN');

    if (!isSystemAdmin && !isOwner && !isEditorOrAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Read-only access or missing permissions' }, { status: 403 });
    }

    const responseSolutionIds = responseItems
      .map((item: any) => item.solutionId)
      .filter((solutionId: unknown): solutionId is string => typeof solutionId === 'string');
    const toggleSectionIds = toggleItems
      .map((item: any) => item.sectionId)
      .filter((sectionId: unknown): sectionId is string => typeof sectionId === 'string');

    await prisma.$transaction([
      prisma.projectResponse.deleteMany({
        where: {
          projectId: id,
          solutionId: { in: responseSolutionIds },
        },
      }),
      ...(responseItems.length > 0
        ? [
            prisma.projectResponse.createMany({
              data: responseItems.map((item: any) => ({
                projectId: id,
                solutionId: item.solutionId,
                status: item.status,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
      prisma.sectionToggle.deleteMany({
        where: {
          projectId: id,
          sectionId: { in: toggleSectionIds },
        },
      }),
      ...(toggleItems.length > 0
        ? [
            prisma.sectionToggle.createMany({
              data: toggleItems.map((item: any) => ({
                projectId: id,
                sectionId: item.sectionId,
                isEnabled: Boolean(item.isEnabled),
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    // 3. Recalculate Score
    const chapters = await prisma.chapter.findMany({
      include: {
        sections: {
          include: {
            solutions: {
              select: { id: true, points: true, isMandatory: true, standardNumber: true },
            },
          },
        },
      },
    });

    const allResponses = await prisma.projectResponse.findMany({
      where: { projectId: id },
    });
    
    const allToggles = await prisma.sectionToggle.findMany({
      where: { projectId: id },
    });

    const { totalScore } = calculateProjectScore(chapters, allResponses, allToggles);

    // 4. Persist Project Score
    await prisma.project.update({
      where: { id },
      data: { score: totalScore },
    });

    return NextResponse.json({ success: true, score: totalScore });
  } catch (error: any) {
    console.error('Error saving responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
