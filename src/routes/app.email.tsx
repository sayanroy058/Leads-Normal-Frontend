import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Mail, Send, Loader2, Clock, Inbox, Eye, RefreshCw, Search, ArrowDownLeft, ArrowUpRight, Paperclip, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useLeads, updateLeadStatus } from "@/lib/leads-client";
import { parseStoredAttachments } from "@/lib/attachments";
import { EmailComposeModal } from "@/components/compose-email";
import { EmailReader } from "@/components/message-reader";
import { PageHeader, Avatar, timeAgo, btnPrimary, btnOutline, EmptyState, Pill } from "@/components/shared";

export const Route = createFileRoute("/app/email")({
  component: EmailStudio,
});

type Status = "draft" | "queued" | "sent" | "delivered" | "opened" | "failed" | "received";

interface EmailRow {
  id: string;
  lead_id: string | null;
  subject: string;
  body: string;
  tone: string | null;
  goal: string | null;
  status: Status;
  direction: "outbound" | "inbound" | null;
  from_email: string | null;
  to_email: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  attachments?: string | null;
  created_at: string;
}

const statusPills: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  queued: "bg-warning/20 text-warning-foreground",
  sent: "bg-sky/40 text-foreground",
  delivered: "bg-success/25 text-success-foreground",
  opened: "bg-lilac/50 text-foreground",
  received: "bg-sky/40 text-foreground",
  failed: "bg-destructive/15 text-destructive",
};

type Tab = "all" | "inbox" | "draft" | "queued" | "sent" | "delivered" | "opened";

const isInbound = (e: EmailRow) => e.direction === "inbound" || e.status === "received";

function EmailStudio() {
  const { leads, reload: reloadLeads } = useLeads();
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [composing, setComposing] = useState(false);
  const [reading, setReading] = useState<EmailRow | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);

  /** Load cached emails immediately — never block the page on Gmail. */
  async function loadEmails() {
    const data = await api.getEmails() as EmailRow[];
    if (data) setEmails(data);
  }

  /** Pull new mail from Gmail in the background, then refresh the list.
   * Runs without awaiting from callers so the UI stays responsive. */
  async function syncInbox() {
    setSyncing(true);
    try {
      const res = await api.syncInbox();
      if (res?.synced) await loadEmails();
    } catch {
      /* Gmail not configured, or sync failed — cached mail still shown */
    } finally {
      setSyncing(false);
    }
  }

  function refresh() {
    // Manual "Sync inbox" click: show cached data right away (already in
    // state), kick sync in the background, and don't make the caller wait.
    void syncInbox();
  }

  useEffect(() => {
    loadEmails();
    void syncInbox();
  }, []);

  const [sending, setSending] = useState<Set<string>>(new Set());
  // Whichever address the mail provider actually sent from/to most recently —
  // avoids hardcoding a provider-specific address that goes stale if the
  // backend's mail provider changes (e.g. AgentMail -> Gmail).
  const inboxAddress = useMemo(() => {
    const withAddr = emails.find((e) => e.from_email || e.to_email);
    return withAddr?.direction === "inbound" ? withAddr.to_email : withAddr?.from_email ?? null;
  }, [emails]);

  /** Send one email, retrying transient SMTP failures (Gmail throttling etc.). */
  async function sendEmail(e: EmailRow) {
    setSending((s) => new Set(s).add(e.id));
    try {
      let updated: EmailRow | null = null;
      let lastErr: Error | null = null;
      for (let attempt = 1; attempt <= 3 && !updated; attempt++) {
        try { updated = (await api.sendEmail(e.id)) as EmailRow; }
        catch (err) {
          lastErr = err as Error;
          if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt)); // backoff
        }
      }
      if (!updated) throw lastErr ?? new Error("Send failed");
      if (e.lead_id) { await updateLeadStatus(e.lead_id, "contacted"); reloadLeads(); }
      toast.success(updated.from_email ? `Email sent from ${updated.from_email}` : "Email sent");
    } catch (err) {
      toast.error("Send failed", { description: (err as Error).message });
    } finally {
      setSending((s) => { const n = new Set(s); n.delete(e.id); return n; });
      // Just re-read our own DB — the send already updated the row, no need
      // to re-sync Gmail (that would block on IMAP for no reason here).
      loadEmails();
    }
  }

  /** Send every draft one after another — a pause between each so Gmail
   *  doesn't throttle the burst, plus per-email retries as a safety net. */
  async function sendAllDrafts() {
    const drafts = emails.filter((e) => e.status === "draft" || e.status === "failed");
    if (!drafts.length) return;
    setSending((s) => new Set([...s, ...drafts.map((d) => d.id)]));
    let ok = 0;
    const failed: string[] = [];
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      let sent = false;
      for (let attempt = 1; attempt <= 3 && !sent; attempt++) {
        try { await api.sendEmail(d.id); sent = true; }
        catch {
          if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt));
          else failed.push((leads.find((l) => l.id === d.lead_id)?.name ?? d.subject.slice(0, 40)) || d.id.slice(0, 8));
        }
      }
      if (sent) ok++;
      // One at a time — pause between sends to avoid throttling.
      if (i < drafts.length - 1) await new Promise((r) => setTimeout(r, 4000));
    }
    setSending((s) => { const n = new Set(s); drafts.forEach((d) => n.delete(d.id)); return n; });
    if (failed.length === 0) toast.success(`${ok} email${ok === 1 ? "" : "s"} sent`);
    else toast.success(`${ok} email${ok === 1 ? "" : "s"} sent`, { description: `${failed.length} still in draft: ${failed.join(", ")}` });
    loadEmails();
  }

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(() => {
    const count = (pred: (e: EmailRow) => boolean) => emails.filter(pred).length;
    return [
      { key: "all", label: "All", count: emails.length },
      { key: "inbox", label: "Inbox", count: count(isInbound) },
      { key: "draft", label: "Drafts", count: count((e) => e.status === "draft" || e.status === "failed") },
      { key: "queued", label: "Queued", count: count((e) => e.status === "queued") },
      { key: "sent", label: "Sent", count: count((e) => e.status === "sent") },
      { key: "delivered", label: "Delivered", count: count((e) => e.status === "delivered") },
      { key: "opened", label: "Opened", count: count((e) => e.status === "opened") },
    ];
  }, [emails]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return emails.filter((e) => {
      if (tab === "inbox") { if (!isInbound(e)) return false; }
      else if (tab === "draft") { if (e.status !== "draft" && e.status !== "failed") return false; }
      else if (tab !== "all") { if (e.status !== tab) return false; }
      if (!term) return true;
      const lead = leads.find((l) => l.id === e.lead_id);
      return (
        e.subject.toLowerCase().includes(term) ||
        e.body.toLowerCase().includes(term) ||
        (lead?.name ?? "").toLowerCase().includes(term) ||
        (e.from_email ?? "").toLowerCase().includes(term) ||
        (e.to_email ?? "").toLowerCase().includes(term)
      );
    });
  }, [emails, leads, tab, q]);

  const draftCount = tabs.find((t) => t.key === "draft")?.count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Studio"
        description="Draft follow-ups, proposals and check-in emails with AI or write them yourself — attach docs and track delivery."
      >
        <button onClick={() => setComposing(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> New email
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="flex flex-1 items-center gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.key
                    ? "gradient-brand text-white shadow-glow"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {t.label} <span className={`tabular-nums ${tab === t.key ? "opacity-70" : "text-muted-foreground/70"}`}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {draftCount > 0 && (
              <button
                onClick={sendAllDrafts}
                disabled={sending.size > 0}
                className="inline-flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 text-xs font-medium text-white shadow-glow transition disabled:opacity-60"
              >
                {sending.size > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send all ({draftCount})
              </button>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search subject, lead…"
                className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring sm:w-56"
              />
            </div>
            <button
              onClick={refresh}
              disabled={syncing}
              className="grid h-7 w-7 place-items-center rounded-lg border border-border transition hover:bg-accent disabled:pointer-events-none disabled:opacity-60"
              title="Sync inbox"
              aria-label="Sync inbox"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* List */}
        {emails.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Mail}
              title="No emails yet"
              description="Draft with AI or write manually with the button above — or sync your inbox to pull in received mail."
            >
              <button onClick={() => refresh()} disabled={syncing} className={btnPrimary}>
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync inbox
              </button>
              <button onClick={() => setComposing(true)} className={btnOutline}>
                <Plus className="h-4 w-4" /> New email
              </button>
            </EmptyState>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
              <span>{filtered.length} email{filtered.length === 1 ? "" : "s"}</span>
              {inboxAddress && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Inbox className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{inboxAddress}</span>
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Lead</th>
                    <th className="px-4 py-2.5 text-left font-medium">Subject</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Tone</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Created</th>
                    <th className="px-4 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const lead = leads.find((l) => l.id === e.lead_id);
                    const inbound = isInbound(e);
                    const attachments = parseStoredAttachments(e.attachments);
                    return (
                      <tr key={e.id} onClick={() => setReading(e)} className={`cursor-pointer border-t border-border transition hover:bg-muted/30 ${inbound ? "bg-sky/[0.04]" : ""}`}>
                        <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                          {lead ? (
                            <Link to="/app/leads/$leadId" params={{ leadId: lead.id }} className="flex items-center gap-3">
                              <Avatar name={lead.name} className="h-8 w-8" />
                              <div className="min-w-0">
                                <div className="truncate font-medium leading-tight">{lead.name}</div>
                                <div className="truncate text-xs text-muted-foreground">{lead.company ?? lead.email ?? "—"}</div>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-[10px] font-semibold text-muted-foreground">?</div>
                              <div className="min-w-0">
                                <div className="truncate text-xs text-muted-foreground">{inbound ? e.from_email : e.to_email}</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="max-w-[280px] px-4 py-3">
                          <div className="flex items-start gap-2">
                            {inbound
                              ? <ArrowDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky" />
                              : <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-medium">{e.subject || "(no subject)"}</span>
                                {attachments.length > 0 && (
                                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground" title={attachments.map((a) => a.filename).join(", ")}>
                                    <Paperclip className="h-3 w-3" /> {attachments.length}
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">{e.body}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          {e.tone ? (
                            <Pill className="bg-muted text-muted-foreground">{e.tone}</Pill>
                          ) : inbound ? (
                            <span className="text-xs text-muted-foreground">received</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Pill className={statusPills[inbound ? "received" : e.status]}>{inbound ? "Received" : e.status}</Pill>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{timeAgo(e.created_at)}</td>
                        <td className="px-4 py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                          {(e.status === "draft" || e.status === "failed") && (
                            <button
                              onClick={() => sendEmail(e)}
                              disabled={sending.has(e.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 text-xs font-medium text-white shadow-glow transition disabled:opacity-60"
                            >
                              {sending.has(e.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                              {sending.has(e.id) ? "Sending" : "Send"}
                            </button>
                          )}
                          {e.status === "opened" && (
                            <span className="inline-flex items-center gap-1 text-xs text-success-foreground"><Eye className="h-3.5 w-3.5" /> Opened</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No emails match {tab !== "all" ? `the “${tabs.find((t) => t.key === tab)?.label}” view` : "your search"}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {draftCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          {draftCount} draft{draftCount === 1 ? "" : "s"} ready — review and send before they go stale.
        </div>
      )}

      {composing && (
        <EmailComposeModal leads={leads} onClose={() => setComposing(false)} onDone={() => { setComposing(false); loadEmails(); }} />
      )}
      {reading && (
        <EmailReader
          email={reading}
          lead={leads.find((l) => l.id === reading.lead_id)}
          sending={sending.has(reading.id)}
          onSend={() => { sendEmail(reading); setReading(null); }}
          onClose={() => setReading(null)}
        />
      )}
    </div>
  );
}
