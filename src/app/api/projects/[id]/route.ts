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

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        facilityUses: true,
        responses: {
          include: {
            solution: {
              include: {
                section: {
                  include: {
                    chapter: true,
                  },
                },
                goals: true,
                phases: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculate earned credits by chapter
    const chapters = await prisma.chapter.findMany({
      orderBy: { number: 'asc' },
      include: {
        sections: {
          include: {
            solutions: {
              select: { id: true, points: true },
            },
          },
        },
      },
    });

    const chapterScores = chapters.map((ch) => {
      const allSolutionIds = ch.sections.flatMap((s) => s.solutions.map((sol) => sol.id));
      const totalAvailable = ch.totalCredits;

      const implementedResponses = project.responses.filter(
        (r) => allSolutionIds.includes(r.solutionId) && r.status === 'IMPLEMENTED'
      );
      const earned = implementedResponses.reduce((sum, r) => {
        const sol = r.solution;
        return sum + (sol?.points || 0);
      }, 0);

      return {
        number: ch.number,
        title: ch.title,
        totalCredits: totalAvailable,
        earned: Math.min(earned, totalAvailable),
      };
    });

    const totalEarned = chapterScores.reduce((sum, ch) => sum + ch.earned, 0);
    const totalAvailable = chapterScores.reduce((sum, ch) => sum + ch.totalCredits, 0);

    return NextResponse.json({
      ...project,
      chapterScores,
      totalEarned,
      totalAvailable,
      bonus: 0,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
