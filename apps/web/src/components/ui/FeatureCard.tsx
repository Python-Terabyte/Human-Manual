'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Color = 'primary' | 'accent' | 'secondary';

const colorMap: Record<Color, { icon: string; border: string; glow: string }> = {
  primary:   { icon: 'bg-primary-500/10 text-primary-400',   border: 'hover:border-primary-500/30',   glow: 'hover:shadow-glow-sm' },
  accent:    { icon: 'bg-accent-500/10 text-accent-400',     border: 'hover:border-accent-500/30',    glow: 'hover:shadow-glow-cyan' },
  secondary: { icon: 'bg-secondary-500/10 text-secondary-400', border: 'hover:border-secondary-500/30', glow: '' },
};

interface Props {
  icon: ReactNode;
  title: string;
  desc: string;
  color: Color;
}

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export function FeatureCard({ icon, title, desc, color }: Props) {
  const c = colorMap[color];

  return (
    <motion.div
      variants={item}
      className={`glass rounded-2xl p-6 border border-border-subtle ${c.border} ${c.glow} transition-all duration-300 group cursor-default`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}
