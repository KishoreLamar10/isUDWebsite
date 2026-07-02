import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/passwordSetupEmail';
import { checkRateLimit, getRequestIp, hashRateLimitKey } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const { email, answer } = await req.json();
    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail || !answer) {
      return NextResponse.json({ error: 'Email and answer are required' }, { status: 400 });
    }

    const ipKey = `verify-answer:ip:${hashRateLimitKey(getRequestIp(req))}`;
    const emailKey = `verify-answer:email:${hashRateLimitKey(normalizedEmail)}`;
    const [ipLimit, emailLimit] = await Promise.all([
      checkRateLimit(ipKey, 20, 60 * 60 * 1000),
      checkRateLimit(emailKey, 5, 60 * 60 * 1000),
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
      select: { id: true, hashedSecurityAnswer: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Incorrect answer.' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(String(answer).toLowerCase().trim(), user.hashedSecurityAnswer);

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect answer.' }, { status: 400 });
    }

    const token = await createPasswordResetToken(user.id);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[VERIFY_SECURITY_ANSWER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
