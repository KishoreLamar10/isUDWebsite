import { randomBytes, createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCachedScoringLibrary } from '@/lib/libraryCache';
import { calculateProjectScore } from '@/lib/scoring';

async function getEditableProject(projectId: string, userId: string, systemRole?: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      responses: true,
      sectionToggles: true,
      teamMembers: {
        where: { userId },
      },
    },
  });

  if (!project) return null;

  const membership = project.teamMembers[0];
  const canEdit =
    systemRole === 'ADMIN' ||
    project.userId === userId ||
    (membership?.status === 'ACTIVE' && ['ADMIN', 'EDITOR'].includes(membership.permission));

  return canEdit ? project : null;
}

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
    const project = await getEditableProject(id, userId, systemRole);

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    if (project.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Project is already certified' }, { status: 400 });
    }

    if (project.status === 'IN_REVIEW') {
      return NextResponse.json({ status: project.status });
    }

    const chapters = await getCachedScoringLibrary();
    const scores = calculateProjectScore(chapters, project.responses, project.sectionToggles);
    const totalAvailable = scores.chapterScores.reduce((sum, chapter) => sum + chapter.total, 0);
    const scorePercentage = totalAvailable > 0
      ? ((scores.totalScore + scores.totalBonus) / totalAvailable) * 100
      : 0;

    if (
      scores.activeSectionsCount < 1 ||
      scores.missingMandatorySections.length > 0 ||
      scorePercentage < 78
    ) {
      return NextResponse.json(
        { error: 'Complete the preliminary checklist before submitting.' },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await prisma.$transaction([
      prisma.projectSubmission.create({
        data: {
          projectId: id,
          tokenHash,
          submittedTo: 'Admin dashboard',
        },
      }),
      prisma.project.update({
        where: { id },
        data: { status: 'IN_REVIEW' },
      }),
    ]);

    return NextResponse.json({ status: 'IN_REVIEW' });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
