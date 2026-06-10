'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Users, Building2, Globe, ChevronRight,
  Star, Zap, Heart, MessageCircle, Shield, TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ManualPreviewCard } from '@/components/manual/ManualPreviewCard';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { PricingCard } from '@/components/ui/PricingCard';
import { StatsBar } from '@/components/ui/StatsBar';
import { AuthRedirect } from '@/components/AuthRedirect';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base overflow-hidden">
      <AuthRedirect to="/dashboard" />
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4">
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-sm text-primary-400 mb-8">
              <Sparkles className="w-4 h-4" />
              Now in public beta — free to create
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Because people don&apos;t come with{' '}
              <span className="text-gradient">instruction manuals.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Create your interactive personal manual — share who you are, how you work,
              and what makes you, <em>you</em>. For individuals, teams, and companies.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg shadow-glow-sm hover:shadow-glow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                Build My Manual — It&apos;s Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-slate-300 font-semibold text-lg hover:border-primary-500/50 hover:text-white transition-all duration-300"
              >
                See Examples
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-sm text-slate-500">
              No credit card required · Takes 5 minutes · 10,000+ manuals created
            </motion.p>
          </motion.div>

          {/* Right: Animated Manual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <ManualPreviewCard />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <StatsBar />

      {/* ─── FEATURES ─── */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Everything about <span className="text-gradient">you</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              One beautiful space for your personality, story, skills, and the things that make you tick.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── MANUAL SECTIONS SHOWCASE ─── */}
      <section className="py-32 px-4 bg-bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              24 sections. <span className="text-gradient-hero">Infinite personality.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From your origin story to your meme collection — every facet of who you are, beautifully organized.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sections.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-primary-500/30 border border-transparent transition-all duration-200 cursor-default"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm font-medium text-slate-300">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR COMPANIES ─── */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 text-sm mb-6">
              <Building2 className="w-4 h-4" />
              For Companies
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Your team, finally{' '}
              <span className="text-gradient">understood.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              New joiners read their team&apos;s manuals in minutes.
              No more 6-month awkward phases. Build a culture where everyone
              actually knows each other.
            </p>
            <ul className="space-y-4">
              {companyFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-secondary-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-secondary-500" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/companies"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary-500 text-white font-semibold hover:bg-secondary-600 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              For Companies →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {companyStats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-gradient mb-2">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── AI FEATURES ─── */}
      <section className="py-32 px-4 bg-bg-surface/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Powered by AI
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Blank page? <span className="text-gradient-hero">AI has you covered.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Not sure how to describe yourself? Our AI writes a stunning bio, analyzes your
              strengths, and generates icebreakers — in seconds.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {aiFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 text-left border border-accent-500/10 hover:border-accent-500/30 transition-colors"
                >
                  <div className="text-3xl mb-3">{f.emoji}</div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              People love their manuals
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-32 px-4 bg-bg-surface/50" id="pricing">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-slate-400">Start free. Upgrade when you need more.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <PricingCard key={p.name} {...p} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-5xl lg:text-6xl font-black mb-6">
            Ready to write your manual?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join 10,000+ people who&apos;ve already built theirs. Takes 5 minutes.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-primary text-white font-bold text-xl shadow-glow-md hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <Sparkles className="w-6 h-6" />
            Build My Manual — Free
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border-subtle py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="text-gradient">📖 Human Manual</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Human Manual. Built with ❤️
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Personal & Professional',
    desc: 'From your life story to your communication style — everything in one beautiful profile.',
    color: 'primary' as const,
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI-Powered Writing',
    desc: 'Blank page? AI drafts your bio, analyzes strengths, and generates icebreakers instantly.',
    color: 'accent' as const,
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Built for Teams',
    desc: 'Employee directories, org charts, onboarding portals — make your company feel human.',
    color: 'secondary' as const,
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Social & Engaging',
    desc: 'Follow people, react to sections, leave comments, build real connections.',
    color: 'primary' as const,
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Media Rich',
    desc: 'Photos, GIFs, memes, music embeds, videos — your personality in full color.',
    color: 'accent' as const,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Private by Default',
    desc: 'Granular privacy controls. Share publicly, with your company, or keep it just for friends.',
    color: 'secondary' as const,
  },
];

const sections = [
  { emoji: '👤', label: 'Basic Info' },
  { emoji: '📝', label: 'About Me' },
  { emoji: '🗓️', label: 'My Story' },
  { emoji: '💼', label: 'Work Style' },
  { emoji: '💪', label: 'Strengths' },
  { emoji: '🎯', label: 'Weaknesses' },
  { emoji: '❤️', label: 'Things I Love' },
  { emoji: '😤', label: 'Things I Hate' },
  { emoji: '🎲', label: 'Fun Facts' },
  { emoji: '💬', label: 'Quotes' },
  { emoji: '🏆', label: 'Goals' },
  { emoji: '⚡', label: 'Skills' },
  { emoji: '🎸', label: 'Hobbies' },
  { emoji: '🗺️', label: 'Travel Map' },
  { emoji: '📚', label: 'Books' },
  { emoji: '🎬', label: 'Movies' },
  { emoji: '🎮', label: 'Games' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '😂', label: 'Memes' },
  { emoji: '🌀', label: 'GIFs' },
  { emoji: '📸', label: 'Photos' },
  { emoji: '🎥', label: 'Videos' },
  { emoji: '🎙️', label: 'Voice Notes' },
  { emoji: '🧠', label: 'Personality' },
];

const companyFeatures = [
  'Employee Directory with personality types',
  'Interactive org chart',
  'New joiner welcome portal',
  'Birthday & anniversary walls',
  'Culture challenges & spotlights',
  'AI team compatibility analyzer',
];

const companyStats = [
  { value: '80%', label: 'Faster onboarding' },
  { value: '3×', label: 'More team cohesion' },
  { value: '500+', label: 'Companies onboard' },
  { value: '4.9★', label: 'Average rating' },
];

const aiFeatures = [
  { emoji: '✍️', title: 'Bio Generator', desc: 'Describe yourself in one sentence — AI writes a full, beautiful biography.' },
  { emoji: '🔍', title: 'Strength Analyzer', desc: 'Answer a few questions — AI identifies and articulates your core strengths.' },
  { emoji: '🤝', title: 'Icebreaker Generator', desc: 'Get 10 personalized conversation starters based on your manual content.' },
];

const testimonials = [
  {
    quote: "I shared my manual before my first day and my new team already felt like they knew me. Game changer.",
    name: "Sarah Chen",
    role: "Product Designer at Stripe",
    personality: "ENFP",
    avatar: "SC",
  },
  {
    quote: "We rolled it out for our whole engineering team. Onboarding time dropped from months to days.",
    name: "Marcus Rivera",
    role: "CTO at LaunchStack",
    personality: "ENTJ",
    avatar: "MR",
  },
  {
    quote: "Finally a place where my meme game and my professional skills can coexist.",
    name: "Priya Nair",
    role: "Full Stack Engineer",
    personality: "INTP",
    avatar: "PN",
  },
];

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals getting started.',
    features: ['1 Manual', '10 sections', 'Basic media upload', 'Public/private visibility', '3 AI credits/month'],
    cta: 'Start Free',
    href: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For individuals who want the full experience.',
    features: ['1 Manual', 'All 24 sections', 'Unlimited media', 'Custom domain', 'Unlimited AI', 'Analytics dashboard', 'Priority support'],
    cta: 'Start Pro',
    href: '/onboarding?plan=pro',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    description: 'For teams and small companies.',
    features: ['Up to 25 members', 'Company workspace', 'Employee directory', 'Org chart', 'Onboarding templates', 'Culture features', 'Admin analytics'],
    cta: 'Start Team Trial',
    href: '/onboarding?plan=team',
    highlighted: false,
  },
];
