import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return new NextResponse("Password is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isValid) {
      return new NextResponse("Invalid password", { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
