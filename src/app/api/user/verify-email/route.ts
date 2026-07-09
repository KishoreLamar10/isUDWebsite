import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashEmailVerificationToken } from '@/lib/emailVerification';
import { getBaseUrl } from '@/lib/passwordSetupEmail';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  const baseUrl = getBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?verifyError=missing-token`);
  }

  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashEmailVerificationToken(token) },
    });

    if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
      return NextResponse.redirect(`${baseUrl}/login?verifyError=invalid`);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.redirect(`${baseUrl}/login?verified=1`);
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.redirect(`${baseUrl}/login?verifyError=server`);
  }
}
