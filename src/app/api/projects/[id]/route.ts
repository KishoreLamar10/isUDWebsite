import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectScore } from '@/lib/scoring';

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

    console.log(`[Project Detail API] User ${userId} is requesting project ${id}`);

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
        facilityUses: true,
        responses: true,
        sectionToggles: true,
        teamMembers: {
          where: { userId },
        }
      },
    });

    if (!project) {
      console.warn(`[Project Detail API] Warning: Project ${id} NOT FOUND or NO ACCESS for user ${userId}.`);
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Determine current user's role
    // Default to ADMIN if they are the Project.userId (owner)
    const membership = project.teamMembers[0];
    const userRole = project.userId === userId ? 'ADMIN' : (membership?.permission || 'VIEWER');

    console.log(`[Project Detail API] Found project: "${project.projectName}"`);

    // Calculate scores using universal utility
    const chapters = await prisma.chapter.findMany({
      orderBy: { number: 'asc' },
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

    const scores = calculateProjectScore(
      chapters || [],
      project.responses || [],
      project.sectionToggles || []
    );

    // Group scores for display
    const formattedChapterScores = (scores.chapterScores || []).map((score, index) => {
      const chapter = chapters[index];
      if (!chapter) return null;
      return {
        number: chapter.number,
        title: chapter.title,
        totalCredits: score.total,
        earned: score.earned,
      };
    }).filter(Boolean);

    const totalAvailable = (chapters || []).reduce((sum, ch) => sum + (ch.totalCredits || 0), 0);
    const scorePercentage = totalAvailable > 0 ? ((scores.totalScore + scores.totalBonus) / totalAvailable) * 100 : 0;

    return NextResponse.json({
      ...project,
      userRole,
      userStatus: membership?.status || 'ACTIVE', // Owners are always ACTIVE
      chapterScores: formattedChapterScores,
      totalEarned: scores.totalScore || 0,
      totalAvailable,
      bonus: scores.totalBonus,
      certificationStatus: {
        failedSections: scores.failedSections,
        missingMandatorySections: scores.missingMandatorySections,
        activeSectionsCount: scores.activeSectionsCount,
        scorePercentage,
        isThresholdMet: scorePercentage >= 80,
        isQualifying: scores.activeSectionsCount >= 1,
        isMandatoryMet: scores.missingMandatorySections.length === 0,
      }
    });
  } catch (error: any) {
    console.error('CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: error.stack,
      hint: 'Check scoring utility inputs andprisma relations'
    }, { status: 500 });
  }
}
