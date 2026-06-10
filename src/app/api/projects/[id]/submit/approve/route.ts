import { NextResponse } from 'next/server';

function htmlPage() {
  return new NextResponse(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Project Approval Moved</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
          main { max-width: 640px; margin: 12vh auto; background: #fff; border: 1px solid #e2e8f0; padding: 32px; }
          h1 { color: #002a54; margin-top: 0; }
          a { color: #002a54; font-weight: 700; }
        </style>
      </head>
      <body>
        <main>
          <h1>Approval moved to the admin dashboard</h1>
          <p>Project certification is now handled from the admin Project Approvals dashboard.</p>
          <p><a href="/admin/project-approvals">Open Project Approvals</a></p>
        </main>
      </body>
    </html>`,
    {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

export async function GET() {
  return htmlPage();
}

export async function POST() {
  return htmlPage();
}
