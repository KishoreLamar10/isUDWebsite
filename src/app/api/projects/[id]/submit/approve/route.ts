import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/?approval=missing-token`);
  }

  const submission = await prisma.projectSubmission.findFirst({
    where: {
      projectId: id,
      token,
      status: 'PENDING',
    },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
        },
      },
    },
  });

  if (!submission) {
    return NextResponse.redirect(`${origin}/?approval=invalid-or-used`);
  }

  await prisma.$transaction([
    prisma.projectSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    }),
    prisma.project.update({
      where: { id },
      data: { status: 'COMPLETED' },
    }),
  ]);

  return new NextResponse(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Project Approved</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
          main { max-width: 640px; margin: 12vh auto; background: #fff; border: 1px solid #e2e8f0; padding: 32px; }
          h1 { color: #002a54; margin-top: 0; }
          a { color: #002a54; font-weight: 700; }
        </style>
      </head>
      <body>
        <main>
          <h1>Project certified</h1>
          <p>${submission.project.projectName} has been approved and marked as Certified.</p>
          <p><a href="/">Return to isUD</a></p>
        </main>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}
