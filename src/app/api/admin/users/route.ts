import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { createPasswordResetToken, getBaseUrl, sendPasswordSetupEmail } from '@/lib/passwordSetupEmail';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, hashRateLimitKey } from '@/lib/rateLimit';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      systemRole: true,
      lastLoginAt: true,
      emailVerified: true,
      projects: {
        select: { id: true },
      },
      projectMemberships: {
        select: { id: true },
      },
    },
  });

  return NextResponse.json(users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    systemRole: user.systemRole,
    lastLoginAt: user.lastLoginAt,
    emailVerified: user.emailVerified,
    projectCount: user.projects.length,
    membershipCount: user.projectMemberships.length,
  })));
}

export async function POST(req: Request) {
  const { session, error } = await requireAdminSession();
  if (error) return error;

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminId = (session?.user as any)?.id || session?.user?.email || 'unknown-admin';
    const [adminLimit, userLimit] = await Promise.all([
      checkRateLimit(`admin-password-setup:admin:${hashRateLimitKey(adminId)}`, 60, 60 * 60 * 1000),
      checkRateLimit(`admin-password-setup:user:${hashRateLimitKey(userId)}`, 5, 60 * 60 * 1000),
    ]);

    if (!adminLimit.allowed || !userLimit.allowed) {
      return NextResponse.json(
        { error: 'Please wait before sending another password setup email.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(adminLimit.retryAfterSeconds, userLimit.retryAfterSeconds, 60)),
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = await createPasswordResetToken(user.id);
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

    await sendPasswordSetupEmail({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      resetUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ADMIN_SEND_PASSWORD_SETUP_ERROR]', error);
    return NextResponse.json({ error: error?.message || 'Unable to send password setup email' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
      select: { id: true, emailVerified: true },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('[ADMIN_VERIFY_USER_ERROR]', error);
    return NextResponse.json({ error: error?.message || 'Unable to verify user' }, { status: 500 });
  }
}
