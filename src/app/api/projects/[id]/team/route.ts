import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/team
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = params;

    const team = await prisma.teamMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/team (Invite)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = params;
    const body = await req.json();
    const { email, permission, role } = body;

    if (!email || !permission || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already a member
    const existing = await prisma.teamMember.findUnique({
      where: {
        projectId_email: {
          projectId,
          email: email.toLowerCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a team member or has a pending invite' }, { status: 400 });
    }

    // Check if the invited email belongs to an existing user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    const invite = await prisma.teamMember.create({
      data: {
        projectId,
        userId: user?.id || null,
        email: email.toLowerCase(),
        permission,
        role,
        status: 'PENDING',
      },
    });

// PATCH /api/projects/[id]/team (Accept/Update)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = params;
    const userId = (session.user as any).id;
    const email = session.user.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Find the record to update
    const member = await prisma.teamMember.findUnique({
      where: {
        projectId_email: {
          projectId,
          email,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const updated = await prisma.teamMember.update({
      where: { id: member.id },
      data: {
        status: 'ACTIVE',
        userId, // Ensure it's linked
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
