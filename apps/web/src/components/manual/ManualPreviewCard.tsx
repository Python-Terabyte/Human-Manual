'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Heart, Star } from 'lucide-react';

const profiles = [
  {
    name: 'Asim Saleem',
    tagline: 'Builder. Dreamer. Coffee Addict.',
    role: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'Lahore, Pakistan',
    personality: 'INTJ',
    personalityLabel: 'The Architect',
    avatar: 'AS',
    color: '#6366F1',
    skills: ['TypeScript', 'NestJS', 'PostgreSQL'],
    loves: ['☕ Specialty Coffee', '🌙 Dark Mode', '🧹 Clean Code'],
  },
  {
    name: 'Sarah Chen',
    tagline: 'Design is how it works.',
    role: 'Product Designer',
    company: 'Stripe',
    location: 'San Francisco, USA',
    personality: 'ENFP',
    personalityLabel: 'The Campaigner',
    avatar: 'SC',
    color: '#F97316',
    skills: ['Figma', 'Design Systems', 'User Research'],
    loves: ['🎨 Color Theory', '🧋 Matcha Latte', '📸 Street Photography'],
  },
  {
    name: 'Marcus Rivera',
    tagline: 'Ship fast, learn faster.',
    role: 'CTO',
    company: 'LaunchStack',
    location: 'New York, USA',
    personality: 'ENTJ',
    personalityLabel: 'The Commander',
    avatar: 'MR',
    color: '#10B981',
    skills: ['System Design', 'Go', 'Kubernetes'],
    loves: ['⚡ Speed', '📊 Data', '🏋️ CrossFit'],
  },
];

export function ManualPreviewCard() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % profiles.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const p = profiles[current];

  return (
    <div className="relative w-full max-w-sm">
      {/* Glow behind card */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30 transition-all duration-700"
        style={{ backgroundColor: p.color }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-elevated rounded-3xl p-6 overflow-hidden"
        >
          {/* Subtle gradient tint */}
          <div
            className="absolute inset-0 opacity-5 rounded-3xl"
            style={{ background: `radial-gradient(ellipse at top left, ${p.color}, transparent)` }}
          />

          {/* Header */}
          <div className="relative flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
              style={{ backgroundColor: p.color }}
            >
              {p.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{p.name}</h3>
              <p className="text-sm text-slate-400 truncate">{p.tagline}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {p.role}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {p.location}
                </span>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold mb-4"
            style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
          >
            🧠 {p.personality} — {p.personalityLabel}
          </div>

          {/* Skills */}
          <div className="relative mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {p.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-bg-elevated text-xs font-medium text-slate-300 border border-border-subtle"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Things I Love */}
          <div className="relative">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Things I Love</p>
            <div className="space-y-1">
              {p.loves.map((love) => (
                <div key={love} className="flex items-center gap-2 text-sm text-slate-400">
                  <Heart className="w-3 h-3 text-rose-400" />
                  {love}
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-slate-500">
            <span>📖 Human Manual</span>
            <div className="flex items-center gap-3">
              <span>❤️ 247</span>
              <span>👁️ 1.2k views</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {profiles.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? p.color : 'rgba(255,255,255,0.2)',
              width: i === current ? '24px' : '8px',
            }}
          />
        ))}
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-3 glass rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1 border border-primary-500/30"
      >
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        Featured Manual
      </motion.div>
    </div>
  );
}
