import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken, getBaseUrl, hashPasswordResetToken, sendPasswordSetupEmail } from '@/lib/passwordSetupEmail';
import { checkRateLimit, getRequestIp, hashRateLimitKey } from '@/lib/rateLimit';

const RECOVERY_MESSAGE = 'If an account exists for that email, a password setup link has been sent.';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ipKey = `password-recovery:ip:${hashRateLimitKey(getRequestIp(req))}`;
    const emailKey = `password-recovery:email:${hashRateLimitKey(normalizedEmail)}`;
    const [ipLimit, emailLimit] = await Promise.all([
      checkRateLimit(ipKey, 10, 60 * 60 * 1000),
      checkRateLimit(emailKey, 3, 60 * 60 * 1000),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { success: true, message: RECOVERY_MESSAGE },
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (user) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

      await sendPasswordSetupEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        resetUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: RECOVERY_MESSAGE,
    });
  } catch (error) {
    console.error('[PASSWORD_RECOVERY_EMAIL_ERROR]', error);
    return NextResponse.json({ error: 'Unable to send password setup email' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(token) },
      include: { user: { select: { mustSetSecurityQuestion: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This password setup link is invalid or expired' }, { status: 400 });
    }

    return NextResponse.json({ requiresSecurityQuestion: resetToken.user.mustSetSecurityQuestion });
  } catch (error) {
    console.error('[PASSWORD_RECOVERY_TOKEN_LOOKUP_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, password, securityQuestion, securityAnswer } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(token) },
      include: { user: { select: { mustSetSecurityQuestion: true } } },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This password setup link is invalid or expired' }, { status: 400 });
    }

    if (resetToken.user.mustSetSecurityQuestion) {
      if (typeof securityQuestion !== 'string' || !securityQuestion.trim()) {
        return NextResponse.json({ error: 'Security question is required' }, { status: 400 });
      }
      if (typeof securityAnswer !== 'string' || !securityAnswer.trim()) {
        return NextResponse.json({ error: 'Security answer is required' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const securityUpdate = resetToken.user.mustSetSecurityQuestion
      ? {
          securityQuestion,
          hashedSecurityAnswer: await bcrypt.hash(String(securityAnswer).toLowerCase().trim(), 10),
          mustSetSecurityQuestion: false,
        }
      : {};

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { hashedPassword, ...securityUpdate },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PASSWORD_RECOVERY_RESET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
