import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle, Plus, Send, Clock, Reply, Phone, Search, ArrowDownLeft, ArrowUpRight, Bot, Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useLeads } from "@/lib/leads-client";
import { parseStoredAttachments } from "@/lib/attachments";
import { WhatsappComposeModal } from "@/components/compose-whatsapp";
import { WhatsappReader } from "@/components/message-reader";
import { PageHeader, Avatar, timeAgo, btnPrimary, EmptyState, Pill, ComingSoon } from "@/components/shared";

export const Route = createFileRoute("/app/messages")({
  // WhatsApp isn't enabled yet — show a placeholder instead of the working
  // studio (which fetches/sends live data) until this channel is turned on.
  component: () => <ComingSoon icon={MessageCircle} title="WhatsApp — coming soon" />,
});

type Status = "draft" | "sent" | "delivered" | "read" | "replied" | "received" | "failed";

interface Row {
  id: string;
  lead_id: string | null;
  body: string;
  status: Status;
  direction?: string | null;
  from_number?: string | null;
  to_number?: string | null;
  acknowledged_at?: string | null;
  attachments?: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

const statusPills: Record<string, string> = {
  received: "bg-sky/40 text-foreground",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky/40 text-foreground",
  delivered: "bg-success/25 text-success-foreground",
  read: "bg-lilac/50 text-foreground",
  replied: "bg-success/25 text-success-foreground",
  failed: "bg-destructive/15 text-destructive",
};

type Tab = "all" | "received" | "draft" | "sent" | "delivered" | "read" | "replied";

const isInbound = (r: Row) => r.direction === "inbound" || r.status === "received";

function WhatsappStudio() {
  const { leads, reload: reloadLeads } = useLeads();
  const [rows, setRows] = useState<Row[]>([]);
  const [composing, setComposing] = useState(false);
  const [reading, setReading] = useState<Row | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  async function refresh() {
    const data = await api.getWhatsapps() as Row[];
    if (data) setRows(data);
  }
  useEffect(() => { refresh(); }, []);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(() => {
    const count = (pred: (r: Row) => boolean) => rows.filter(pred).length;
    return [
      { key: "all", label: "All", count: rows.length },
      { key: "received", label: "Inbox", count: count(isInbound) },
      { key: "draft", label: "Drafts", count: count((r) => r.status === "draft" || r.status === "failed") },
      { key: "sent", label: "Sent", count: count((r) => r.status === "sent") },
      { key: "delivered", label: "Delivered", count: count((r) => r.status === "delivered") },
      { key: "read", label: "Read", count: count((r) => r.status === "read") },
      { key: "replied", label: "Replied", count: count((r) => r.status === "replied") },
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "received") { if (!isInbound(r)) return false; }
      else if (tab === "draft") { if (r.status !== "draft" && r.status !== "failed") return false; }
      else if (tab !== "all") { if (r.status !== tab) return false; }
      if (!term) return true;
      const lead = leads.find((l) => l.id === r.lead_id);
      return (
        r.body.toLowerCase().includes(term) ||
        (lead?.name ?? "").toLowerCase().includes(term) ||
        (lead?.phone ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, leads, tab, q]);

  const withPhone = leads.filter((l) => l.phone).length;
  const draftCount = tabs.find((t) => t.key === "draft")?.count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp follow-ups"
        description={`Meeting reminders, offer alerts and follow-ups — AI-drafted or written by you, with attachments. ${withPhone} of ${leads.length} leads have a phone number.`}
      >
        <button onClick={() => setComposing(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> New message
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lead or message…"
              className="w-48 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring sm:w-56"
            />
          </div>
        </div>

        {/* List */}
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageCircle}
              title="No WhatsApp messages yet"
              description="Generate AI drafts or write your own with the button above. Inbound messages from your RelayX bridge land in the Inbox view."
            >
              <button onClick={() => setComposing(true)} className={btnPrimary}>
                <Plus className="h-4 w-4" /> New message
              </button>
            </EmptyState>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
              <span>{filtered.length} message{filtered.length === 1 ? "" : "s"}</span>
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" /> RelayX bridge
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Lead</th>
                    <th className="px-4 py-2.5 text-left font-medium">Message</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Sent</th>
                    <th className="px-4 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const lead = leads.find((l) => l.id === r.lead_id);
                    const inbound = isInbound(r);
                    const attachments = parseStoredAttachments(r.attachments);
                    return (
                      <tr key={r.id} onClick={() => setReading(r)} className={`cursor-pointer border-t border-border transition hover:bg-muted/30 ${inbound ? "bg-sky/[0.04]" : ""}`}>
                        <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                          {lead ? (
                            <Link to="/app/leads/$leadId" params={{ leadId: lead.id }} className="flex items-center gap-3">
                              <Avatar name={lead.name} className="h-8 w-8" />
                              <div className="min-w-0">
                                <div className="truncate font-medium leading-tight">{lead.name}</div>
                                <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <Phone className="h-2.5 w-2.5 shrink-0" />
                                  <span className="tabular-nums">{lead.phone ?? r.from_number ?? "—"}</span>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-[10px] font-semibold text-muted-foreground">?</div>
                              <div className="min-w-0 text-xs text-muted-foreground">
                                {r.from_number ?? r.to_number ?? "Unknown"}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="max-w-[360px] px-4 py-3">
                          <div className={`inline-flex max-w-full items-start gap-2 rounded-xl px-3 py-2 text-xs leading-snug ${
                            inbound ? "rounded-tl-sm bg-sky/10" : "rounded-tr-sm bg-success/10"
                          }`}>
                            {inbound
                              ? <ArrowDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky" />
                              : <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                            <span className="whitespace-pre-wrap break-words">{r.body}</span>
                          </div>
                          {attachments.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 pl-1 text-[10px] text-muted-foreground" title={attachments.map((a) => a.filename).join(", ")}>
                              <Paperclip className="h-3 w-3" /> {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
                            </div>
                          )}
                          {inbound && r.acknowledged_at && (
                            <div className="mt-1 flex items-center gap-1 pl-1 text-[10px] text-muted-foreground">
                              <Bot className="h-3 w-3" /> Auto-acked off-hours
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Pill className={statusPills[inbound ? "received" : r.status]}>
                            {inbound ? "Received" : r.status === "replied" ? "Replied" : r.status}
                          </Pill>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{timeAgo(r.created_at)}</td>
                        <td className="px-4 py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                          {r.status === "draft" && (
                            <button
                              onClick={() => sendOne(r, refresh, reloadLeads)}
                              className="inline-flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 text-xs font-medium text-white shadow-glow transition"
                            >
                              <Send className="h-3.5 w-3.5" /> Send
                            </button>
                          )}
                          {r.status === "replied" && (
                            <span className="inline-flex items-center gap-1 text-xs text-success-foreground"><Reply className="h-3.5 w-3.5" /> Replied</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No messages match {tab !== "all" ? `the “${tabs.find((t) => t.key === tab)?.label}” view` : "your search"}.
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
        <WhatsappComposeModal leads={leads} onClose={() => setComposing(false)} onDone={() => { setComposing(false); refresh(); }} />
      )}
      {reading && (
        <WhatsappReader
          msg={reading}
          lead={leads.find((l) => l.id === reading.lead_id)}
          sending={false}
          onSend={() => { sendOne(reading, refresh, reloadLeads); setReading(null); }}
          onClose={() => setReading(null)}
        />
      )}
    </div>
  );
}

async function sendOne(r: Row, refresh: () => void, reloadLeads: () => void) {
  try {
    await api.sendWhatsapp(r.id);
    toast.success("WhatsApp message sent");
  } catch (e) {
    toast.error("Send failed", { description: (e as Error).message });
  }
  refresh();
  reloadLeads();
}
