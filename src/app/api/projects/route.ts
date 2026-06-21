import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCachedScoringLibrary } from '@/lib/libraryCache';
import { calculateProjectScore } from '@/lib/scoring';
import { sortChecklistHierarchy } from '@/lib/naturalSort';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      projectName,
      contactName,
      contactEmail,
      telephone,
      firmName,
      ownerName,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      buildingArea,
      siteArea,
      certification,
      services,
      facilityUses,
    } = body;
    const facilityNames = Array.isArray(facilityUses) ? facilityUses : [];

    // Validate mandatory fields
    if (!projectName || !contactName || !contactEmail || !telephone) {
      return NextResponse.json(
        { error: 'Missing mandatory fields' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        projectName,
        contactName,
        contactEmail,
        telephone,
        firmName,
        ownerName,
        address1,
        address2,
        city,
        state,
        zip,
        country: country || 'United States',
        buildingArea,
        siteArea,
        certification: certification || 'Guided Certification',
        services: Array.isArray(services) ? services : [],
        facilityUses: {
          connect: facilityNames.map((name: string) => ({ name })),
        },
        userId,
        status: 'ONGOING',
      },
      include: {
        facilityUses: {
          where: { archivedAt: null },
        },
      },
    });

    // --- Dynamic Solution Activation ---
    // Find all sections linked to these facility uses
    const relevantSections = await prisma.section.findMany({
      where: {
        archivedAt: null,
        facilityUses: {
          some: {
            name: { in: facilityNames },
            archivedAt: null,
          },
        },
      },
      select: { id: true },
    });

    const sectionIds = relevantSections.map((s) => s.id);

    // Find all solutions in these sections
    const relevantSolutions = await prisma.solution.findMany({
      where: {
        archivedAt: null,
        sectionId: { in: sectionIds },
      },
      select: { id: true },
    });

    // Create ProjectResponse records for each relevant solution
    if (relevantSolutions.length > 0) {
      await prisma.projectResponse.createMany({
        data: relevantSolutions.map((sol) => ({
          projectId: project.id,
          solutionId: sol.id,
          status: 'NOT_IMPLEMENTED',
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const systemRole = (session.user as any).role;

    const projects = await prisma.project.findMany({
      where: systemRole === 'ADMIN'
        ? {}
        : {
            OR: [
              { userId },
              {
                teamMembers: {
                  some: {
                    userId,
                    status: 'ACTIVE',
                  },
                },
              },
            ],
          },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        responses: true,
        sectionToggles: true,
      },
    });

    const chapters = sortChecklistHierarchy(await getCachedScoringLibrary());

    const projectsWithScores = projects.map((project) => {
      const scores = calculateProjectScore(chapters, project.responses, project.sectionToggles);
      const hasLegacyScores = project.legacyAwardPercentage !== null;
      const totalAvailable = hasLegacyScores
        ? project.legacyApplicableCredits || 0
        : scores.chapterScores.reduce((sum, chapter) => sum + chapter.total, 0);
      const totalEarned = hasLegacyScores ? project.legacyEarnedCredits || 0 : scores.totalScore;
      const bonus = hasLegacyScores ? project.legacyBonusCredits || 0 : scores.totalBonus;
      const scorePercentage = hasLegacyScores
        ? project.legacyAwardPercentage || 0
        : totalAvailable > 0
          ? ((scores.totalScore + scores.totalBonus) / totalAvailable) * 100
          : 0;

      return {
        ...project,
        score: totalEarned,
        totalEarned,
        totalAvailable,
        bonus,
        scorePercentage,
        responses: undefined,
        sectionToggles: undefined,
      };
    });

    return NextResponse.json(projectsWithScores);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
