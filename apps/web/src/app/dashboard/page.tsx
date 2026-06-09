'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Eye, Users, TrendingUp, Plus, Pencil, Globe, Lock,
  Share2, BarChart2, Bell, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyManual, createManual } from '@/lib/api';

interface Manual {
  id: string; slug: string; title: string;
  isPublished: boolean; completionScore: number; viewCount: number;
}

export default function DashboardPage() {
  const { dbUser, loading, signOut } = useAuth();
  const router = useRouter();
  const [manual, setManual]       = useState<Manual | null>(null);
  const [creating, setCreating]   = useState(false);
  const [manualLoading, setManualLoading] = useState(true);

  useEffect(() => {
    if (!loading && !dbUser) router.replace('/login');
  }, [loading, dbUser, router]);

  useEffect(() => {
    if (!dbUser) return;
    getMyManual()
      .then(setManual)
      .catch(() => setManual(null))
      .finally(() => setManualLoading(false));
  }, [dbUser]);

  const handleCreateManual = async () => {
    if (!dbUser) return;
    setCreating(true);
    try {
      const m = await createManual({ title: `${dbUser.displayName ?? 'My'} Manual` });
      setManual(m);
      router.push(`/builder/${m.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading || !dbUser) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionColor = manual
    ? manual.completionScore >= 80 ? 'text-green-400'
      : manual.completionScore >= 40 ? 'text-yellow-400'
      : 'text-red-400'
    : 'text-slate-500';

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-border-default p-6 flex flex-col z-40 hidden lg:flex">
        <Link href="/" className="text-xl font-black text-gradient mb-8 block">📖 Human Manual</Link>

        <nav className="flex-1 space-y-1">
          {[
            { icon: BarChart2, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: BookOpen, label: 'My Manual', href: manual ? `/builder/${manual.id}` : '#' },
            { icon: Eye, label: 'Preview', href: dbUser.username ? `/${dbUser.username}` : '#', external: true },
            { icon: Users, label: 'Explore', href: '/explore' },
            { icon: Bell, label: 'Notifications', href: '/notifications' },
            { icon: Settings, label: 'Settings', href: '/settings' },
          ].map(({ icon: Icon, label, href, active, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${
                active
                  ? 'bg-primary-500/20 text-primary-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-bg-elevated'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-center gap-3 mb-4">
            {dbUser.avatarUrl
              ? <img src={dbUser.avatarUrl} className="w-9 h-9 rounded-full" alt="" />
              : <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
                  {(dbUser.displayName ?? dbUser.email)[0].toUpperCase()}
                </div>
            }
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{dbUser.displayName ?? 'User'}</p>
              <p className="text-xs text-slate-500 truncate">@{dbUser.username ?? 'setup needed'}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 p-6 lg:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Good {getGreeting()}, {dbUser.displayName?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening with your manual.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Eye,       label: 'Total Views',  value: manual?.viewCount ?? 0,          color: 'text-blue-400' },
            { icon: TrendingUp,label: 'Completion',   value: `${manual?.completionScore ?? 0}%`, color: completionColor },
            { icon: Users,     label: 'Followers',    value: 0,                                color: 'text-purple-400' },
            { icon: Share2,    label: 'Shares',       value: 0,                                color: 'text-orange-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 border border-border-default"
            >
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Manual card */}
        <div className="glass rounded-2xl border border-border-default p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Your Manual</h2>
            {manual && (
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                manual.isPublished
                  ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {manual.isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {manual.isPublished ? 'Published' : 'Draft'}
              </span>
            )}
          </div>

          {manualLoading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : manual ? (
            <>
              <h3 className="text-lg font-bold text-white mb-1">{manual.title}</h3>

              {/* Completion bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Completion</span>
                  <span className={completionColor}>{manual.completionScore}%</span>
                </div>
                <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${manual.completionScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/builder/${manual.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors text-sm font-medium"
                >
                  <Pencil className="w-4 h-4" /> Edit Manual
                </Link>
                {manual.isPublished && dbUser.username && (
                  <Link
                    href={`/${dbUser.username}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border-default hover:border-primary-500/40 transition-colors text-sm text-slate-300"
                  >
                    <Eye className="w-4 h-4" /> View Live
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">You haven&apos;t created your manual yet.</p>
              <button
                onClick={handleCreateManual}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium mx-auto hover:-translate-y-px transition-transform disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Creating…' : 'Create My Manual'}
              </button>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Users,   label: 'Explore Manuals', desc: 'Discover people and their stories', href: '/explore' },
            { icon: Settings,label: 'Profile Settings', desc: 'Update your username and preferences', href: '/settings' },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-4 glass rounded-2xl border border-border-default p-4 hover:border-primary-500/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
