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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted uppercase tracking-wider block">E-mail Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all pr-10"
              placeholder="e-mail address"
              required
              disabled={loading}
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
            />
            <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
          </div>
        </div>

        {/* Forgot Password Link */}
        <button type="button" className="text-primary font-bold text-sm tracking-tight hover:underline block disabled:opacity-50" disabled={loading}>
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

      {/* Mini Footer/Notice */}
      <p className="text-[10px] text-muted text-center pt-8 leading-relaxed italic">
        By signing in, you agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span><br />
        © 2024 isUD. All rights reserved
      </p>
    </div>
  );
}
