import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { authOptions } from '@/lib/auth';

function getSafeCallbackUrl(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return '/';
  return candidate;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl: rawCallbackUrl } = await searchParams;
  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl);

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-slate-50 border-b border-slate-100 py-4 px-4 sm:px-6 lg:px-8 text-center text-[13px] text-slate-600 font-medium">
        By signing in, you agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span> © {new Date().getFullYear()} University at Buffalo. All rights reserved.
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<div className="flex items-center justify-center p-12">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
