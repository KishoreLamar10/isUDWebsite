import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        facilityUses: true,
      },
    });

    // --- Dynamic Solution Activation ---
    // Find all sections linked to these facility uses
    const relevantSections = await prisma.section.findMany({
      where: {
        facilityUses: {
          some: {
            name: { in: facilityNames },
          },
        },
      },
      select: { id: true },
    });

    const sectionIds = relevantSections.map((s) => s.id);

    // Find all solutions in these sections
    const relevantSolutions = await prisma.solution.findMany({
      where: {
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
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
