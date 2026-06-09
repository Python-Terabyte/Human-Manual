'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import {
  signInWithGoogle, signInWithGithub,
  signInEmail, resetPassword,
} from '@/lib/firebase';
import { syncUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<'login' | 'reset'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState<string | null>(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const afterAuth = async () => {
    try { await syncUser(); } catch { /* AuthContext retries on next render */ }
    router.replace('/dashboard');
  };

  const handleGoogle = async () => {
    setError(''); setLoading('google');
    try { await signInWithGoogle(); await afterAuth(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(null); }
  };

  const handleGithub = async () => {
    setError(''); setLoading('github');
    try { await signInWithGithub(); await afterAuth(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(null); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading('email');
    try { await signInEmail(email, password); await afterAuth(); }
    catch (e: any) { setError(friendlyError(e.code)); }
    finally { setLoading(null); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading('reset');
    try {
      await resetPassword(email);
      setSuccess('Reset link sent! Check your inbox.');
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black text-gradient">📖 Human Manual</Link>
          <p className="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-elevated rounded-3xl p-8 border border-border-default"
        >
          {tab === 'login' ? (
            <>
              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <SocialButton
                  onClick={handleGoogle}
                  loading={loading === 'google'}
                  icon="G"
                  label="Continue with Google"
                  color="hover:border-blue-500/40"
                />
                <SocialButton
                  onClick={handleGithub}
                  loading={loading === 'github'}
                  icon="⌥"
                  label="Continue with GitHub"
                  color="hover:border-slate-400/40"
                />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs text-slate-500">or email</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmail} className="space-y-4">
                <Field
                  label="Email" type="email" value={email}
                  onChange={setEmail} placeholder="asim@example.com"
                  icon={<Mail className="w-4 h-4" />}
                />
                <div className="relative">
                  <Field
                    label="Password" type={showPw ? 'text' : 'password'}
                    value={password} onChange={setPassword} placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setTab('reset')}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </button>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!!loading}
                  className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:-translate-y-px transition-transform disabled:opacity-60"
                >
                  {loading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Sign In
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Create one free
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">Reset password</h2>
              <p className="text-sm text-slate-400 mb-6">We&apos;ll send a link to your email.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <Field
                  label="Email" type="email" value={email}
                  onChange={setEmail} placeholder="asim@example.com"
                  icon={<Mail className="w-4 h-4" />}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                    <AlertCircle className="w-4 h-4" />{error}
                  </div>
                )}
                {success && (
                  <div className="text-green-400 text-sm p-3 rounded-xl bg-green-400/10 border border-green-400/20">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!!loading}
                  className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold disabled:opacity-60"
                >
                  {loading === 'reset' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('login'); setSuccess(''); setError(''); }}
                  className="w-full text-sm text-slate-500 hover:text-white transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SocialButton({ onClick, loading, icon, label, color }: {
  onClick: () => void; loading: boolean;
  icon: string; label: string; color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl glass border border-border-default ${color} transition-colors disabled:opacity-60`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <span className="w-5 h-5 text-sm font-bold">{icon}</span>
      }
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </button>
  );
}

function Field({ label, type, value, onChange, placeholder, icon }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-slate-500">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          className="w-full bg-bg-elevated border border-border-default rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  );
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':  'No account with that email.',
    'auth/wrong-password':  'Incorrect password.',
    'auth/invalid-email':   'Invalid email address.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/email-already-in-use': 'Email already registered.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
