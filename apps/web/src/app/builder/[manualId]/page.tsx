'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Save, Eye, Globe, Lock, Pencil, Trash2, ArrowLeft,
  Loader2, Check, X, ChevronDown, GripVertical, BookOpen,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyManual, updateManual, publishManual, unpublishManual,
  listSections, createSection, updateSection, deleteSection,
} from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Manual {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  completionScore: number;
  viewCount: number;
  visibility: string;
  themeColor?: string;
}

interface Section {
  id: string;
  sectionType: string;
  title: string;
  position: number;
  isVisible: boolean;
  data: Record<string, any>;
}

const SECTION_TYPES = [
  { type: 'about_me',     label: 'About Me',        emoji: '📝' },
  { type: 'basic_info',   label: 'Basic Info',       emoji: '👤' },
  { type: 'work_with_me', label: 'Work Style',       emoji: '💼' },
  { type: 'strengths',    label: 'Strengths',        emoji: '💪' },
  { type: 'weaknesses',   label: 'Growth Areas',     emoji: '🎯' },
  { type: 'skills',       label: 'Skills',           emoji: '⚡' },
  { type: 'personality',  label: 'Personality',      emoji: '🧠' },
  { type: 'my_story',     label: 'My Story',         emoji: '🗓️' },
  { type: 'things_i_love','label': 'Things I Love',  emoji: '❤️' },
  { type: 'things_i_hate','label': 'Things I Dislike',emoji: '😤' },
  { type: 'fun_facts',    label: 'Fun Facts',        emoji: '🎲' },
  { type: 'hobbies',      label: 'Hobbies',          emoji: '🎸' },
  { type: 'goals',        label: 'Goals',            emoji: '🏆' },
  { type: 'quotes',       label: 'Quotes',           emoji: '💬' },
  { type: 'books',        label: 'Books',            emoji: '📚' },
];

function sectionMeta(type: string) {
  return SECTION_TYPES.find((s) => s.type === type) ?? { type, label: type.replace(/_/g, ' '), emoji: '📄' };
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { firebaseUser, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const manualId = params.manualId as string;

  const [manual, setManual] = useState<Manual | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
  }, [authLoading, firebaseUser, router]);

  // Load manual + sections
  useEffect(() => {
    if (!dbUser) return;
    (async () => {
      try {
        const m = await getMyManual();
        if (!m || m.id !== manualId) {
          setError('Manual not found or you do not have access.');
          setPageLoading(false);
          return;
        }
        setManual(m);
        setTitleDraft(m.title);
        const s = await listSections(manualId);
        const sorted = (Array.isArray(s) ? s : []).sort((a: Section, b: Section) => a.position - b.position);
        setSections(sorted);
        if (sorted.length > 0) setSelectedId(sorted[0].id);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load manual.');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [dbUser, manualId]);

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;

  const handleSaveTitle = async () => {
    if (!manual || !titleDraft.trim()) return;
    setSaving(true);
    try {
      const updated = await updateManual(manual.id, { title: titleDraft.trim() });
      setManual((prev) => prev ? { ...prev, title: updated.title ?? titleDraft.trim() } : prev);
      setTitleEdit(false);
      flashSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!manual) return;
    setPublishing(true);
    try {
      if (manual.isPublished) {
        await unpublishManual(manual.id);
        setManual((p) => p ? { ...p, isPublished: false } : p);
      } else {
        await publishManual(manual.id);
        setManual((p) => p ? { ...p, isPublished: true } : p);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddSection = async (type: string) => {
    if (!manual) return;
    setAddMenuOpen(false);
    const meta = sectionMeta(type);
    try {
      const s = await createSection(manual.id, {
        sectionType: type,
        title: meta.label,
        position: sections.length,
        data: defaultData(type),
      });
      setSections((prev) => [...prev, s]);
      setSelectedId(s.id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) {
        const remaining = sections.filter((s) => s.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSaveSection = async (id: string, data: Record<string, any>) => {
    setSaving(true);
    try {
      const updated = await updateSection(id, { data });
      setSections((prev) => prev.map((s) => s.id === id ? { ...s, data: updated.data ?? data } : s));
      flashSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  function flashSave() {
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2000);
  }

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center flex-col gap-4 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white font-semibold">{error}</p>
        <Link href="/dashboard" className="text-primary-400 hover:text-primary-300">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-subtle h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {titleEdit ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setTitleEdit(false); }}
                className="bg-bg-elevated border border-primary-500 rounded-lg px-3 py-1.5 text-white text-sm w-56 focus:outline-none"
              />
              <button onClick={handleSaveTitle} disabled={saving} className="text-green-400 hover:text-green-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setTitleEdit(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTitleEdit(true); setTitleDraft(manual?.title ?? ''); }}
              className="flex items-center gap-2 text-white font-semibold text-sm hover:text-primary-300 transition-colors truncate group"
            >
              <BookOpen className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span className="truncate">{manual?.title}</span>
              <Pencil className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Save indicator */}
        <AnimatePresence>
          {saveOk && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-green-400 flex-shrink-0"
            >
              <Check className="w-3.5 h-3.5" /> Saved
            </motion.span>
          )}
        </AnimatePresence>

        {/* Publish toggle */}
        <button
          onClick={handlePublishToggle}
          disabled={publishing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
            manual?.isPublished
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
              : 'bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20'
          }`}
        >
          {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : manual?.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {manual?.isPublished ? 'Published' : 'Publish'}
        </button>

        {/* Preview link */}
        {manual?.isPublished && dbUser?.username && (
          <Link
            href={`/${dbUser.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-border-default hover:border-primary-500/40 text-slate-300 transition-colors flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </Link>
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside className="w-64 glass border-r border-border-default flex flex-col fixed left-0 top-14 bottom-0 overflow-y-auto z-30">
          <div className="p-4 border-b border-border-subtle">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Sections</p>
            <p className="text-xs text-slate-600">{sections.length} section{sections.length !== 1 ? 's' : ''}</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sections.length === 0 && (
              <p className="text-xs text-slate-600 px-2 py-3 text-center">No sections yet. Add one below.</p>
            )}
            {sections.map((sec) => {
              const meta = sectionMeta(sec.sectionType);
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedId(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors group text-left ${
                    selectedId === sec.id
                      ? 'bg-primary-500/20 text-primary-300 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-bg-elevated'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{meta.emoji}</span>
                  <span className="flex-1 truncate">{sec.title || meta.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              );
            })}
          </nav>

          {/* Add section button */}
          <div className="p-3 border-t border-border-subtle relative">
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Section
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${addMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {addMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-3 right-3 mb-2 glass border border-border-default rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto z-50"
              >
                {SECTION_TYPES.filter(
                  (t) => !sections.some((s) => s.sectionType === t.type)
                ).map((t) => (
                  <button
                    key={t.type}
                    onClick={() => handleAddSection(t.type)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-primary-500/10 hover:text-white transition-colors text-left"
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </aside>

        {/* Editor area */}
        <main className="flex-1 ml-64 p-6 lg:p-8 max-w-3xl">
          {!selectedSection ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <BookOpen className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg font-medium mb-2">No section selected</p>
              <p className="text-slate-600 text-sm">Add a section from the sidebar to start building your manual.</p>
            </div>
          ) : (
            <SectionEditor
              key={selectedSection.id}
              section={selectedSection}
              onSave={(data) => handleSaveSection(selectedSection.id, data)}
              saving={saving}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Section Editor dispatcher ──────────────────────────────────────────────
function SectionEditor({
  section,
  onSave,
  saving,
}: {
  section: Section;
  onSave: (data: Record<string, any>) => void;
  saving: boolean;
}) {
  const meta = sectionMeta(section.sectionType);
  const [draft, setDraft] = useState<Record<string, any>>(section.data ?? {});
  const [dirty, setDirty] = useState(false);

  const update = (patch: Record<string, any>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = () => { onSave(draft); setDirty(false); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{meta.emoji}</span>
        <div>
          <h2 className="text-xl font-bold text-white">{meta.label}</h2>
          <p className="text-xs text-slate-500">Edit this section's content</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {section.sectionType === 'about_me' && (
        <AboutMeEditor data={draft} onChange={update} />
      )}
      {section.sectionType === 'basic_info' && (
        <BasicInfoEditor data={draft} onChange={update} />
      )}
      {section.sectionType === 'work_with_me' && (
        <WorkWithMeEditor data={draft} onChange={update} />
      )}
      {(section.sectionType === 'strengths' || section.sectionType === 'weaknesses') && (
        <StrengthsEditor data={draft} onChange={update} type={section.sectionType} />
      )}
      {section.sectionType === 'skills' && (
        <SkillsEditor data={draft} onChange={update} />
      )}
      {section.sectionType === 'personality' && (
        <PersonalityEditor data={draft} onChange={update} />
      )}
      {(section.sectionType === 'things_i_love' || section.sectionType === 'things_i_hate' || section.sectionType === 'fun_facts' || section.sectionType === 'hobbies' || section.sectionType === 'goals' || section.sectionType === 'quotes') && (
        <ListEditor data={draft} onChange={update} fieldKey="items" placeholder={`Add a ${meta.label.toLowerCase()} item…`} />
      )}
      {section.sectionType === 'my_story' && (
        <MyStoryEditor data={draft} onChange={update} />
      )}
      {section.sectionType === 'books' && (
        <BooksEditor data={draft} onChange={update} />
      )}
      {!SECTION_TYPES.some((t) => t.type === section.sectionType) && (
        <GenericEditor data={draft} onChange={(v) => { setDraft(v); setDirty(true); }} />
      )}
    </motion.div>
  );
}

// ─── Field helpers ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors resize-none"
    />
  );
}

// ─── Section-specific editors ────────────────────────────────────────────────
function AboutMeEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  return (
    <Field label="Your bio">
      <TextArea
        value={data.content ?? ''}
        onChange={(v) => onChange({ content: v })}
        placeholder="Tell people about yourself — your background, values, and what makes you unique…"
        rows={8}
      />
    </Field>
  );
}

function BasicInfoEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const set = (key: string, val: string) => onChange({ [key]: val });
  return (
    <div className="space-y-0">
      <Field label="Full name"><TextInput value={data.fullName} onChange={(v) => set('fullName', v)} placeholder="Your full name" /></Field>
      <Field label="Nickname"><TextInput value={data.nickname} onChange={(v) => set('nickname', v)} placeholder="What do people call you?" /></Field>
      <Field label="Pronouns"><TextInput value={data.pronouns} onChange={(v) => set('pronouns', v)} placeholder="they/them, she/her, he/him…" /></Field>
      <Field label="Job title"><TextInput value={data.jobTitle} onChange={(v) => set('jobTitle', v)} placeholder="Senior Engineer, Designer…" /></Field>
      <Field label="Company"><TextInput value={data.company} onChange={(v) => set('company', v)} placeholder="Where do you work?" /></Field>
      <Field label="Location"><TextInput value={data.location} onChange={(v) => set('location', v)} placeholder="City, Country" /></Field>
      <Field label="Website"><TextInput value={data.website} onChange={(v) => set('website', v)} placeholder="https://yoursite.com" /></Field>
      <Field label="Tagline"><TextInput value={data.tagline} onChange={(v) => set('tagline', v)} placeholder="A short sentence that describes you" /></Field>
    </div>
  );
}

function WorkWithMeEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const set = (key: string, val: string) => onChange({ [key]: val });
  return (
    <div>
      <Field label="Communication style"><TextInput value={data.communicationStyle} onChange={(v) => set('communicationStyle', v)} placeholder="Direct and concise, collaborative…" /></Field>
      <Field label="Meeting preference"><TextInput value={data.meetingPreference} onChange={(v) => set('meetingPreference', v)} placeholder="Async first, short calls when needed…" /></Field>
      <Field label="Feedback preference"><TextInput value={data.feedbackPreference} onChange={(v) => set('feedbackPreference', v)} placeholder="How do you like to give/receive feedback?" /></Field>
      <Field label="Peak productive hours"><TextInput value={data.peakHours} onChange={(v) => set('peakHours', v)} placeholder="9am–1pm, 8pm–11pm…" /></Field>
      <Field label="Preferred tools (comma separated)">
        <TextInput
          value={Array.isArray(data.tools) ? data.tools.join(', ') : (data.tools ?? '')}
          onChange={(v) => onChange({ tools: v.split(',').map((x: string) => x.trim()).filter(Boolean) })}
          placeholder="Slack, Notion, Figma, Linear…"
        />
      </Field>
    </div>
  );
}

function StrengthsEditor({ data, onChange, type }: { data: any; onChange: (p: any) => void; type: string }) {
  const items: Array<{ title: string; emoji: string; growthNote?: string }> = data.items ?? [];
  const addItem = () => onChange({ items: [...items, { title: '', emoji: '⭐', growthNote: '' }] });
  const removeItem = (i: number) => onChange({ items: items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, patch: any) => onChange({ items: items.map((it, idx) => idx === i ? { ...it, ...patch } : it) });

  return (
    <div>
      <div className="space-y-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-border-default">
            <div className="flex gap-3 mb-2">
              <TextInput value={item.emoji} onChange={(v) => updateItem(i, { emoji: v })} placeholder="⭐" />
              <div className="flex-1">
                <TextInput value={item.title} onChange={(v) => updateItem(i, { title: v })} placeholder={type === 'weaknesses' ? 'Growth area…' : 'Strength…'} />
              </div>
              <button onClick={() => removeItem(i)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 self-start mt-3">
                <X className="w-4 h-4" />
              </button>
            </div>
            {type === 'weaknesses' && (
              <TextInput value={item.growthNote ?? ''} onChange={(v) => updateItem(i, { growthNote: v })} placeholder="What are you doing to improve?" />
            )}
          </div>
        ))}
      </div>
      <button onClick={addItem} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
}

function SkillsEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const skills: Array<{ name: string; level: number; category: string; yearsExp: number }> = data.skills ?? [];
  const addSkill = () => onChange({ skills: [...skills, { name: '', level: 3, category: '', yearsExp: 1 }] });
  const removeSkill = (i: number) => onChange({ skills: skills.filter((_, idx) => idx !== i) });
  const updateSkill = (i: number, patch: any) => onChange({ skills: skills.map((s, idx) => idx === i ? { ...s, ...patch } : s) });

  return (
    <div>
      <div className="space-y-3 mb-4">
        {skills.map((skill, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-border-default">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-xs text-slate-500 mb-1">Skill name</p>
                <TextInput value={skill.name} onChange={(v) => updateSkill(i, { name: v })} placeholder="TypeScript" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <TextInput value={skill.category} onChange={(v) => updateSkill(i, { category: v })} placeholder="Frontend, Backend…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Level (1–5): {skill.level}</p>
                <input
                  type="range" min={1} max={5} value={skill.level}
                  onChange={(e) => updateSkill(i, { level: Number(e.target.value) })}
                  className="w-full accent-primary-500"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Years of experience</p>
                <input
                  type="number" min={0} max={50} value={skill.yearsExp}
                  onChange={(e) => updateSkill(i, { yearsExp: Number(e.target.value) })}
                  className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <button onClick={() => removeSkill(i)} className="mt-2 text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        ))}
      </div>
      <button onClick={addSkill} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        <Plus className="w-4 h-4" /> Add skill
      </button>
    </div>
  );
}

function PersonalityEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const mbtiTypes = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
  return (
    <div>
      <Field label="Personality system">
        <select
          value={data.system ?? 'mbti'}
          onChange={(e) => onChange({ system: e.target.value })}
          className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="mbti">MBTI (16 Personalities)</option>
          <option value="big_five">Big Five</option>
          <option value="enneagram">Enneagram</option>
          <option value="disc">DISC</option>
          <option value="other">Other</option>
        </select>
      </Field>
      {data.system === 'mbti' || !data.system ? (
        <Field label="MBTI Type">
          <div className="grid grid-cols-4 gap-2">
            {mbtiTypes.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ typeCode: t })}
                className={`py-2 rounded-xl text-sm font-bold transition-colors ${
                  data.typeCode === t
                    ? 'bg-primary-500 text-white'
                    : 'glass border border-border-default text-slate-400 hover:text-white hover:border-primary-500/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
      ) : (
        <Field label="Type code / result">
          <TextInput value={data.typeCode} onChange={(v) => onChange({ typeCode: v })} placeholder="Your result…" />
        </Field>
      )}
      <Field label="Description (optional)">
        <TextArea value={data.description ?? ''} onChange={(v) => onChange({ description: v })} placeholder="Describe what this type means to you…" rows={3} />
      </Field>
    </div>
  );
}

function ListEditor({ data, onChange, fieldKey, placeholder }: { data: any; onChange: (p: any) => void; fieldKey: string; placeholder: string }) {
  const items: string[] = data[fieldKey] ?? [];
  const add = () => onChange({ [fieldKey]: [...items, ''] });
  const remove = (i: number) => onChange({ [fieldKey]: items.filter((_, idx) => idx !== i) });
  const update = (i: number, val: string) => onChange({ [fieldKey]: items.map((it, idx) => idx === i ? val : it) });

  return (
    <div>
      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput value={item} onChange={(v) => update(i, v)} placeholder={placeholder} />
            <button onClick={() => remove(i)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
}

function MyStoryEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const events: Array<{ year: number; title: string; emoji: string; desc?: string }> = data.events ?? [];
  const add = () => onChange({ events: [...events, { year: new Date().getFullYear(), title: '', emoji: '⭐', desc: '' }] });
  const remove = (i: number) => onChange({ events: events.filter((_, idx) => idx !== i) });
  const update = (i: number, patch: any) => onChange({ events: events.map((e, idx) => idx === i ? { ...e, ...patch } : e) });

  return (
    <div>
      <div className="space-y-3 mb-4">
        {events.map((event, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-border-default">
            <div className="flex gap-3 mb-2">
              <div className="w-16">
                <p className="text-xs text-slate-500 mb-1">Year</p>
                <input
                  type="number" value={event.year}
                  onChange={(e) => update(i, { year: Number(e.target.value) })}
                  className="w-full bg-bg-elevated border border-border-default rounded-xl px-2 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="w-12">
                <p className="text-xs text-slate-500 mb-1">Emoji</p>
                <TextInput value={event.emoji} onChange={(v) => update(i, { emoji: v })} placeholder="⭐" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Event title</p>
                <TextInput value={event.title} onChange={(v) => update(i, { title: v })} placeholder="What happened?" />
              </div>
              <button onClick={() => remove(i)} className="text-slate-600 hover:text-red-400 transition-colors self-end mb-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <TextInput value={event.desc ?? ''} onChange={(v) => update(i, { desc: v })} placeholder="Optional description…" />
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        <Plus className="w-4 h-4" /> Add event
      </button>
    </div>
  );
}

function BooksEditor({ data, onChange }: { data: any; onChange: (p: any) => void }) {
  const books: Array<{ title: string; author: string; rating: number }> = data.items ?? [];
  const add = () => onChange({ items: [...books, { title: '', author: '', rating: 5 }] });
  const remove = (i: number) => onChange({ items: books.filter((_, idx) => idx !== i) });
  const update = (i: number, patch: any) => onChange({ items: books.map((b, idx) => idx === i ? { ...b, ...patch } : b) });

  return (
    <div>
      <div className="space-y-3 mb-4">
        {books.map((book, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-border-default">
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <TextInput value={book.title} onChange={(v) => update(i, { title: v })} placeholder="Book title" />
              </div>
              <button onClick={() => remove(i)} className="text-slate-600 hover:text-red-400 transition-colors self-start mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <TextInput value={book.author} onChange={(v) => update(i, { author: v })} placeholder="Author" />
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((r) => (
                  <button key={r} onClick={() => update(i, { rating: r })} className={`text-xl ${r <= book.rating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        <Plus className="w-4 h-4" /> Add book
      </button>
    </div>
  );
}

function GenericEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const [raw, setRaw] = useState(JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState('');

  const handleChange = (val: string) => {
    setRaw(val);
    try {
      onChange(JSON.parse(val));
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">Edit raw JSON data for this section.</p>
      <TextArea value={raw} onChange={handleChange} rows={12} />
      {jsonError && <p className="text-red-400 text-xs mt-1">{jsonError}</p>}
    </div>
  );
}

// ─── Default data per section type ──────────────────────────────────────────
function defaultData(type: string): Record<string, any> {
  switch (type) {
    case 'about_me':     return { content: '' };
    case 'basic_info':   return { fullName: '', nickname: '', pronouns: '', jobTitle: '', company: '', location: '', website: '', tagline: '' };
    case 'work_with_me': return { communicationStyle: '', meetingPreference: '', feedbackPreference: '', peakHours: '', tools: [] };
    case 'strengths':    return { items: [] };
    case 'weaknesses':   return { items: [] };
    case 'skills':       return { skills: [] };
    case 'personality':  return { system: 'mbti', typeCode: '', description: '' };
    case 'my_story':     return { events: [] };
    case 'things_i_love':return { items: [] };
    case 'things_i_hate':return { items: [] };
    case 'fun_facts':    return { items: [] };
    case 'hobbies':      return { items: [] };
    case 'goals':        return { items: [] };
    case 'quotes':       return { items: [] };
    case 'books':        return { items: [] };
    default:             return {};
  }
}
