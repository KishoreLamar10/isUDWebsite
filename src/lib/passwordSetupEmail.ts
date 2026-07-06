import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

type PasswordSetupEmailInput = {
  email: string;
  name: string;
  resetUrl: string;
};

export function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
}

export async function createPasswordResetToken(userId: string) {
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return token;
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function sendPasswordSetupEmail({ email, name, resetUrl }: PasswordSetupEmailInput) {
  await sendMail({
    to: email,
    subject: 'Set your isUD password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h1 style="font-size: 20px;">Set your isUD password</h1>
        <p>Hello ${name || 'there'},</p>
        <p>Your isUD account is ready. Use this secure link to create a new password and access your projects.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #002a54; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Set password
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p style="font-size: 12px; color: #64748b;">If the button does not work, open this link: ${resetUrl}</p>
      </div>
    `,
    text: `Set your isUD password: ${resetUrl}\n\nThis link expires in 24 hours.`,
  });

  return { delivered: true };
}
