import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ShieldAlert, UserPlus, Trash2, Ban, CheckCircle2, KeyRound, Loader2, Copy, Check, X, ShieldCheck, Mail, MailCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api, type AdminUser } from "@/api/client";
import { useAuth } from "@/lib/auth-client";
import {
  PageHeader, EmptyState, Avatar, timeAgo, Pill, TableSkeleton, btnPrimary, btnOutline, inputCls,
} from "@/components/shared";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin — Leads Normal" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [emailTarget, setEmailTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Guard: non-admins can't reach this page.
    if (user && !user.is_admin) {
      toast.error("Admins only", { description: "You don't have access to the admin panel." });
      navigate({ to: "/app", replace: true });
    }
  }, [user, navigate]);

  async function load() {
    setLoading(true);
    try {
      setUsers(await api.getAdminUsers());
    } catch (err) {
      toast.error("Couldn't load users", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (user?.is_admin) load(); }, [user]);

  if (!user?.is_admin) return null;

  async function toggleDisabled(u: AdminUser) {
    try {
      if (u.disabled) {
        await api.enableAdminUser(u.id);
        toast.success(`${u.name ?? u.email} re-enabled`);
      } else {
        await api.disableAdminUser(u.id);
        toast.success(`${u.name ?? u.email} disabled`);
      }
      load();
    } catch (err) {
      toast.error("Action failed", { description: (err as Error).message });
    }
  }

  async function removeUser(u: AdminUser) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await api.deleteAdminUser(u.id);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error("Delete failed", { description: (err as Error).message });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin — User access"
        description="Create, disable, or remove workspace users, and reset passwords. Public sign-up is disabled — this is the only way to add accounts."
        badge={
          <Pill className="bg-brand/15 text-brand">
            <ShieldAlert className="h-3 w-3" /> Admin
          </Pill>
        }
      >
        <button onClick={() => setShowCreate(true)} className={btnPrimary}>
          <UserPlus className="h-4 w-4" /> New user
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : users.length === 0 ? (
          <EmptyState icon={UserPlus} title="No users yet" description="Create the first workspace user to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Mail account</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name ?? u.email} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.name ?? "—"}</div>
                          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <Pill className="bg-brand/15 text-brand"><ShieldCheck className="h-3 w-3" /> Admin</Pill>
                      ) : (
                        <Pill className="bg-muted text-muted-foreground">User</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.disabled ? (
                        <Pill className="bg-destructive/15 text-destructive"><Ban className="h-3 w-3" /> Disabled</Pill>
                      ) : (
                        <Pill className="bg-success/25 text-success-foreground"><CheckCircle2 className="h-3 w-3" /> Active</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.has_gmail ? (
                        <Pill className="bg-success/25 text-success-foreground"><MailCheck className="h-3 w-3" /> {u.gmail_email}</Pill>
                      ) : (
                        <Pill className="bg-muted text-muted-foreground">Not set</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEmailTarget(u)}
                          title="Email sending settings"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setResetTarget(u)}
                          title="Reset password"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleDisabled(u)}
                          disabled={u.id === user!.id}
                          title={u.disabled ? "Enable" : "Disable"}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                          {u.disabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => removeUser(u)}
                          disabled={u.id === user!.id}
                          title="Delete"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      {emailTarget && <EmailCredentialsModal user={emailTarget} onClose={() => setEmailTarget(null)} onSaved={load} />}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Check your details", { description: "Enter a valid email and a password of at least 6 characters." });
      return;
    }
    const hasGmail = !!(gmailEmail.trim() && gmailAppPassword.trim());
    setBusy(true);
    try {
      const created = await api.createAdminUser({
        name: name.trim() || undefined,
        email: email.trim(),
        password,
        is_admin: isAdmin,
        gmail_email: gmailEmail.trim() || undefined,
        gmail_app_password: gmailAppPassword.trim() || undefined,
      });
      if (hasGmail && created.first_sync) {
        toast.success("User created", { description: `Synced ${created.first_sync.synced} of ${created.first_sync.total} emails from their inbox.` });
      } else if (hasGmail) {
        toast.success("User created", { description: "First inbox sync failed — they can retry from Email Studio." });
      } else {
        toast.success("User created");
      }
      onCreated();
      onClose();
    } catch (err) {
      toast.error("Couldn't create user", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title="New user" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" className={`${inputCls} mt-1`} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Email (login)</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={`${inputCls} mt-1`} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Temporary password</span>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputCls} mt-1`} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Grant admin access
        </label>

        <div className="relative pt-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground before:absolute before:left-0 before:top-1/2 before:h-px before:w-[38%] before:bg-border after:absolute after:right-0 after:top-1/2 after:h-px after:w-[38%] after:bg-border">
          Email sending (optional)
        </div>
        <p className="text-[11px] text-muted-foreground">
          Used to send/receive email as this user. Leave blank to configure later — this user's Email Studio stays inactive until set.
          Setting it here triggers an immediate first sync of their inbox (can take a few seconds).
        </p>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Gmail address</span>
          <input type="email" value={gmailEmail} onChange={(e) => setGmailEmail(e.target.value)} placeholder="agent@gmail.com" className={`${inputCls} mt-1`} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Gmail app password</span>
          <input type="text" value={gmailAppPassword} onChange={(e) => setGmailAppPassword(e.target.value)} placeholder="16-character app password" className={`${inputCls} mt-1`} />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={btnOutline}>Cancel</button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy && gmailEmail.trim() && gmailAppPassword.trim() ? "Creating & syncing…" : "Create"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function EmailCredentialsModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [gmailEmail, setGmailEmail] = useState(user.gmail_email ?? "");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const appPassword = gmailAppPassword.trim();
    setBusy(true);
    try {
      const res = await api.setAdminUserEmailCredentials(user.id, {
        gmail_email: gmailEmail.trim() || undefined,
        gmail_app_password: appPassword || undefined,
      });
      if (appPassword && res.first_sync) {
        toast.success("Email settings saved", { description: `Synced ${res.first_sync.synced} of ${res.first_sync.total} emails from their inbox.` });
      } else if (appPassword) {
        toast.success("Email settings saved", { description: "First inbox sync failed — they can retry from Email Studio." });
      } else {
        toast.success("Email settings saved");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Couldn't save", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function clearCreds() {
    setBusy(true);
    try {
      await api.setAdminUserEmailCredentials(user.id, {});
      toast.success("Email account cleared");
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Couldn't clear", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title={`Email settings — ${user.email}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <p className="text-[11px] text-muted-foreground">
          This Gmail account is used to send and sync email for this user only — other users never see it. Requires a Gmail App Password (not the account password).
          Saving a new password triggers an immediate first sync of their inbox (can take a few seconds).
        </p>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Gmail address</span>
          <input type="email" value={gmailEmail} onChange={(e) => setGmailEmail(e.target.value)} placeholder="agent@gmail.com" className={`${inputCls} mt-1`} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Gmail app password</span>
          <input
            type="text"
            value={gmailAppPassword}
            onChange={(e) => setGmailAppPassword(e.target.value)}
            placeholder={user.has_gmail ? "•••••••••••••••• (leave blank to keep)" : "16-character app password"}
            className={`${inputCls} mt-1`}
          />
        </label>
        <div className="flex items-center justify-between gap-2 pt-2">
          {user.has_gmail ? (
            <button type="button" onClick={clearCreds} disabled={busy} className="text-xs font-medium text-destructive hover:underline disabled:opacity-60">
              Remove email account
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={busy} className={btnOutline}>Cancel</button>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {busy && gmailAppPassword.trim() ? "Saving & syncing…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function ResetPasswordModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function setManually(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password too short", { description: "Use at least 6 characters." });
      return;
    }
    setBusy(true);
    try {
      await api.resetAdminUserPassword(user.id, password);
      toast.success("Password reset", { description: `${user.email} has been signed out everywhere.` });
      onClose();
    } catch (err) {
      toast.error("Reset failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    try {
      const r = await api.generateAdminUserPassword(user.id);
      setGenerated(r.password);
      toast.success("New password generated", { description: `${user.email} has been signed out everywhere.` });
    } catch (err) {
      toast.error("Couldn't generate password", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function copyGenerated() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <ModalShell title={`Reset password — ${user.email}`} onClose={onClose}>
      {generated ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Share this password with the user securely. It won't be shown again.</p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
            <code className="flex-1 truncate text-sm">{generated}</code>
            <button onClick={copyGenerated} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-accent">
              {copied ? <Check className="h-3.5 w-3.5 text-success-foreground" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className={btnPrimary}>Done</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={setManually} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">New password</span>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputCls} mt-1`} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className={btnOutline}>Cancel</button>
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Set password
              </button>
            </div>
          </form>
          <div className="relative text-center text-xs text-muted-foreground before:absolute before:left-0 before:top-1/2 before:h-px before:w-[42%] before:bg-border after:absolute after:right-0 after:top-1/2 after:h-px after:w-[42%] after:bg-border">
            or
          </div>
          <button type="button" onClick={generate} disabled={busy} className={`${btnOutline} w-full`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Generate random password
          </button>
        </div>
      )}
    </ModalShell>
  );
}
