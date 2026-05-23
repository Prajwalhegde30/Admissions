'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface InviteInfo {
  email: string;
  firstName: string;
  lastName: string;
}

export default function SetPasswordPage() {
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const router = useRouter();

  const token = searchParams.get('token');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No invite token found. Please use the link from your email.');
      setIsLoading(false);
      return;
    }

    api<InviteInfo>(`/invites/accept?token=${token}`, { skipAuth: true })
      .then((info) => {
        setInviteInfo(info);
        setIsLoading(false);
      })
      .catch((err) => {
        setTokenError(err.message || 'Invalid or expired invite token.');
        setIsLoading(false);
      });
  }, [token]);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !token) return;
    setError('');
    setIsSubmitting(true);

    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: InviteInfo & { id: string; role: string; mustChangePassword: boolean };
      }>('/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ inviteToken: token, password, confirmPassword }),
        skipAuth: true,
      });
      setSession(data);
      router.push('/application');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-4">
        <div className="animate-fade-in text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Invite</h1>
          <p className="text-brand-300/80 text-sm">{tokenError}</p>
          <a
            href="/login"
            className="inline-block mt-6 px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-400/8 rounded-full blur-3xl" />
      </div>

      <div className="animate-fade-in relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 backdrop-blur-sm mb-4 border border-brand-500/20">
            <GraduationCap className="w-8 h-8 text-brand-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome, {inviteInfo?.firstName}!</h1>
          <p className="text-brand-300/80 mt-1 text-sm">
            Set your password to start your application
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Email badge */}
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg px-4 py-2.5 mb-6 flex items-center gap-2">
            <span className="text-xs text-brand-300">Account</span>
            <span className="text-sm text-white font-medium">{inviteInfo?.email}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-red-300 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-200 mb-1.5">
                Create password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5 animate-fade-in">
                  {[
                    { met: hasMinLength, text: 'At least 8 characters' },
                    { met: hasUppercase, text: 'One uppercase letter' },
                    { met: hasLowercase, text: 'One lowercase letter' },
                    { met: hasNumber, text: 'One number' },
                  ].map(({ met, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${met ? 'text-success' : 'text-surface-500'}`} />
                      <span className={met ? 'text-success' : 'text-surface-500'}>{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-200 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-400">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account & start application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
