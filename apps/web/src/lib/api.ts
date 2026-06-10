import { getIdToken } from './firebase';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function getHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const syncUser   = ()           => request<DbUser>('/auth/sync', { method: 'POST' });

// ── Users ─────────────────────────────────────────────────────────────────────
export const getMe      = ()           => request<DbUser>('/users/me');
export const updateMe   = (data: any)  => request<DbUser>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
export const getProfile = (username: string) => request<any>(`/users/${username}`);
export const searchUsers = (q: string) => request<any>(`/users/search?q=${encodeURIComponent(q)}`);
export const followUser = (id: string) => request<any>(`/users/${id}/follow`, { method: 'POST' });
export const unfollowUser = (id: string) => request<any>(`/users/${id}/follow`, { method: 'DELETE' });

// ── Manuals ───────────────────────────────────────────────────────────────────
export const listManuals    = (limit = 20, offset = 0) => request<any[]>(`/manuals?limit=${limit}&offset=${offset}`);
export const getMyManual    = ()           => request<any>('/manuals/me');
export const getManual      = (slug: string) => request<any>(`/manuals/${slug}`);
export const createManual   = (data: any)  => request<any>('/manuals', { method: 'POST', body: JSON.stringify(data) });
export const updateManual   = (id: string, data: any) => request<any>(`/manuals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const publishManual  = (id: string) => request<any>(`/manuals/${id}/publish`, { method: 'POST' });
export const unpublishManual = (id: string) => request<any>(`/manuals/${id}/unpublish`, { method: 'POST' });
export const deleteManual   = (id: string) => request<void>(`/manuals/${id}`, { method: 'DELETE' });
export const getComments    = (id: string) => request<any[]>(`/manuals/${id}/comments`);
export const addComment     = (id: string, content: string, parentId?: string) =>
  request<any>(`/manuals/${id}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) });

// ── Sections ──────────────────────────────────────────────────────────────────
export const listSections   = (manualId: string) => request<any[]>(`/manuals/${manualId}/sections`);
export const createSection  = (manualId: string, data: any) =>
  request<any>(`/manuals/${manualId}/sections`, { method: 'POST', body: JSON.stringify(data) });
export const updateSection  = (sectionId: string, data: any) =>
  request<any>(`/sections/${sectionId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteSection  = (sectionId: string) =>
  request<void>(`/sections/${sectionId}`, { method: 'DELETE' });
export const reorderSections = (manualId: string, sections: Array<{ id: string; position: number }>) =>
  request<any[]>(`/manuals/${manualId}/sections/reorder`, { method: 'PATCH', body: JSON.stringify({ sections }) });

// ── Invites ───────────────────────────────────────────────────────────────────
export const sendInvites   = (emails: string[], message?: string) =>
  request<InviteResult[]>('/invites', { method: 'POST', body: JSON.stringify({ emails, message }) });
export const listMyInvites = () => request<SentInvite[]>('/invites');
export const getInvite     = (token: string) => request<InviteDetails>('/invites/' + token);
export const acceptInvite  = (token: string) =>
  request<{ accepted: boolean }>('/invites/' + token + '/accept', { method: 'POST' });
export const revokeInvite  = (id: string) =>
  request<{ revoked: boolean }>('/invites/' + id, { method: 'DELETE' });

// ── Company / Employees ───────────────────────────────────────────────────────
export const getEmployees        = ()                    => request<any[]>('/companies/employees');
export const addEmployee         = (data: any)           => request<any>('/companies/employees', { method: 'POST', body: JSON.stringify(data) });
export const removeEmployee      = (id: string)          => request<void>(`/companies/employees/${id}`, { method: 'DELETE' });
export const bulkImportEmployees = (employees: any[])    => request<any>('/companies/employees/bulk', { method: 'POST', body: JSON.stringify({ employees }) });
export const sendReminderEmail   = (id: string, email: string) => request<any>('/companies/reminders', { method: 'POST', body: JSON.stringify({ employeeId: id, email }) });

// ── Types ─────────────────────────────────────────────────────────────────────
export interface InviteResult {
  email:     string;
  token:     string;
  emailSent: boolean;
}

export interface SentInvite {
  id:          string;
  toEmail:     string;
  status:      'pending' | 'accepted' | 'revoked';
  createdAt:   string;
  expiresAt:   string;
  acceptedAt:  string | null;
}

export interface InviteDetails {
  id:            string;
  toEmail:       string;
  status:        'pending' | 'accepted' | 'revoked';
  message:       string | null;
  expiresAt:     string;
  createdAt:     string;
  fromName:      string | null;
  fromUsername:  string | null;
  fromAvatar:    string | null;
  alreadyAccepted?: boolean;
}

export interface DbUser {
  id:             string;
  firebaseUid:    string;
  email:          string;
  username:       string | null;
  displayName:    string | null;
  avatarUrl:      string | null;
  role:           string;
  onboardingStep: number;
  createdAt:      string;
}
