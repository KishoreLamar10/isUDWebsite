import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (token) {
    return NextResponse.next();
  }

  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const registerUrl = new URL('/register', request.url);
  registerUrl.searchParams.set('callbackUrl', callbackUrl);

  return NextResponse.redirect(registerUrl);
}

export const config = {
  matcher: [
    '/projects/new',
    '/projects/:id',
    '/projects/:id/edit',
    '/projects/:id/checklist',
    '/projects/:id/team',
  ],
};
