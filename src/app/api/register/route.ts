import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function verifyTurnstileToken(token: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) return false;

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => null);

  return Boolean(result?.success);
}

export async function POST(req: Request) {
  try {
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
      turnstileToken,
    } = body;

    // Basic validation
    if (!emailAddress || !password || !firstName || !lastName || !telephone) {
      return new NextResponse("Required fields are missing", { status: 400 });
    }

    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return new NextResponse("Human verification failed", { status: 400 });
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

    // Business Logic: First user in the system becomes ADMIN
    const userCount = await prisma.user.count();
    const systemRole = userCount === 0 ? "ADMIN" : "USER";

    // Create record
    const user = await prisma.user.create({
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

    // Strip sensitive fields before returning
    const { hashedPassword: _, hashedSecurityAnswer: __, ...userWithoutSecrets } = user;

    return NextResponse.json(userWithoutSecrets);
  } catch (error: any) {
    console.error("[REGISTRATION_POST_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
