'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/password-recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to set password');

      router.push('/login?passwordReset=1');
    } catch (err: any) {
      setError(err.message || 'Unable to set password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-r-md border-l-4 border-red-500 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!token && (
        <div className="rounded-r-md border-l-4 border-red-500 bg-red-50 p-4 text-sm font-medium text-red-700">
          Missing password setup token.
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold uppercase tracking-wider text-muted">New Password</label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            disabled={loading || !token}
            className="w-full rounded-sm border border-slate-300 px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
            placeholder="new password"
          />
          <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold uppercase tracking-wider text-muted">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
          disabled={loading || !token}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
          placeholder="confirm password"
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full bg-[#002a54] hover:bg-[#001d3d]" disabled={loading || !token}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : 'Set Password'}
      </Button>
    </form>
  );
}
