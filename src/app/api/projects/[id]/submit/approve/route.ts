import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlPage(title: string, body: string) {
  return new NextResponse(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
          main { max-width: 640px; margin: 12vh auto; background: #fff; border: 1px solid #e2e8f0; padding: 32px; }
          h1 { color: #002a54; margin-top: 0; }
          button { background: #002a54; border: 0; color: #fff; cursor: pointer; font-weight: 700; padding: 12px 18px; }
          a { color: #002a54; font-weight: 700; }
        </style>
      </head>
      <body>
        <main>${body}</main>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function getPendingSubmission(projectId: string, token: string) {
  return prisma.projectSubmission.findFirst({
    where: {
      projectId,
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
}

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

  const submission = await getPendingSubmission(id, token);
  if (!submission) {
    return NextResponse.redirect(`${origin}/?approval=invalid-or-used`);
  }

  const projectName = escapeHtml(submission.project.projectName);
  return htmlPage(
    'Confirm Project Approval',
    `<h1>Confirm certification</h1>
    <p>Approve and mark <strong>${projectName}</strong> as Certified?</p>
    <form method="post" action="/api/projects/${escapeHtml(id)}/submit/approve">
      <input type="hidden" name="token" value="${escapeHtml(token)}" />
      <button type="submit">Approve and certify</button>
    </form>
    <p><a href="/">Cancel and return to isUD</a></p>`
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const token = String(formData.get('token') || '');

  if (!token) {
    return htmlPage('Missing Token', '<h1>Missing approval token</h1><p><a href="/">Return to isUD</a></p>');
  }

  const submission = await getPendingSubmission(id, token);
  if (!submission) {
    return htmlPage('Invalid Approval Link', '<h1>Approval link invalid or already used</h1><p><a href="/">Return to isUD</a></p>');
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

  return htmlPage(
    'Project Approved',
    `<h1>Project certified</h1>
    <p>${escapeHtml(submission.project.projectName)} has been approved and marked as Certified.</p>
    <p><a href="/">Return to isUD</a></p>`
  );
}
