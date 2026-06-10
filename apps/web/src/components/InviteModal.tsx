'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Mail, Send, Check, AlertCircle,
  Loader2, Link as LinkIcon, Users,
} from 'lucide-react';
import { sendInvites, listMyInvites, revokeInvite } from '@/lib/api';
import type { SentInvite, InviteResult } from '@/lib/api';

interface Props {
  open:    boolean;
  onClose: () => void;
}

type Step = 'compose' | 'sent';

export function InviteModal({ open, onClose }: Props) {
  const [step, setStep]     = useState<Step>('compose');
  const [emails, setEmails] = useState<string[]>(['']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [error, setError]   = useState('');

  // Sent invites list (lazy-loaded when switching to sent tab)
  const [sentTab, setSentTab]         = useState(false);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [revoking, setRevoking]       = useState<string | null>(null);

  const reset = () => {
    setStep('compose');
    setEmails(['']);
    setMessage('');
    setResults([]);
    setError('');
    setSentTab(false);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Email input helpers ─────────────────────────────────────────────────────
  const setEmail = (i: number, val: string) =>
    setEmails((prev) => prev.map((e, idx) => (idx === i ? val : e)));

  const addEmail = () => {
    if (emails.length >= 10) return;
    setEmails((prev) => [...prev, '']);
  };

  const removeEmail = (i: number) =>
    setEmails((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  // Paste multiple emails (comma / newline separated)
  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const raw = e.clipboardData.getData('text');
    const parsed = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.includes('@'));
    if (parsed.length > 1) {
      e.preventDefault();
      const combined = [...emails.slice(0, i), ...parsed, ...emails.slice(i + 1)].slice(0, 10);
      setEmails(combined);
    }
  };

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const valid = emails.filter((em) => em.trim() && em.includes('@'));
    if (valid.length === 0) { setError('Add at least one valid email address.'); return; }

    setLoading(true);
    try {
      const res = await sendInvites(valid, message.trim() || undefined);
      setResults(res);
      setStep('sent');
    } catch (err: any) {
      setError(err.message ?? 'Failed to send invites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Load sent invites ────────────────────────────────────────────────────────
  const loadSentInvites = async () => {
    setSentTab(true);
    setSentLoading(true);
    try {
      const data = await listMyInvites();
      setSentInvites(data);
    } catch {
      setSentInvites([]);
    } finally {
      setSentLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this invite?')) return;
    setRevoking(id);
    try {
      await revokeInvite(id);
      setSentInvites((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: 'revoked' as const } : inv)),
      );
    } catch {
      /* ignore */
    } finally {
      setRevoking(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass rounded-3xl border border-border-default shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">Invite People</h2>
                  <p className="text-xs text-slate-500">Send a personal invite via email</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle: compose / sent */}
                <button
                  onClick={() => (sentTab ? setSentTab(false) : loadSentInvites())}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    sentTab
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Sent
                </button>
                <button
                  onClick={handleClose}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">

              {/* ── Sent invites panel ───────────────────────────────────── */}
              {sentTab ? (
                <div>
                  {sentLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    </div>
                  ) : sentInvites.length === 0 ? (
                    <div className="text-center py-10">
                      <Mail className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No invites sent yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sentInvites.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-border-subtle"
                        >
                          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{inv.toEmail}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(inv.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={inv.status} />
                          {inv.status === 'pending' && (
                            <button
                              onClick={() => handleRevoke(inv.id)}
                              disabled={revoking === inv.id}
                              className="text-slate-600 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
                              title="Revoke invite"
                            >
                              {revoking === inv.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setSentTab(false)}
                    className="mt-5 w-full py-2.5 rounded-xl glass border border-border-default text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    ← Back to compose
                  </button>
                </div>
              ) : step === 'compose' ? (
                /* ── Compose panel ─────────────────────────────────────── */
                <form onSubmit={handleSend} className="space-y-5">
                  {/* Email inputs */}
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Email address{emails.length > 1 ? 'es' : ''}&nbsp;
                      <span className="text-slate-600">({emails.filter(e => e.trim()).length}/10)</span>
                    </label>
                    <div className="space-y-2">
                      {emails.map((email, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(i, e.target.value)}
                              onPaste={(e) => handlePaste(i, e)}
                              placeholder="colleague@company.com"
                              required={i === 0}
                              className="w-full bg-bg-elevated border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                            />
                          </div>
                          {emails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEmail(i)}
                              className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {emails.length < 10 && (
                      <button
                        type="button"
                        onClick={addEmail}
                        className="mt-2 flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add another email
                      </button>
                    )}
                  </div>

                  {/* Optional personal message */}
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Personal message&nbsp;<span className="text-slate-600">(optional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Hey! I've been using Human Manual to share who I am with my team — thought you'd love it too."
                      className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                    <p className="text-right text-xs text-slate-600 mt-1">{message.length}/500</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:-translate-y-px transition-transform disabled:opacity-60"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />}
                    {loading ? 'Sending…' : `Send Invite${emails.filter(e => e.trim()).length > 1 ? 's' : ''}`}
                  </button>
                </form>
              ) : (
                /* ── Success panel ──────────────────────────────────────── */
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Invite{results.length > 1 ? 's' : ''} sent!
                    </h3>
                    <p className="text-slate-400 text-sm">
                      We emailed {results.length} person{results.length > 1 ? 's' : ''} on your behalf.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {results.map((r) => (
                      <div
                        key={r.email}
                        className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-border-subtle"
                      >
                        {r.emailSent
                          ? <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                        <p className="text-sm text-white flex-1 truncate">{r.email}</p>
                        <span className={`text-xs ${r.emailSent ? 'text-green-400' : 'text-yellow-400'}`}>
                          {r.emailSent ? 'Email sent' : 'No email (check logs)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setStep('compose'); setResults([]); setEmails(['']); setMessage(''); }}
                      className="flex-1 py-2.5 rounded-xl glass border border-border-default text-slate-400 text-sm hover:text-white transition-colors"
                    >
                      Invite more
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl bg-primary-500/15 text-primary-300 border border-primary-500/25 text-sm font-medium hover:bg-primary-500/25 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Small helper ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SentInvite['status'] }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    accepted: { label: 'Accepted', cls: 'text-green-400  bg-green-400/10  border-green-400/20'  },
    revoked:  { label: 'Revoked',  cls: 'text-slate-500  bg-slate-700/30  border-border-subtle'  },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls} flex-shrink-0`}>
      {label}
    </span>
  );
}
