import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      currentPassword,
      securityQuestion,
      securityAnswer,
    } = body;

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      telephone,
      jobTitle,
      company,
      professionRole: role,
      reason,
      securityQuestion,
    };

    // If email is changing, require current password and check uniqueness
    if (emailAddress && emailAddress.toLowerCase() !== user.email) {
      if (!currentPassword) {
        return new NextResponse("Current password is required to change email", { status: 400 });
      }
      const passwordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
      if (!passwordValid) {
        return new NextResponse("Current password is incorrect", { status: 403 });
      }
      const existingUser = await prisma.user.findUnique({
        where: { email: emailAddress.toLowerCase() },
      });
      if (existingUser) {
        return new NextResponse("Email already in use", { status: 400 });
      }
      updateData.email = emailAddress.toLowerCase();
    }

    // If password is provided, hash it
    if (password && password.trim() !== "") {
      updateData.hashedPassword = await bcrypt.hash(password, 10);
    }

    // If security answer is provided, hash it
    if (securityAnswer && securityAnswer.trim() !== "") {
      updateData.hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
    });

    // Strip sensitive fields
    const { hashedPassword: _, hashedSecurityAnswer: __, ...userWithoutSecrets } = updatedUser;

    return NextResponse.json(userWithoutSecrets);
  } catch (error: any) {
    console.error("[PROFILE_UPDATE_PATCH_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
