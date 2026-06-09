'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { id: 'welcome',   label: 'Welcome' },
  { id: 'basics',    label: 'Basics' },
  { id: 'about',     label: 'About You' },
  { id: 'work',      label: 'Work Style' },
  { id: 'done',      label: 'Done!' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    occupation: '',
    location: '',
    bio: '',
    communication: '',
    personality: '',
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black text-gradient">📖 Human Manual</Link>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-primary-500 text-white' :
                i === step ? 'bg-primary-500/20 border-2 border-primary-500 text-primary-400' :
                'bg-bg-elevated text-slate-600 border border-border-subtle'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-primary-500' : 'bg-border-subtle'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-elevated rounded-3xl p-8 border border-border-default">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="text-center">
                  <div className="text-6xl mb-4">👋</div>
                  <h1 className="text-2xl font-black text-white mb-3">Let&apos;s build your Manual</h1>
                  <p className="text-slate-400 mb-6">
                    It takes about 5 minutes. You can always add more later.
                    Let&apos;s start with the basics.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {['📝 24 sections', '🤖 AI-powered', '🔒 Privacy first'].map((f) => (
                      <div key={f} className="glass rounded-xl p-3 text-slate-300">{f}</div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-black text-white mb-2">Basic Info</h2>
                  <p className="text-slate-400 text-sm mb-6">The essentials — you can fill the rest later.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="First Name" placeholder="Asim" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
                      <Input label="Last Name" placeholder="Saleem" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
                    </div>
                    <Input label="What do you do?" placeholder="Senior Software Engineer" value={form.occupation} onChange={(v) => setForm({ ...form, occupation: v })} />
                    <Input label="Where are you based?" placeholder="Lahore, Pakistan" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-black text-white mb-2">About You</h2>
                  <p className="text-slate-400 text-sm mb-6">Write a few sentences about yourself, or let AI write it for you.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">Your Bio</label>
                      <textarea
                        className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 resize-none"
                        rows={5}
                        placeholder="I'm a software engineer who builds products that matter. I love clean code, strong coffee..."
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">Personality Type (optional)</label>
                      <select
                        className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white"
                        value={form.personality}
                        onChange={(e) => setForm({ ...form, personality: e.target.value })}
                      >
                        <option value="">Select your MBTI type...</option>
                        {['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <button className="w-full py-2.5 rounded-xl bg-accent-500/10 border border-accent-500/30 text-accent-400 text-sm font-medium hover:bg-accent-500/20 transition-colors flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate with AI instead
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-black text-white mb-2">How To Work With You</h2>
                  <p className="text-slate-400 text-sm mb-6">Help colleagues understand how to collaborate with you best.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">Communication Style</label>
                      <select
                        className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white"
                        value={form.communication}
                        onChange={(e) => setForm({ ...form, communication: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option>Direct & concise</option>
                        <option>Collaborative & open-ended</option>
                        <option>Async first, calls when needed</option>
                        <option>I prefer written communication</option>
                        <option>I prefer video calls</option>
                      </select>
                    </div>
                    <div className="glass rounded-xl p-4 text-sm text-slate-400">
                      💡 You can add your meeting preferences, feedback style, peak hours, and more in the full builder.
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-black text-white mb-3">Your Manual is Ready!</h2>
                  <p className="text-slate-400 mb-6">
                    {form.firstName ? `Great work, ${form.firstName}!` : 'Great work!'} Your Manual has been created.
                    Add more sections in the builder to complete your profile.
                  </p>
                  <div className="glass rounded-xl p-3 mb-6">
                    <div className="text-xs text-slate-500 mb-1">Your Manual URL</div>
                    <div className="text-sm font-mono text-primary-400">
                      humanmanual.app/@{form.firstName?.toLowerCase() || 'your-name'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/@asim-saleem"
                      className="block w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold text-center"
                    >
                      Open My Manual →
                    </Link>
                    <button className="w-full py-3 rounded-xl glass border border-border-default text-slate-300 font-medium text-sm">
                      Add More Sections in Builder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step < steps.length - 1 && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:-translate-y-px transition-transform"
              >
                {step === steps.length - 2 ? 'Create My Manual' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
      />
    </div>
  );
}
