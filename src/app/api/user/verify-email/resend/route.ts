import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken, sendVerificationEmail } from '@/lib/emailVerification';
import { getBaseUrl } from '@/lib/passwordSetupEmail';
import { checkRateLimit, getRequestIp, hashRateLimitKey } from '@/lib/rateLimit';

const RESEND_MESSAGE = 'If an unverified account exists for that email, a new verification link has been sent.';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ipKey = `verify-email-resend:ip:${hashRateLimitKey(getRequestIp(req))}`;
    const emailKey = `verify-email-resend:email:${hashRateLimitKey(normalizedEmail)}`;
    const [ipLimit, emailLimit] = await Promise.all([
      checkRateLimit(ipKey, 10, 60 * 60 * 1000),
      checkRateLimit(emailKey, 3, 60 * 60 * 1000),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { success: true, message: RESEND_MESSAGE },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds, 60)),
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, firstName: true, lastName: true, emailVerified: true },
    });

    if (user && !user.emailVerified) {
      const token = await createEmailVerificationToken(user.id);
      const verifyUrl = `${getBaseUrl()}/api/user/verify-email?token=${token}`;
      await sendVerificationEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        verifyUrl,
      });
    }

    return NextResponse.json({ success: true, message: RESEND_MESSAGE });
  } catch (error) {
    console.error('[VERIFY_EMAIL_RESEND_ERROR]', error);
    return NextResponse.json({ error: 'Unable to resend verification email' }, { status: 500 });
  }
}
