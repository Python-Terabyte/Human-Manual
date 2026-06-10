'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Users, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { searchUsers } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ExploreUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export default function ExplorePage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setLoading(true);
    searchUsers('')
      .then((res: any) => setUsers(Array.isArray(res) ? res : res?.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length === 0 || q.length >= 2) {
      setLoading(true);
      setSearched(q.length > 0);
      try {
        const res: any = await searchUsers(q);
        setUsers(Array.isArray(res) ? res : res?.users ?? []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const backHref = firebaseUser ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-subtle px-4 h-16 flex items-center gap-4">
        <Link href={backHref} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href="/" className="text-lg font-black text-gradient">📖 Human Manual</Link>
        {firebaseUser && (
          <div className="ml-auto">
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg glass"
            >
              Dashboard
            </Link>
          </div>
        )}
      </header>

      <main className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black text-white mb-2">Explore People</h1>
          <p className="text-slate-400">Discover people and read their manuals</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or username…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-bg-elevated border border-border-default rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">
              {searched ? 'No people found for that search.' : 'No people on the platform yet.'}
            </p>
            {searched && (
              <button
                onClick={() => handleSearch('')}
                className="mt-4 text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((u, i) => {
              const name = u.displayName ?? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Anonymous');
              const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={u.username ? `/${u.username}` : '#'}
                    className="block glass rounded-2xl border border-border-default p-5 hover:border-primary-500/40 transition-all group h-full"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          alt={name}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white group-hover:text-primary-300 transition-colors truncate">
                          {name}
                        </p>
                        {u.username && (
                          <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                        )}
                      </div>
                    </div>

                    {u.bio && (
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{u.bio}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-primary-400 mt-auto">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      View manual
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
