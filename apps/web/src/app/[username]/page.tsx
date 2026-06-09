'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Heart } from 'lucide-react';
import Link from 'next/link';

const demoUser = {
  name: 'Asim Saleem',
  username: 'asim-saleem',
  tagline: 'Builder. Dreamer. Coffee Addict.',
  role: 'Senior Software Engineer',
  company: 'TechCorp',
  location: 'Lahore, Pakistan',
  personality: { code: 'INTJ', label: 'The Architect' },
  avatar: 'AS',
  coverGradient: 'from-primary-600 via-purple-600 to-accent-500',
  bio: "I'm a software engineer who builds products that matter. I love clean code, strong coffee, and ambitious ideas. By day I architect backends with NestJS and PostgreSQL. By night I'm chasing a perfect pour-over or getting lost in a good book. As an INTJ, I'm drawn to complexity and obsessed with elegant solutions.",
  stats: { views: 1247, followers: 234, following: 89 },
  skills: [
    { name: 'TypeScript', level: 5, category: 'Frontend', years: 4 },
    { name: 'NestJS', level: 4, category: 'Backend', years: 3 },
    { name: 'PostgreSQL', level: 5, category: 'Database', years: 5 },
    { name: 'AWS', level: 3, category: 'Cloud', years: 2 },
    { name: 'Flutter', level: 3, category: 'Mobile', years: 1 },
  ],
  strengths: [
    { label: 'System Thinking', emoji: '🧠' },
    { label: 'Fast Learner', emoji: '⚡' },
    { label: 'Empathy', emoji: '💛' },
    { label: 'Leadership', emoji: '🎯' },
  ],
  weaknesses: [
    { label: 'Perfectionism', emoji: '🎨', growth: 'Shipping MVPs faster' },
    { label: 'Over-committing', emoji: '📋', growth: 'Learning to say no' },
  ],
  story: [
    { year: 2010, title: 'Born in Lahore, Pakistan', emoji: '🌍', desc: undefined },
    { year: 2018, title: 'Started CS at FAST-NUCES', emoji: '🎓', desc: 'Best decision of my life' },
    { year: 2020, title: 'Built first SaaS — failed, but learned everything', emoji: '💡', desc: undefined },
    { year: 2022, title: 'Joined TechCorp as Backend Engineer', emoji: '💼', desc: undefined },
    { year: 2024, title: 'Promoted to Tech Lead', emoji: '🚀', desc: 'Leading a team of 8 engineers' },
  ],
  workStyle: {
    communication: 'Direct & concise',
    meetings: 'Async first, calls when needed',
    feedback: 'Radical candor — be blunt',
    peakHours: '9am–1pm, then 8pm–11pm (PKT)',
    tools: ['Slack', 'Notion', 'Figma', 'Linear'],
  },
  loves: ['☕ Specialty Coffee', '🌙 Dark Mode', '🧹 Clean Code', '🥾 Hiking', '🍣 Sushi'],
  hates: ['😤 Meetings without agendas', '📶 Slow Wi-Fi', '🙅 Micromanagement'],
  funFacts: [
    '⌨️ I type at 120 WPM',
    '🎸 Taught myself guitar in 30 days',
    '🌍 Visited 14 countries before 30',
    '🧩 Can solve a Rubik\'s cube in under 2 minutes',
  ],
  books: [
    { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', rating: 5 },
    { title: 'Clean Code', author: 'Robert C. Martin', rating: 5 },
    { title: 'Atomic Habits', author: 'James Clear', rating: 5 },
  ],
};

export default async function ManualViewPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = demoUser;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Cover */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-r ${user.coverGradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-base to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1 glass px-3 py-1.5 rounded-lg">
            ← Back
          </Link>
        </div>
        <div className="absolute top-4 right-4 text-white/60 text-sm glass px-3 py-1.5 rounded-lg">
          📖 humanmanual.app/{username}
        </div>
      </div>

      {/* Profile header */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-black border-4 border-bg-base flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white">{user.name}</h1>
            <p className="text-slate-400">{user.tagline}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {user.role} @ {user.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-4 text-sm text-slate-400">
              <span><strong className="text-white">{user.stats.views.toLocaleString()}</strong> views</span>
              <span><strong className="text-white">{user.stats.followers}</strong> followers</span>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:-translate-y-px transition-transform shadow-glow-sm">
              + Follow
            </button>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6 pb-20">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personality */}
            <Section title="🧠 Personality">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                <div className="text-4xl font-black text-gradient">{user.personality.code}</div>
                <div>
                  <div className="font-bold text-white">{user.personality.label}</div>
                  <div className="text-sm text-slate-400">Based on 16Personalities MBTI assessment</div>
                </div>
              </div>
            </Section>

            {/* About */}
            <Section title="📝 About Me">
              <p className="text-slate-300 leading-relaxed">{user.bio}</p>
            </Section>

            {/* My Story */}
            <Section title="🗓️ My Story">
              <div className="relative pl-6 border-l border-border-default space-y-6">
                {user.story.map((event) => (
                  <div key={event.year} className="relative">
                    <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary-500 border-2 border-bg-base" />
                    <div className="text-sm text-slate-500 mb-1">{event.year}</div>
                    <div className="font-semibold text-white">
                      {event.emoji} {event.title}
                    </div>
                    {event.desc && (
                      <div className="text-sm text-slate-400 mt-1">{event.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section title="⚡ Skills">
              <div className="space-y-3">
                {user.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-slate-300 flex-shrink-0">{skill.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(skill.level / 5) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-primary"
                      />
                    </div>
                    <div className="w-20 text-xs text-slate-500 text-right">
                      {skill.years}y · {skill.category}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Strengths */}
            <Section title="💪 Strengths">
              <div className="grid grid-cols-2 gap-3">
                {user.strengths.map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-medium text-white">{s.label}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Fun Facts */}
            <Section title="🎲 Fun Facts">
              <div className="space-y-3">
                {user.funFacts.map((fact) => (
                  <div key={fact} className="glass rounded-xl px-4 py-3 text-slate-300 text-sm">
                    {fact}
                  </div>
                ))}
              </div>
            </Section>

            {/* Favorite Books */}
            <Section title="📚 Favorite Books">
              <div className="space-y-3">
                {user.books.map((book) => (
                  <div key={book.title} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className="w-10 h-12 rounded bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      📗
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{book.title}</div>
                      <div className="text-xs text-slate-500">{book.author}</div>
                    </div>
                    <div className="text-yellow-400 text-sm">{'★'.repeat(book.rating)}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Work With Me */}
            <Section title="💼 How To Work With Me">
              <div className="space-y-3">
                {(
                  [
                    ['💬 Communication', user.workStyle.communication],
                    ['📅 Meetings', user.workStyle.meetings],
                    ['🎯 Feedback', user.workStyle.feedback],
                    ['🕐 Peak Hours', user.workStyle.peakHours],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-500 mb-1">{label}</div>
                    <div className="text-sm text-slate-300">{value}</div>
                  </div>
                ))}
                <div>
                  <div className="text-xs text-slate-500 mb-2">🔧 Preferred Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {user.workStyle.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-bg-elevated text-xs text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Loves */}
            <Section title="❤️ Things I Love">
              <div className="flex flex-wrap gap-2">
                {user.loves.map((l) => (
                  <span
                    key={l}
                    className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </Section>

            {/* Hates */}
            <Section title="😤 Things I Hate">
              <div className="flex flex-wrap gap-2">
                {user.hates.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 rounded-full bg-slate-700/50 border border-border-subtle text-sm text-slate-400"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </Section>

            {/* Weaknesses */}
            <Section title="🎯 Areas I'm Growing">
              <div className="space-y-3">
                {user.weaknesses.map((w) => (
                  <div key={w.label} className="glass rounded-xl p-3">
                    <div className="font-medium text-white text-sm">
                      {w.emoji} {w.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Working on: {w.growth}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Share */}
            <div className="glass rounded-2xl p-4 text-center border border-border-subtle">
              <p className="text-sm text-slate-400 mb-3">Share this manual</p>
              <div className="text-xs text-slate-500 font-mono bg-bg-elevated rounded-lg px-3 py-2">
                humanmanual.app/{username}
              </div>
              <button className="mt-3 w-full py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/20 transition-colors">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 border border-border-subtle"
    >
      <h2 className="font-bold text-white mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}
