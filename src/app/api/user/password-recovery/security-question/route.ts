import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRequestIp, hashRateLimitKey } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ipKey = `security-question:ip:${hashRateLimitKey(getRequestIp(req))}`;
    const emailKey = `security-question:email:${hashRateLimitKey(normalizedEmail)}`;
    const [ipLimit, emailLimit] = await Promise.all([
      checkRateLimit(ipKey, 20, 60 * 60 * 1000),
      checkRateLimit(emailKey, 10, 60 * 60 * 1000),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
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
      select: { securityQuestion: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found for that email.' }, { status: 404 });
    }

    return NextResponse.json({ question: user.securityQuestion });
  } catch (error) {
    console.error('[SECURITY_QUESTION_LOOKUP_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
