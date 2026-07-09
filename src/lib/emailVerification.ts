import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

type VerificationEmailInput = {
  email: string;
  name: string;
  verifyUrl: string;
};

export async function createEmailVerificationToken(userId: string) {
  await prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return token;
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function sendVerificationEmail({ email, name, verifyUrl }: VerificationEmailInput) {
  await sendMail({
    to: email,
    subject: 'Verify your isUD email address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h1 style="font-size: 20px;">Verify your email</h1>
        <p>Hello ${name || 'there'},</p>
        <p>Thanks for creating an isUD account. Confirm your email address to finish setting up your account and log in.</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; background: #002a54; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p style="font-size: 12px; color: #64748b;">If the button does not work, open this link: ${verifyUrl}</p>
      </div>
    `,
    text: `Verify your isUD email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  return { delivered: true };
}
