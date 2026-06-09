'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  delay?: number;
}

export function PricingCard({ name, price, period, description, features, cta, href, highlighted, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`relative rounded-2xl p-6 flex flex-col gap-6 ${
        highlighted
          ? 'bg-gradient-primary shadow-glow-md border border-primary-400/30'
          : 'glass border border-border-subtle'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-primary-600 text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div>
        <h3 className={`font-bold text-lg mb-1 ${highlighted ? 'text-white' : 'text-white'}`}>{name}</h3>
        <p className={`text-sm mb-4 ${highlighted ? 'text-white/70' : 'text-slate-400'}`}>{description}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-black ${highlighted ? 'text-white' : 'text-gradient'}`}>{price}</span>
          <span className={`text-sm ${highlighted ? 'text-white/60' : 'text-slate-500'}`}>{period}</span>
        </div>
      </div>

      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlighted ? 'text-white/90' : 'text-slate-300'}`}>
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-primary-400'}`} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`w-full py-3 rounded-xl font-semibold text-center transition-all duration-200 hover:-translate-y-px ${
          highlighted
            ? 'bg-white text-primary-600 hover:bg-white/90 shadow-sm'
            : 'glass border border-border-default hover:border-primary-500/50 text-white'
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
