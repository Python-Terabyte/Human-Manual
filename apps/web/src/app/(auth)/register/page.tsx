'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import {
  signInWithGoogle, signInWithGithub, registerEmail,
} from '@/lib/firebase';
import { syncUser } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState<string | null>(null);
  const [error, setError]       = useState('');

  const afterAuth = async () => {
    try { await syncUser(); } catch { /* AuthContext retries on next render */ }
    router.replace('/onboarding');
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
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading('email');
    try { await registerEmail(email, password); await afterAuth(); }
    catch (e: any) { setError(friendlyError(e.code)); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black text-gradient">📖 Human Manual</Link>
          <p className="text-slate-400 text-sm mt-2">Create your free account</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-elevated rounded-3xl p-8 border border-border-default"
        >
          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <SocialButton onClick={handleGoogle} loading={loading === 'google'} icon="G" label="Sign up with Google" color="hover:border-blue-500/40" />
            <SocialButton onClick={handleGithub} loading={loading === 'github'} icon="⌥" label="Sign up with GitHub" color="hover:border-slate-400/40" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-slate-500">or email</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Asim Saleem" icon={<User className="w-4 h-4" />} />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="asim@example.com" icon={<Mail className="w-4 h-4" />} />
            <div className="relative">
              <Field label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="8+ characters" icon={<Lock className="w-4 h-4" />} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <p className="text-xs text-slate-500">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-primary-400 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={!!loading}
              className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:-translate-y-px transition-transform disabled:opacity-60"
            >
              {loading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SocialButton({ onClick, loading, icon, label, color }: {
  onClick: () => void; loading: boolean; icon: string; label: string; color: string;
}) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl glass border border-border-default ${color} transition-colors disabled:opacity-60`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-sm font-bold">{icon}</span>}
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </button>
  );
}

function Field({ label, type, value, onChange, placeholder, icon }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-slate-500">{icon}</div>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required
          autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'name'}
          className="w-full bg-bg-elevated border border-border-default rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  );
}

function friendlyError(code: string) {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/invalid-email': 'Invalid email address.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
