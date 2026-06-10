'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Users, Mail, Upload, Bell, BarChart2, Shield, ChevronRight, Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  { icon: Upload,    title: 'Bulk Employee Import',    desc: 'Upload a spreadsheet with employee names, emails, and contact info. Onboard your entire team in seconds.' },
  { icon: Bell,      title: 'Reminder Notifications',  desc: 'Send email reminders to employees who haven\'t created or updated their manuals yet.' },
  { icon: Users,     title: 'Employee Directory',       desc: 'A living, searchable directory of everyone in your company — with their manuals.' },
  { icon: BarChart2, title: 'Team Analytics',           desc: 'See completion rates, engagement, and which employees have published their manuals.' },
  { icon: Shield,    title: 'Privacy Controls',         desc: 'Set company-wide visibility rules — keep manuals internal or allow public sharing.' },
  { icon: Mail,      title: 'Onboarding Workflows',     desc: 'Automatically invite new hires and nudge them to complete their manual before day one.' },
];

export default function CompaniesPage() {
  const { firebaseUser, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace('/companies/dashboard');
    }
  }, [loading, firebaseUser, router]);

  return (
    <div className="min-h-screen bg-bg-base overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-secondary-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 text-sm mb-8"
          >
            <Building2 className="w-4 h-4" />
            For Companies & Teams
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-black mb-6"
          >
            Build a company where{' '}
            <span className="text-gradient">everyone is understood.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Import your team, send reminders, and give every employee a beautiful manual.
            New joiners read the team in minutes — not months.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg shadow-glow-sm hover:shadow-glow-md transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-slate-300 font-semibold text-lg hover:border-primary-500/50 hover:text-white transition-all"
            >
              Sign In to Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-white text-center mb-12"
          >
            Everything your HR team needs
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-2xl p-6 border border-border-default hover:border-primary-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-6">Ready to transform your team?</h2>
          <p className="text-slate-400 mb-8">Sign up today and start importing your employees.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg shadow-glow-sm hover:shadow-glow-md transition-all hover:-translate-y-0.5"
          >
            <Building2 className="w-5 h-5" />
            Create Company Account
          </Link>
        </div>
      </section>
    </div>
  );
}
