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
    const { responses, toggles } = await req.json();

    // Check if user is the owner OR a team member with ACTIVE status and EDITOR/ADMIN permission
    const membership = await prisma.teamMember.findUnique({
      where: {
        projectId_email: {
          projectId: id,
          email: session.user.email?.toLowerCase() || '',
        },
      },
      include: { project: true }
    });

    const isOwner = membership?.project.userId === userId;
    const isEditorOrAdmin = membership?.status === 'ACTIVE' && (membership?.permission === 'EDITOR' || membership?.permission === 'ADMIN');

    if (!isOwner && !isEditorOrAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Read-only access or missing permissions' }, { status: 403 });
    }

    // 1. Update Responses
    for (const res of responses) {
      await prisma.projectResponse.upsert({
        where: {
          projectId_solutionId: {
            projectId: id,
            solutionId: res.solutionId,
          },
        },
        update: { status: res.status },
        create: {
          projectId: id,
          solutionId: res.solutionId,
          status: res.status,
        },
      });
    }

    // 2. Update Toggles
    for (const t of toggles) {
      await prisma.sectionToggle.upsert({
        where: {
          projectId_sectionId: {
            projectId: id,
            sectionId: t.sectionId,
          },
        },
        update: { isEnabled: t.isEnabled },
        create: {
          projectId: id,
          sectionId: t.sectionId,
          isEnabled: t.isEnabled,
        },
      });
    }

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
