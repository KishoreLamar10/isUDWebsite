'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Button from './ui/Button';

function getSafeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Account created successfully! Please login.');
    }
    if (searchParams.get('error')) {
      setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth returns specific errors from the authorize function
        setError(result.error);
      } else {
        // Success - Refresh and redirect to the original intended route
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unable to send setup email');

      setSuccess(data.message || 'If an account exists for that email, a password setup link has been sent.');
      setIsRecovering(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <h2 className="text-2xl font-bold text-primary tracking-tight">Login to Existing Account</h2>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
          {error}
        </div>
      )}

      {success && (
        <div role="status" aria-live="polite" className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium rounded-r-md">
          {success}
        </div>
      )}

      {isRecovering ? (
        <form onSubmit={handleRecoveryLookup} className="space-y-6">
          <p className="text-sm leading-relaxed text-slate-600">
            Enter your email and we will send a secure link to set a new password.
          </p>
          <div className="space-y-2">
            <label htmlFor="recovery-email" className="text-sm font-semibold text-muted uppercase tracking-wider block">E-mail Address</label>
            <div className="relative">
              <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none pr-10"
                placeholder="e-mail address"
                required
                disabled={recoveryLoading}
                suppressHydrationWarning={true}
              />
              <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="text-primary font-bold text-sm tracking-tight hover:underline disabled:opacity-50"
              disabled={recoveryLoading}
              onClick={() => {
                setIsRecovering(false);
                setError(null);
              }}
            >
              Back to login
            </button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-8 bg-[#002a54] hover:bg-[#001d3d] disabled:opacity-50"
              disabled={recoveryLoading}
            >
              {recoveryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Working...
                </>
              ) : 'Send setup link'}
            </Button>
          </div>
        </form>
      ) : (
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-semibold text-muted uppercase tracking-wider block">E-mail Address</label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none pr-10"
              placeholder="e-mail address"
              required
              disabled={loading}
              suppressHydrationWarning={true}
            />
            <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} aria-hidden="true" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-semibold text-muted uppercase tracking-wider block">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all pr-10"
              placeholder="password"
              required
              disabled={loading}
              suppressHydrationWarning={true}
            />
            <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} aria-hidden="true" />
          </div>
        </div>

        {/* Forgot Password Link */}
        <button
          type="button"
          className="text-primary font-bold text-sm tracking-tight hover:underline block disabled:opacity-50"
          disabled={loading}
          onClick={() => {
            setIsRecovering(true);
            setError(null);
            setSuccess(null);
          }}
        >
          Forgot password?
        </button>

        {/* Login Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto px-12 bg-[#002a54] hover:bg-[#001d3d] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </form>
      )}

      {/* Mini Footer/Notice */}
      <p className="text-[10px] text-muted text-center pt-8 leading-relaxed italic">
        By signing in, you agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span><br />
        © 2024 isUD. All rights reserved
      </p>
    </div>
  );
}
