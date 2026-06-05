import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 text-center text-[13px] font-medium text-slate-600 sm:px-6 lg:px-8">
        Set your isUD password to access your migrated projects.
      </div>

      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Set Password</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Enter a new password for your isUD account. This link can only be used once.
          </p>
        </div>
        <Suspense fallback={<div className="flex items-center justify-center p-12">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
