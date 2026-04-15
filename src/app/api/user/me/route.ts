import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Strip sensitive fields
    const { hashedPassword: _, hashedSecurityAnswer: __, ...userWithoutSecrets } = user;

    return NextResponse.json(userWithoutSecrets);
  } catch (error) {
    console.error("[GET_USER_ME_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
