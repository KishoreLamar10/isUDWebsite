import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectScore } from '@/lib/scoring';
import { getProjectApprovalEmail, sendProjectSubmissionEmail } from '@/lib/projectSubmissionEmail';

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

    const submittedTo = getProjectApprovalEmail();
    const token = randomBytes(32).toString('hex');
    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXTAUTH_URL || requestUrl.origin;
    const approvalUrl = `${baseUrl}/api/projects/${id}/submit/approve?token=${token}`;

    await prisma.$transaction([
      prisma.projectSubmission.create({
        data: {
          projectId: id,
          token,
          submittedTo,
        },
      }),
      prisma.project.update({
        where: { id },
        data: { status: 'IN_REVIEW' },
      }),
    ]);

    try {
      await sendProjectSubmissionEmail({
        approvalUrl,
        projectName: project.projectName,
        projectNumber: project.projectNumber,
        submittedTo,
      });
    } catch (error) {
      await prisma.$transaction([
        prisma.projectSubmission.deleteMany({
          where: {
            projectId: id,
            token,
            status: 'PENDING',
          },
        }),
        prisma.project.update({
          where: { id },
          data: { status: 'ONGOING' },
        }),
      ]);
      throw error;
    }

    return NextResponse.json({ status: 'IN_REVIEW' });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
