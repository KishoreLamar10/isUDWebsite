import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getRequestIp, hashRateLimitKey } from "@/lib/rateLimit";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/emailVerification";
import { getBaseUrl } from "@/lib/passwordSetupEmail";

export async function POST(req: Request) {
  try {
    const ip = getRequestIp(req);
    const ipKey = `register:ip:${hashRateLimitKey(ip)}`;
    const ipLimit = await checkRateLimit(ipKey, 10, 60 * 60 * 1000);
    if (!ipLimit.allowed) {
      return new NextResponse("Too many registration attempts. Please try again later.", {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      emailAddress,
      telephone,
      jobTitle,
      company,
      role,
      reason,
      password,
      securityQuestion,
      securityAnswer,
    } = body;

    // Basic validation
    if (!emailAddress || !password || !firstName || !lastName || !telephone) {
      return new NextResponse("Required fields are missing", { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return new NextResponse("Password must be at least 8 characters", { status: 400 });
    }

    if (typeof securityQuestion !== "string" || !securityQuestion.trim()) {
      return new NextResponse("Security question is required", { status: 400 });
    }

    if (typeof securityAnswer !== "string" || !securityAnswer.trim()) {
      return new NextResponse("Security answer is required", { status: 400 });
    }

    // Check if email already exists
    const exists = await prisma.user.findUnique({
      where: {
        email: emailAddress.toLowerCase(),
      },
    });

    if (exists) {
      return new NextResponse("An account with this email already exists", { status: 400 });
    }

    // Hash credentials
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);

    // Atomically check user count and create in one transaction to prevent
    // two concurrent first-registrations both becoming ADMIN.
    const user = await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();
      const systemRole = userCount === 0 ? "ADMIN" : "USER";
      return tx.user.create({
        data: {
          firstName,
          lastName,
          email: emailAddress.toLowerCase(),
          telephone,
          jobTitle,
          company,
          professionRole: role,
          reason,
          hashedPassword,
          securityQuestion,
          hashedSecurityAnswer,
          systemRole,
        },
      });
    });

    // Best-effort: don't fail registration if the verification email can't be
    // sent. The user can request a new one from the login page.
    try {
      const token = await createEmailVerificationToken(user.id);
      const verifyUrl = `${getBaseUrl()}/api/user/verify-email?token=${token}`;
      await sendVerificationEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        verifyUrl,
      });
    } catch (emailError) {
      console.error("[REGISTRATION_VERIFICATION_EMAIL_ERROR]", emailError);
    }

    // Strip sensitive fields before returning
    const { hashedPassword: _, hashedSecurityAnswer: __, ...userWithoutSecrets } = user;

    return NextResponse.json(userWithoutSecrets);
  } catch (error: any) {
    console.error("[REGISTRATION_POST_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
