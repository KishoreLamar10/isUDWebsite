'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Button from './ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'reset'>('email');
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
        // Success - Refresh and redirect to dashboard
        router.push('/');
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

      if (!response.ok) throw new Error(data.error || 'Unable to find account');

      setRecoveryQuestion(data.securityQuestion);
      setRecoveryStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      setRecoveryLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password-recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          securityAnswer,
          password: newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Unable to reset password');

      setIsRecovering(false);
      setRecoveryStep('email');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassword('');
      setSuccess('Password reset successfully. Please login with your new password.');
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
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium rounded-r-md">
          {success}
        </div>
      )}

      {isRecovering ? (
        <form onSubmit={recoveryStep === 'email' ? handleRecoveryLookup : handlePasswordReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">E-mail Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none pr-10"
                placeholder="e-mail address"
                required
                disabled={recoveryLoading || recoveryStep === 'reset'}
                suppressHydrationWarning={true}
              />
              <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>

          {recoveryStep === 'reset' && (
            <>
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Security Question</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{recoveryQuestion}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider block">Security Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                  placeholder="security answer"
                  required
                  disabled={recoveryLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                  placeholder="new password"
                  required
                  disabled={recoveryLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                  placeholder="confirm new password"
                  required
                  disabled={recoveryLoading}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="text-primary font-bold text-sm tracking-tight hover:underline disabled:opacity-50"
              disabled={recoveryLoading}
              onClick={() => {
                setIsRecovering(false);
                setRecoveryStep('email');
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </>
              ) : recoveryStep === 'email' ? (
                'Continue'
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </form>
      ) : (
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted uppercase tracking-wider block">E-mail Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none pr-10"
              placeholder="e-mail address"
              required
              disabled={loading}
              suppressHydrationWarning={true}
            />
            <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted uppercase tracking-wider block">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all pr-10"
              placeholder="password"
              required
              disabled={loading}
              suppressHydrationWarning={true}
            />
            <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
