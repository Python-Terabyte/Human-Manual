'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Check, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { getInvite, acceptInvite } from '@/lib/api';
import type { InviteDetails } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router    = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();

  const [invite,   setInvite]   = useState<InviteDetails | null>(null);
  const [fetching, setFetching] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error,    setError]    = useState('');

  // Load invite details
  useEffect(() => {
    if (!token) return;
    getInvite(token)
      .then((data) => {
        setInvite(data);
        if (data.alreadyAccepted) setAccepted(true);
      })
      .catch((e) => setError(e.message ?? 'Invite not found or has expired.'))
      .finally(() => setFetching(false));
  }, [token]);

  // If the user is already logged in, accept automatically
  useEffect(() => {
    if (!authLoading && firebaseUser && invite && invite.status === 'pending' && !accepted) {
      handleAccept();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, firebaseUser, invite]);

  const handleAccept = async () => {
    if (accepting || accepted) return;
    setAccepting(true);
    try {
      await acceptInvite(token);
      setAccepted(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to accept invite.');
    } finally {
      setAccepting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (fetching || authLoading) {
    return (
      <Screen>
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </Screen>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Screen>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass rounded-3xl border border-red-500/20 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invite unavailable</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium text-sm hover:-translate-y-px transition-transform"
          >
            Go to Human Manual
          </Link>
        </motion.div>
      </Screen>
    );
  }

  const fromName     = invite?.fromName     ?? 'Someone';
  const fromUsername = invite?.fromUsername ?? 'user';
  const initials     = fromName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // ── Accepted state ───────────────────────────────────────────────────────────
  if (accepted) {
    return (
      <Screen>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass rounded-3xl border border-green-500/20 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">You're in!</h1>
          <p className="text-slate-400 text-sm mb-6">
            {firebaseUser
              ? 'Welcome to Human Manual. Head to your dashboard to start building your manual.'
              : 'Your invite has been recorded. Create an account to start building your manual.'}
          </p>
          <Link
            href={firebaseUser ? '/dashboard' : `/register?invite=${token}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:-translate-y-px transition-transform shadow-glow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {firebaseUser ? 'Go to Dashboard' : 'Create Your Manual — Free'}
          </Link>
          {!firebaseUser && (
            <p className="mt-4 text-sm text-slate-500">
              Already have an account?{' '}
              <Link href={`/login?invite=${token}`} className="text-primary-400 hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </Screen>
    );
  }

  // ── Default: show invite card ─────────────────────────────────────────────────
  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-gradient">📖 Human Manual</Link>
        </div>

        <div className="glass rounded-3xl border border-border-default p-8">
          {/* Sender avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            {invite?.fromAvatar ? (
              <img
                src={invite.fromAvatar}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                alt={fromName}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-white text-lg">{fromName}</p>
              <p className="text-slate-500 text-sm">@{fromUsername}</p>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">
            You've been invited!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-white">{fromName}</strong> wants you to join
            <strong className="text-gradient"> Human Manual</strong> — the platform where people
            share who they really are through interactive personal manuals.
          </p>

          {/* Personal message */}
          {invite?.message && (
            <div className="bg-primary-500/8 border border-primary-500/20 rounded-xl px-4 py-3 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                <span className="text-xs text-primary-400 font-medium">Personal message</span>
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "{invite.message}"
              </p>
            </div>
          )}

          {/* What you get */}
          <ul className="space-y-2 mb-6">
            {[
              'Create your own interactive manual in minutes',
              'Share your personality, story, skills & work style',
              'Connect with your team and build real relationships',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href={`/register?invite=${token}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-primary text-white font-semibold hover:-translate-y-px transition-transform shadow-glow-sm mb-3"
          >
            <Sparkles className="w-4 h-4" />
            Accept &amp; Create My Manual — Free
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href={`/login?invite=${token}`}
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign in to accept
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          This invite expires on {invite ? new Date(invite.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}.
        </p>
      </motion.div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
