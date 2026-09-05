import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquare, PhoneCall, Mail, StickyNote, Bot, ShieldCheck,
  Clock, AlertTriangle, RefreshCw, Send, CheckCheck, Loader2, ArrowLeft, Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import {
  PageHeader, EmptyState, Avatar, timeAgo, convStatusStyles, slaStyles, Pill, btnPrimary, inputCls,
} from "@/components/shared";

// Phase 0 — One thread per contact. Every channel's events land in a single
// ordered conversation with conversation-level status + SLA timer.

export const Route = createFileRoute("/app/conversations")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: ConversationsPage,
});

interface Conversation {
  id: string;
  lead_id: string;
  status: "new" | "active" | "awaiting_reply" | "resolved" | "archived";
  sla_due_at: string | null;
  sla_status: "none" | "within_sla" | "breached";
  first_event_at: string | null;
  last_event_at: string | null;
  created_at: string;
  lead_name: string;
  company: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  last_content: string | null;
  last_event_created: string | null;
}

interface ConvEvent {
  id: string;
  type: string;
  channel: string;
  direction: string;
  content: string | null;
  handled_by: string;
  action: string;
  summary: string | null;
  created_at: string;
}

const eventIcon: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageSquare,
  call: PhoneCall,
  note: StickyNote,
  chat: Bot,
  dm: MessageSquare,
  system: ShieldCheck,
};

function slaText(c: Conversation): string {
  if (!c.sla_due_at || c.sla_status === "none") return "No SLA";
  const diff = new Date(c.sla_due_at).getTime() - Date.now();
  if (diff <= 0) return `Breached ${timeAgo(c.sla_due_at)}`;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Respond within ${mins}m`;
  return `Respond within ${Math.round(mins / 60)}h`;
}

function ConversationsPage() {
  const navigate = useNavigate();
  const openParam = Route.useSearch({ select: (s) => s.open });
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ conversation: Conversation; events: ConvEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [showDetailMobile, setShowDetailMobile] = useState(false);
  const handledParam = useRef(false);

  async function loadList() {
    try {
      const data = await api.getConversations({
        ...(filter !== "all" ? { status: filter } : {}),
        ...(slaFilter !== "all" ? { sla: slaFilter } : {}),
      });
      setConvs(data ?? []);
    } catch (e) { toast.error("Couldn't load conversations", { description: (e as Error).message }); }
    setLoading(false);
  }

  async function loadDetail(id: string) {
    try {
      const d = await api.getConversation(id);
      setDetail(d);
    } catch (e) { toast.error("Couldn't load thread", { description: (e as Error).message }); }
  }

  useEffect(() => { loadList(); }, [filter, slaFilter]);

  // Deep link: /app/conversations?open=conv-… selects that thread once.
  useEffect(() => {
    if (handledParam.current || loading) return;
    if (openParam) {
      handledParam.current = true;
      setSelected(openParam);
      loadDetail(openParam);
      setShowDetailMobile(true);
    }
  }, [openParam, loading]);

  function open(id: string) {
    setSelected(id);
    loadDetail(id);
    setShowDetailMobile(true);
    navigate({ to: "/app/conversations", search: { open: id }, replace: true });
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
    setShowDetailMobile(false);
    navigate({ to: "/app/conversations", search: {}, replace: true });
  }

  async function addNote() {
    if (!note.trim() || !selected) return;
    setBusy(true);
    try {
      await api.addConversationNote(selected, note.trim());
      toast.success("Note added");
      setNote("");
      loadDetail(selected);
      loadList();
    } catch (e) { toast.error("Failed to add note", { description: (e as Error).message }); }
    setBusy(false);
  }

  async function setStatus(status: string) {
    if (!selected) return;
    try {
      await api.setConversationStatus(selected, status);
      toast.success(`Conversation ${status}`);
      loadDetail(selected);
      loadList();
    } catch (e) { toast.error("Failed to update", { description: (e as Error).message }); }
  }

  const waitingCount = convs.filter((c) => c.status === "awaiting_reply").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations"
        description={
          waitingCount > 0
            ? `One thread per contact — every channel feeds this. ${waitingCount} awaiting your reply.`
            : "One thread per contact — every channel feeds this. SLA lives here, so nothing goes untouched."
        }
      >
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputCls} w-auto bg-card`}>
          <option value="all">All status</option>
          <option value="awaiting_reply">Awaiting reply</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </select>
        <select value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)} className={`${inputCls} w-auto bg-card`}>
          <option value="all">All SLA</option>
          <option value="breached">Breached</option>
          <option value="within_sla">Within SLA</option>
        </select>
        <button onClick={loadList} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card transition hover:bg-accent" aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversation list — hidden on mobile once a thread is open */}
        <div className={`space-y-2 ${showDetailMobile ? "hidden lg:block" : ""}`}>
          {loading ? (
            <div className="grid h-40 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : convs.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No conversations"
              description="Threads appear here automatically as soon as you email, WhatsApp or call a lead."
              className="h-full"
            />
          ) : (
            convs.map((c) => {
              const active = selected === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => open(c.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    active ? "border-brand bg-card shadow-soft ring-1 ring-brand/40" : "border-border bg-card/60 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={c.lead_name} className="h-8 w-8" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.lead_name}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.company ?? c.email ?? c.phone ?? "—"}</div>
                      </div>
                    </div>
                    <Pill className={convStatusStyles[c.status]}>{c.status.replace("_", " ")}</Pill>
                  </div>
                  <div className="mt-2 truncate text-xs text-muted-foreground">{c.last_content ?? "No messages yet"}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.last_event_created ? timeAgo(c.last_event_created) : timeAgo(c.created_at)}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 ${slaStyles[c.sla_status]}`}>
                      {c.sla_status === "breached" ? <AlertTriangle className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />}
                      {c.sla_status === "none" ? "No SLA" : c.sla_status === "breached" ? "SLA breached" : "Within SLA"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Thread detail */}
        <div className={`min-h-[60vh] rounded-2xl border border-border bg-card/60 shadow-soft ${showDetailMobile ? "" : "hidden lg:block"}`}>
          {!detail ? (
            <div className="grid h-full min-h-[40vh] place-items-center px-6 text-center text-sm text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-40" />
                Select a conversation to view its thread.
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {/* Thread header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    onClick={closeDetail}
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border hover:bg-accent lg:hidden"
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold">{detail.conversation.lead_name}</span>
                      <Pill className={convStatusStyles[detail.conversation.status]}>{detail.conversation.status.replace("_", " ")}</Pill>
                      <Pill className={slaStyles[detail.conversation.sla_status]}>{slaText(detail.conversation)}</Pill>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {[detail.conversation.company, detail.conversation.city, detail.conversation.phone, detail.conversation.email].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => setStatus("resolved")} className="rounded-lg border border-border bg-card px-3 py-1.5 transition hover:bg-accent">Resolve</button>
                  <button onClick={() => setStatus("active")} className="rounded-lg border border-border bg-card px-3 py-1.5 transition hover:bg-accent">Reopen</button>
                  <button onClick={() => setStatus("archived")} className="rounded-lg border border-border bg-card px-3 py-1.5 text-muted-foreground transition hover:bg-accent">Archive</button>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                {detail.events.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No events yet.</div>
                )}
                {detail.events.map((e) => {
                  const Icon = eventIcon[e.channel] ?? MessageSquare;
                  const inbound = e.direction === "inbound";
                  const isNote = e.channel === "note";
                  if (isNote) {
                    return (
                      <div key={e.id} className="mx-auto max-w-[85%] rounded-xl border border-warning/30 bg-warning/10 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-warning-foreground">
                          <StickyNote className="h-3 w-3" /> Internal note · {timeAgo(e.created_at)}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed">{e.content ?? e.summary ?? "—"}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={e.id} className={`flex gap-2 ${inbound ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${inbound ? "rounded-tl-md border border-border bg-background" : "rounded-tr-md gradient-soft"}`}>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="font-medium capitalize text-foreground/80">{e.channel}</span>
                          <span className="capitalize">{e.handled_by === "ai" ? "AI agent" : e.handled_by}</span>
                          <span>· {timeAgo(e.created_at)}</span>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{e.content ?? e.summary ?? "—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <div className="border-t border-border p-4 sm:p-5">
                <div className="flex items-end gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
                    placeholder="Add an internal note…"
                    className={`${inputCls} bg-background`}
                  />
                  <button onClick={addNote} disabled={busy || !note.trim()} className={`${btnPrimary} shrink-0 disabled:opacity-60`}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
