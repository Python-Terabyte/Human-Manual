'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Plus, Mail, Bell, Trash2, Search, Users, Check, X,
  AlertCircle, Loader2, Download, Building2, BookOpen, ArrowLeft,
  ChevronDown, Eye, BarChart2, Settings, LogOut,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { sendReminderEmail, getEmployees, addEmployee, removeEmployee, bulkImportEmployees } from '@/lib/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  hasManual: boolean;
  reminderSent?: string | null;
  joinedAt: string;
}

// Placeholder data — replaced by real API data when backend is ready
const DEMO_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', phone: '+1 555 0101', department: 'Engineering', hasManual: true,  reminderSent: null, joinedAt: '2024-01-15' },
  { id: '2', name: 'Bob Smith',     email: 'bob@company.com',   phone: '+1 555 0102', department: 'Design',       hasManual: false, reminderSent: null, joinedAt: '2024-03-20' },
  { id: '3', name: 'Carol Davis',   email: 'carol@company.com', phone: '+1 555 0103', department: 'Marketing',    hasManual: true,  reminderSent: null, joinedAt: '2023-11-01' },
];

export default function CompanyDashboardPage() {
  const { firebaseUser, dbUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'employees' | 'import' | 'reminders'>('employees');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', department: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [importRows, setImportRows] = useState<Partial<Employee>[]>([]);
  const [importing, setImporting] = useState(false);
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !firebaseUser) router.replace('/login');
  }, [authLoading, firebaseUser, router]);

  // Load employees — falls back to demo data
  useEffect(() => {
    if (!dbUser) return;
    getEmployees()
      .then((res: any) => setEmployees(Array.isArray(res) ? res : DEMO_EMPLOYEES))
      .catch(() => setEmployees(DEMO_EMPLOYEES));
  }, [dbUser]);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Add individual employee ─────────────────────────────────────────────
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    setAddLoading(true);
    try {
      const res: any = await addEmployee(addForm).catch(() => null);
      const newEmp: Employee = res ?? {
        id: Date.now().toString(),
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone,
        department: addForm.department,
        hasManual: false,
        reminderSent: null,
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setEmployees((prev) => [...prev, newEmp]);
      setAddForm({ name: '', email: '', phone: '', department: '' });
      setAddOpen(false);
      showToast(`${newEmp.name} added successfully.`);
    } finally {
      setAddLoading(false);
    }
  };

  // ── Remove employee ─────────────────────────────────────────────────────
  const handleRemoveEmployee = async (id: string) => {
    if (!confirm('Remove this employee?')) return;
    await removeEmployee(id).catch(() => null);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Employee removed.');
  };

  // ── Excel / CSV import ──────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const parsed = rows.map((row, i) => ({
        id: `import-${i}`,
        name:       row.Name       || row.name       || row['Full Name'] || '',
        email:      row.Email      || row.email      || '',
        phone:      row.Phone      || row.phone      || row['Phone Number'] || '',
        department: row.Department || row.department || row.Team || '',
        hasManual:  false,
        reminderSent: null,
        joinedAt:   new Date().toISOString().split('T')[0],
      }));
      setImportRows(parsed.filter((r) => r.name || r.email));
      setTab('import');
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      await bulkImportEmployees(importRows).catch(() => null);
      setEmployees((prev) => {
        const existingEmails = new Set(prev.map((e) => e.email.toLowerCase()));
        const newOnes = importRows.filter((r) => !existingEmails.has((r.email ?? '').toLowerCase())) as Employee[];
        return [...prev, ...newOnes];
      });
      showToast(`${importRows.length} employee(s) imported successfully.`);
      setImportRows([]);
      setTab('employees');
    } finally {
      setImporting(false);
    }
  };

  // ── Send reminder ───────────────────────────────────────────────────────
  const handleSendReminder = async (emp: Employee) => {
    setReminderLoading(emp.id);
    try {
      await sendReminderEmail(emp.id, emp.email).catch(() => null);
      setEmployees((prev) =>
        prev.map((e) => e.id === emp.id ? { ...e, reminderSent: new Date().toISOString() } : e)
      );
      showToast(`Reminder sent to ${emp.name}.`);
    } finally {
      setReminderLoading(null);
    }
  };

  const handleBulkReminder = async () => {
    const needsReminder = employees.filter((e) => !e.hasManual);
    if (needsReminder.length === 0) { showToast('All employees already have a manual!'); return; }
    if (!confirm(`Send reminders to ${needsReminder.length} employee(s) without a manual?`)) return;
    setBulkReminderLoading(true);
    try {
      for (const emp of needsReminder) {
        await sendReminderEmail(emp.id, emp.email).catch(() => null);
      }
      setEmployees((prev) =>
        prev.map((e) => !e.hasManual ? { ...e, reminderSent: new Date().toISOString() } : e)
      );
      showToast(`Reminders sent to ${needsReminder.length} employee(s).`);
    } finally {
      setBulkReminderLoading(false);
    }
  };

  const filtered = employees.filter((e) =>
    !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.email.toLowerCase().includes(query.toLowerCase())
  );

  const completedCount = employees.filter((e) => e.hasManual).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const user = dbUser ?? { displayName: 'Company', email: '', username: null, avatarUrl: null };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-border-default p-6 flex flex-col z-40 hidden lg:flex">
        <Link href="/" className="text-xl font-black text-gradient mb-8 block">📖 Human Manual</Link>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Company</p>
        <nav className="flex-1 space-y-1">
          {[
            { icon: BarChart2, label: 'Dashboard',    href: '/companies/dashboard', active: true },
            { icon: Users,     label: 'Employees',    onClick: () => setTab('employees') },
            { icon: Upload,    label: 'Import',       onClick: () => setTab('import') },
            { icon: Bell,      label: 'Reminders',    onClick: () => setTab('reminders') },
            { icon: Settings,  label: 'Settings',     href: '/settings' },
          ].map(({ icon: Icon, label, href, active, onClick }) => (
            href ? (
              <Link key={label} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${active ? 'bg-primary-500/20 text-primary-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-bg-elevated'}`}
              >
                <Icon className="w-4 h-4" />{label}
              </Link>
            ) : (
              <button key={label} onClick={onClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm text-slate-400 hover:text-white hover:bg-bg-elevated w-full text-left"
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            )
          ))}
        </nav>
        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-secondary-500/20 flex items-center justify-center text-secondary-300 font-bold text-sm">
              {(user.displayName ?? user.email)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName ?? 'Company'}</p>
              <p className="text-xs text-slate-500 truncate">Company Admin</p>
            </div>
          </div>
          <button onClick={async () => { await signOut(); router.replace('/'); }} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-secondary-400" />
            <h1 className="text-2xl font-bold text-white">Company Dashboard</h1>
          </div>
          <p className="text-slate-400 text-sm">Manage your employees and their manuals.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Employees', value: employees.length,     color: 'text-blue-400' },
            { label: 'Manuals Created', value: completedCount,       color: 'text-green-400' },
            { label: 'Pending',         value: employees.length - completedCount, color: 'text-yellow-400' },
            { label: 'Completion Rate', value: employees.length > 0 ? `${Math.round((completedCount / employees.length) * 100)}%` : '0%', color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-2xl p-4 border border-border-default">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 border-b border-border-subtle pb-0">
          {(['employees', 'import', 'reminders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize -mb-px border-b-2 ${
                tab === t
                  ? 'text-primary-300 border-primary-500'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {t === 'import' ? 'Import Employees' : t === 'reminders' ? 'Send Reminders' : 'Employees'}
            </button>
          ))}
        </div>

        {/* ── Employees tab ── */}
        {tab === 'employees' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search employees…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-bg-elevated border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Employee
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border-default text-slate-300 text-sm hover:border-primary-500/40 transition-colors flex-shrink-0"
              >
                <Upload className="w-4 h-4" /> Import Excel
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">{query ? 'No employees match your search.' : 'No employees yet. Add some above.'}</p>
              </div>
            ) : (
              <div className="glass rounded-2xl border border-border-default overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Employee</th>
                      <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden md:table-cell">Contact</th>
                      <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden lg:table-cell">Department</th>
                      <th className="text-center px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Manual</th>
                      <th className="text-right px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filtered.map((emp) => (
                      <tr key={emp.id} className="hover:bg-bg-elevated/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-xs flex-shrink-0">
                              {emp.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell">{emp.phone || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell">{emp.department || '—'}</td>
                        <td className="px-5 py-3.5 text-center">
                          {emp.hasManual ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Created
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-700/30 border border-border-subtle px-2 py-0.5 rounded-full">
                              <X className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleSendReminder(emp)}
                              disabled={reminderLoading === emp.id}
                              title="Send reminder email"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                            >
                              {reminderLoading === emp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRemoveEmployee(emp.id)}
                              title="Remove employee"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Import tab ── */}
        {tab === 'import' && (
          <div>
            <div className="glass rounded-2xl border border-border-default p-8 text-center mb-6">
              <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Upload Employee Spreadsheet</h3>
              <p className="text-slate-400 text-sm mb-2">
                Upload an Excel (.xlsx, .xls) or CSV file. Columns should include:
              </p>
              <p className="text-xs text-slate-500 mb-6 font-mono bg-bg-elevated rounded-lg px-4 py-2 inline-block">
                Name | Email | Phone | Department
              </p>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Choose File
                </button>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
              </div>

              <p className="text-xs text-slate-600 mt-4">
                Tip: Export your HR system to CSV and upload here. We handle the rest.
              </p>
            </div>

            {importRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-semibold">{importRows.length} employees ready to import</p>
                  <div className="flex gap-2">
                    <button onClick={() => setImportRows([])} className="px-4 py-2 rounded-xl glass border border-border-default text-slate-400 text-sm hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={importing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
                    >
                      {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Confirm Import
                    </button>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border-default overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                        <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider hidden lg:table-cell">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {importRows.map((row, i) => (
                        <tr key={i} className="hover:bg-bg-elevated/50">
                          <td className="px-5 py-3 text-white">{row.name || '—'}</td>
                          <td className="px-5 py-3 text-slate-400">{row.email || '—'}</td>
                          <td className="px-5 py-3 text-slate-400 hidden md:table-cell">{row.phone || '—'}</td>
                          <td className="px-5 py-3 text-slate-400 hidden lg:table-cell">{row.department || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reminders tab ── */}
        {tab === 'reminders' && (
          <div>
            <div className="glass rounded-2xl border border-border-default p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Send Bulk Reminders</h3>
                  <p className="text-sm text-slate-400">
                    Automatically email all employees who haven't created or updated their manual yet.
                    {employees.filter((e) => !e.hasManual).length > 0 && (
                      <span className="text-yellow-400 ml-1">({employees.filter((e) => !e.hasManual).length} pending)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleBulkReminder}
                  disabled={bulkReminderLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors flex-shrink-0"
                >
                  {bulkReminderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send to All Pending
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl border border-border-default overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Reminder</th>
                    <th className="text-right px-5 py-3 text-xs text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {emp.hasManual ? (
                          <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">Manual Created</span>
                        ) : (
                          <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">Needs Manual</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-500 text-xs hidden md:table-cell">
                        {emp.reminderSent ? new Date(emp.reminderSent).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleSendReminder(emp)}
                          disabled={reminderLoading === emp.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 disabled:opacity-50 transition-colors"
                        >
                          {reminderLoading === emp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass rounded-2xl border border-border-default p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Add Employee</h3>
                <button onClick={() => setAddOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                {[
                  { label: 'Full Name *',   key: 'name',       placeholder: 'Alice Johnson', required: true },
                  { label: 'Email *',        key: 'email',      placeholder: 'alice@company.com', required: true },
                  { label: 'Phone',          key: 'phone',      placeholder: '+1 555 0101', required: false },
                  { label: 'Department',     key: 'department', placeholder: 'Engineering', required: false },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key}>
                    <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
                    <input
                      type={key === 'email' ? 'email' : 'text'}
                      value={(addForm as any)[key]}
                      onChange={(e) => setAddForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="flex-1 py-3 rounded-xl glass border border-border-default text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Add Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium z-50 ${
              toast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
