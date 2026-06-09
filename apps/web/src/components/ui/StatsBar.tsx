'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '10,000+', label: 'Manuals Created' },
  { value: '500+',    label: 'Companies' },
  { value: '4.9★',   label: 'Average Rating' },
  { value: '98%',    label: 'Would Recommend' },
];

export function StatsBar() {
  return (
    <section className="py-12 border-y border-border-subtle">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-gradient mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
