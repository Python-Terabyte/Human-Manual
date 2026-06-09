'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface Props {
  quote: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
}

export function TestimonialCard({ quote, name, role, personality, avatar }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 flex flex-col gap-4 border border-border-subtle hover:border-primary-500/20 transition-colors"
    >
      <Quote className="w-8 h-8 text-primary-500/50" />
      <p className="text-slate-300 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-white text-sm">{name}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-semibold">
          {personality}
        </div>
      </div>
    </motion.div>
  );
}
