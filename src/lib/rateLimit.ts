import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function hashRateLimitKey(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function getRequestIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return forwarded || req.headers.get('x-real-ip') || 'unknown';
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!bucket || bucket.resetAt <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      update: { count: 1, resetAt },
      create: { key, count: 1, resetAt },
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000)),
    };
  }

  await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, retryAfterSeconds: 0 };
}
