'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-border-subtle' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">📖</span>
          <span className="text-gradient font-extrabold">Human Manual</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm text-slate-400 hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/companies" className="text-sm text-slate-400 hover:text-white transition-colors">
            For Companies
          </Link>
          <Link href="/#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow-sm hover:shadow-glow-md transition-all hover:-translate-y-px"
          >
            <Sparkles className="w-4 h-4" />
            Build Mine Free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg glass"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-border-subtle px-4 py-6 flex flex-col gap-4"
        >
          <Link href="/explore" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Explore</Link>
          <Link href="/companies" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>For Companies</Link>
          <Link href="/#pricing" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/login" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-semibold"
            onClick={() => setMobileOpen(false)}
          >
            <Sparkles className="w-4 h-4" />
            Build My Manual — Free
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
