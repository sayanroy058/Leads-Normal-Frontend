// Defaults to the deployed backend on Vercel. Override per environment with
// VITE_API_URL (e.g. "/api" in dev to go through the Vite proxy to localhost:3001).
// An EMPTY VITE_API_URL is treated as unset so it falls back to the real backend
// instead of accidentally issuing same-origin requests against the frontend host.
const RAW_API: string = import.meta.env.VITE_API_URL ?? "";
const API_BASE: string = RAW_API.trim().length > 0 ? RAW_API : "https://leads-normal-backend.vercel.app/api";

function getToken(): string | null {
  try { return localStorage.getItem("auth_token"); } catch { return null; }
}

function qs(params?: Record<string, string | undefined>): string {
  if (!params) return "";
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  is_admin: boolean;
  disabled: boolean;
  gmail_email: string | null;
  has_gmail: boolean;
  created_at: string;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: number; name: string | null; email: string; is_admin: boolean } }>("POST", "/auth/register", data),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: { id: number; name: string | null; email: string; is_admin: boolean } }>("POST", "/auth/login", data),
  logout: () => request("POST", "/auth/logout"),
  getMe: () => request<{ user: { id: number; name: string | null; email: string; is_admin: boolean } | null }>("GET", "/auth/me"),

  // Admin — user access management
  getAdminUsers: () => request<AdminUser[]>("GET", "/admin/users"),
  createAdminUser: (data: { name?: string; email: string; password: string; is_admin?: boolean; gmail_email?: string; gmail_app_password?: string }) =>
    request<AdminUser & { first_sync: { synced: number; total: number } | null }>("POST", "/admin/users", data),
  deleteAdminUser: (id: number) => request<{ success: boolean }>("DELETE", `/admin/users/${id}`),
  disableAdminUser: (id: number) => request<{ success: boolean }>("POST", `/admin/users/${id}/disable`),
  enableAdminUser: (id: number) => request<{ success: boolean }>("POST", `/admin/users/${id}/enable`),
  resetAdminUserPassword: (id: number, password: string) =>
    request<{ success: boolean }>("POST", `/admin/users/${id}/reset-password`, { password }),
  generateAdminUserPassword: (id: number) =>
    request<{ success: boolean; password: string }>("POST", `/admin/users/${id}/generate-password`),
  // Setting a Gmail app password triggers an immediate first sync on the
  // backend (awaited there, so this call can take several seconds — show a
  // spinner/wait state in the UI rather than treating it as instant).
  setAdminUserEmailCredentials: (id: number, data: { gmail_email?: string; gmail_app_password?: string }) =>
    request<{ success: boolean; first_sync?: { synced: number; total: number } | null }>("POST", `/admin/users/${id}/email-credentials`, data),

  // Leads
  getLeads: () => request<any[]>("GET", "/leads"),
  insertLeadsBulk: (data: any[]) => request<any[]>("POST", "/leads/bulk", data),
  updateLeadStatus: (id: string, status: string) => request("POST", "/leads/status", { id, status }),
  getLead: (id: string) => request<any>("GET", `/leads/${id}`),
  updateLead: (id: string, data: any) => request<any>("PUT", `/leads/${id}`, data),
  deleteLead: (id: string) => request<any>("DELETE", `/leads/${id}`),
  deleteLeadsBulk: (ids: string[]) => request<{ success: boolean; deleted: number }>("POST", "/leads/bulk-delete", { ids }),
  getActivityCounts: () => request<{ emails: number; whatsapps: number; calls: number; appts: number }>("GET", "/leads/activity/counts"),
  getActivityFeed: () => request<any[]>("GET", "/leads/activity/feed"),

  // Chat
  getChatMessages: () => request<any[]>("GET", "/messages/chat"),
  insertChatMessage: (data: { role: string; content: string; citations?: string[] }) => request<{ id: string }>("POST", "/messages/chat", data),

  // Email
  getEmails: () => request<any[]>("GET", "/messages/emails"),
  insertEmails: (data: any[]) => request<{ success: boolean; items: { id: string; lead_id: string }[] }>("POST", "/messages/emails", data),
  updateEmailStatus: (data: { id: string; status: string; sent_at?: string; delivered_at?: string; opened_at?: string }) => request("POST", "/messages/emails/status", data),
  sendEmail: (id: string) => request<any>("POST", "/messages/emails/send", { id }),
  syncInbox: () => request<{ synced: number; total: number }>("POST", "/messages/emails/sync"),

  // WhatsApp
  getWhatsapps: () => request<any[]>("GET", "/messages/whatsapps"),
  insertWhatsapps: (data: any[]) => request<{ success: boolean; items: { id: string; lead_id: string }[] }>("POST", "/messages/whatsapps", data),
  updateWhatsappStatus: (data: { id: string; status: string; sent_at?: string; delivered_at?: string; read_at?: string }) => request("POST", "/messages/whatsapps/status", data),
  sendWhatsapp: (id: string) => request<any>("POST", "/messages/whatsapps/send", { id }),
  sendWhatsappTo: (leadId: string, body: string) => request<any>("POST", "/messages/whatsapps/send", { lead_id: leadId, body }),

  // Calls
  getCallLogs: () => request<any[]>("GET", "/messages/calls"),
  insertCallLogs: (data: any[]) => request<any[]>("POST", "/messages/calls", data),
  updateCallLog: (data: any) => request("POST", "/messages/calls/status", data),

  // Appointments
  getAppointments: () => request<any[]>("GET", "/messages/appointments"),
  insertAppointment: (data: any) => request("POST", "/messages/appointments", data),

  // AI
  aiChat: (data: { question: string; leads: any[]; history?: { role: "user" | "assistant"; content: string }[] }) => request<{ text: string; citations: string[] }>("POST", "/ai/chat", data),
  aiComposeEmail: (data: { lead: any; tone: string; goal: string; senderName?: string }) => request<{ subject: string; body: string }>("POST", "/ai/email", data),
  aiComposeWhatsapp: (data: { lead: any; intent: string }) => request<{ body: string }>("POST", "/ai/whatsapp", data),
  aiCallScript: (data: { lead: any; goal: string }) => request<any>("POST", "/ai/call", data),
  aiImage: (data: { prompt: string; size?: string }) => request<{ image: string }>("POST", "/ai/image", data),
  aiPost: (data: { topic: string; platform?: string; audience?: string; tone?: string }) =>
    request<{ caption: string; hashtags: string[]; image_prompt: string }>("POST", "/ai/post", data),

  // Conversations (Phase 0 — one thread per contact)
  getConversations: (params?: { status?: string; sla?: string }) => request<any[]>("GET", `/conversations${qs(params)}`),
  getConversation: (id: string) => request<{ conversation: any; events: any[] }>("GET", `/conversations/${id}`),
  addConversationNote: (id: string, content: string) => request<any>("POST", `/conversations/${id}/events`, { content }),
  setConversationStatus: (id: string, status: string) => request<any>("POST", `/conversations/${id}/status`, { status }),
};
