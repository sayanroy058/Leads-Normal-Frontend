import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneCall, PhoneIncoming, PhoneOutgoing, Plus, X, Loader2, Sparkles, Play, Mic, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useLeads, type Lead } from "@/lib/leads-client";
import { PageHeader, Pill, Avatar, leadStatusStyles, leadStatusLabels, btnPrimary, btnOutline, inputCls, EmptyState } from "@/components/shared";
import { SchedulePanel, fmtIst } from "@/components/voice-schedule";

export const Route = createFileRoute("/app/caller")({
  component: VoiceAgent,
});

const goals = ["Qualify prospect", "Book a meeting", "Discuss a proposal", "Re-engage"];

interface Call {
  id: string;
  lead_id: string | null;
  goal: string | null;
  voice: string | null;
  direction?: "inbound" | "outbound" | null;
  status: "queued" | "in_progress" | "completed" | "no_answer" | "failed";
  outcome: string | null;
  transcript: { speaker: string; text: string }[];
  summary: string | null;
  duration_sec: number;
  created_at: string;
}

type Turn = { speaker: string; text: string };

/** The transcript column holds JSON turns, but older/webhook rows may hold plain text — never crash on it. */
function parseTranscript(raw: unknown): Turn[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Turn[];
  if (typeof raw !== "string") return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((t) => t && typeof t.text === "string") as Turn[];
  } catch { /* plain text */ }
  const text = raw.trim();
  return text ? [{ speaker: "agent", text }] : [];
}

function VoiceAgent() {
  const { leads, reload } = useLeads();
  const [calls, setCalls] = useState<Call[]>([]);
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState<Call | null>(null);

  async function refresh() {
    const data = (await api.getCallLogs()).map((c) => ({ ...c, transcript: parseTranscript(c.transcript) })) as Call[];
    if (data) setCalls(data);
  }
  useEffect(() => { refresh(); }, []);

  const withPhone = leads.filter((l) => l.phone).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Voice Agent"
        badge={
          <Pill className="border border-success/40 bg-success/15 text-success-foreground">
            <Sparkles className="h-3 w-3" /> Live
          </Pill>
        }
        description={`Callbacks and site visits the AI agent arranges, every call it makes or takes, and one-click calling. ${withPhone} of ${leads.length} leads have a phone number.`}
      >
        <button onClick={() => setComposing(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Bulk call
        </button>
      </PageHeader>

      {/* What the AI agent arranged, in India time — plus the call history. */}
      <SchedulePanel calls={calls} leads={leads} onOpenCall={(id) => setOpen(calls.find((c) => c.id === id) ?? null)} />

      {/* One-click calling. */}
      <CallBoard leads={leads} goal={goals[0]} onDialed={refresh} />

      {composing && <Composer leads={leads} onClose={() => setComposing(false)} onDone={() => { setComposing(false); refresh(); reload(); }} />}
      {open && <CallDetail call={open} lead={leads.find((l) => l.id === open.lead_id) ?? null} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Composer({ leads, onClose, onDone }: { leads: Lead[]; onClose: () => void; onDone: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState(goals[0]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const eligible = leads.filter((l) => l.phone);
  const filtered = eligible.filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()));

  function toggle(id: string) { setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function launch() {
    if (!selected.size) { toast.error("Pick at least one lead"); return; }
    setBusy(true);
    try {
      const targets = leads.filter((l) => selected.has(l.id));
      // Dial each lead for real via the Plivo AI agent, using their own details.
      const results = await Promise.all(targets.map((lead) => runCall(lead, goal)));
      const ok = results.filter(Boolean).length;
      if (ok) {
        toast.success(`${ok} call${ok === 1 ? "" : "s"} placed`);
        onDone();
      }
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="grid max-h-[90vh] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /><div className="text-sm font-semibold">Queue voice agent calls</div></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Leads to call ({selected.size}/{eligible.length})</div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={`${inputCls} mt-2`} />
            <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border bg-background p-2">
              {filtered.slice(0, 60).map((l) => (
                <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                  <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="accent-primary" />
                  <span className="flex-1 truncate">{l.name} <span className="text-xs text-muted-foreground">· {l.phone}</span></span>
                </label>
              ))}
              {eligible.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">No leads with a phone number yet.</div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Call goal</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {goals.map((g) => (
                  <button key={g} onClick={() => setGoal(g)} className={`rounded-full border px-3 py-1 text-xs transition ${goal === g ? "gradient-brand border-transparent text-white" : "border-border bg-background hover:bg-accent"}`}>{g}</button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground"><Sparkles className="h-3.5 w-3.5" /> Speaks each lead&apos;s own details</div>
              <p className="mt-1">Every call is briefed with that lead&apos;s requirement, budget, notes and urgency. Transcript and summary are saved to the call log.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={launch} disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start calls
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Place a REAL outbound call to this lead via the Plivo AI voice agent.
 * The agent speaks from the lead's own recorded details/requirements — the
 * backend builds that brief. Progress (status/transcript/summary) arrives
 * asynchronously through the Plivo event-callback webhook.
 */
async function runCall(lead: Lead, goal: string) {
  try {
    const res = await api.dialCall({ lead_id: lead.id, goal });
    toast.success(`AI agent is calling ${lead.name}`, {
      description: res.phlo_id ? `Flow run ${res.phlo_id.slice(0, 8)}… queued` : "Call queued",
    });
    return true;
  } catch (e) {
    toast.error(`Couldn't call ${lead.name}`, { description: (e as Error).message });
    return false;
  }
}

/** Single per-lead Call button — shows a spinner while that lead is dialling. */
function CallButton({ lead, goal, dialing, onDial }: { lead: Lead; goal: string; dialing: boolean; onDial: (lead: Lead) => void }) {
  if (!lead.phone) return <span className="text-xs text-muted-foreground">No number</span>;
  return (
    <button
      onClick={() => onDial(lead)}
      disabled={dialing}
      title={`Call ${lead.name} about ${lead.interest ?? "their enquiry"}`}
      aria-label={`Call ${lead.name}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #1c2143 0%, #42586f 70%, #70c390 100%)" }}
    >
      {dialing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
      Call
    </button>
  );
}

/**
 * The "Ready to call" board — every lead with a phone number, showing the
 * details the AI agent will speak from, and a one-click Call button.
 */
function CallBoard({ leads, goal, onDialed }: { leads: Lead[]; goal: string; onDialed: () => void }) {
  const [search, setSearch] = useState("");
  const [dialing, setDialing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const eligible = leads.filter((l) => l.phone);
  const filtered = eligible.filter(
    (l) =>
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.interest ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  async function dial(lead: Lead) {
    setDialing(lead.id);
    try {
      if (await runCall(lead, goal)) onDialed();
    } finally {
      setDialing(null);
    }
  }

  async function dialAll() {
    setBusy(true);
    try {
      let ok = 0;
      for (const lead of filtered) {
        if (await runCall(lead, goal)) ok++;
      }
      if (ok) {
        toast.success(`${ok} call${ok === 1 ? "" : "s"} placed`);
        onDialed();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!eligible.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Ready to call</div>
        </div>
        <EmptyState
          icon={PhoneCall}
          title="No leads have a phone number yet"
          description="Add a mobile number to a lead and the AI agent will be able to call them about their requirements."
        />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><PhoneCall className="h-5 w-5" /></div>
          <div>
            <h2 className="text-base font-semibold leading-tight">Ready to call</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{eligible.length} lead{eligible.length === 1 ? "" : "s"} with a phone number — the AI agent calls from each lead&apos;s own details</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or requirement…"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-72 sm:flex-none"
          />
          <button onClick={dialAll} disabled={busy || filtered.length === 0} className={btnOutline}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            Call all{filtered.length !== eligible.length ? ` (${filtered.length})` : ""}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 pt-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((lead) => (
          <article key={lead.id} className="flex flex-col rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:shadow-soft">
            <div className="flex items-start gap-3">
              <Avatar name={lead.name} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <div className="break-words text-sm font-semibold leading-snug">{lead.name}</div>
                <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">{lead.phone}</div>
              </div>
              <Pill className={leadStatusStyles[lead.status]}>{leadStatusLabels[lead.status]}</Pill>
            </div>

            <div className="mt-3 flex-1 space-y-2 text-sm">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Looking for</div>
                <div className="mt-0.5 break-words leading-snug">{lead.interest || <span className="text-muted-foreground">Not recorded — the agent will ask</span>}</div>
              </div>
              {lead.notes && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</div>
                  <div className="mt-0.5 line-clamp-3 break-words text-xs leading-relaxed text-muted-foreground">{lead.notes}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <CallButton lead={lead} goal={goal} dialing={dialing === lead.id} onDial={dial} />
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground">No leads match “{search}”.</div>
        )}
      </div>
    </section>
  );
}

function CallDetail({ call, lead, onClose }: { call: Call; lead: Lead | null; onClose: () => void }) {
  const [turns, setTurns] = useState<Turn[]>(call.transcript ?? []);
  const [duration, setDuration] = useState(call.duration_sec);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  async function sync(silent = false) {
    setSyncing(true);
    setSyncNote(null);
    try {
      const r = await api.syncCallTranscript(call.id);
      if (r.ok) {
        const fresh = (await api.getCallLogs()).find((c) => c.id === call.id);
        if (fresh) setTurns(parseTranscript(fresh.transcript));
        if (r.duration_sec) setDuration(r.duration_sec);
      } else if (!silent) {
        setSyncNote(r.message ?? "Transcript isn't available yet.");
      }
    } catch (e) {
      if (!silent) setSyncNote((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  // AI calls keep their transcript with Plivo — fetch it the first time the call is opened.
  useEffect(() => {
    if (turns.length === 0 && call.status !== "queued") sync(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mins = Math.floor(duration / 60);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="grid max-h-[85vh] w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {lead ? <Avatar name={lead.name} /> : <div className="grid h-9 w-9 place-items-center rounded-xl gradient-sky"><PhoneCall className="h-4 w-4 text-foreground/80" /></div>}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{lead?.name ?? "Unknown"}</div>
              <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                {call.direction === "inbound" ? <PhoneIncoming className="h-3 w-3" /> : call.direction === "outbound" ? <PhoneOutgoing className="h-3 w-3" /> : null}
                <span>{call.direction ? `${call.direction} · ` : ""}{fmtIst(call.created_at)} IST</span>
                {duration > 0 && <span>· {mins}m {duration % 60}s</span>}
                <span className="capitalize">· {call.outcome ?? call.status.replace("_", " ")}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto p-5">
          {call.summary && (
            <div className="mb-4 rounded-xl border border-border bg-background p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold"><FileText className="h-3.5 w-3.5" /> Summary</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{call.summary}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">Transcript {turns.length > 0 && <span className="font-normal text-muted-foreground">· {turns.length} turns</span>}</div>
            <button onClick={() => sync(false)} disabled={syncing} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent disabled:opacity-60">
              <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Fetching…" : "Refresh transcript"}
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {turns.map((t, i) => (
              <div key={i} className={`flex gap-2 ${t.speaker === "agent" ? "" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${t.speaker === "agent" ? "rounded-bl-md bg-muted/60" : "rounded-br-md gradient-brand text-white"}`}>
                  <div className="text-[10px] uppercase tracking-wide opacity-70">{t.speaker === "agent" ? "AI agent" : "Caller"}</div>
                  {t.text}
                </div>
              </div>
            ))}
            {turns.length === 0 && (
              <EmptyState icon={Mic} title={syncing ? "Fetching transcript…" : "No transcript captured"} description={syncNote ?? undefined} className="py-8" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
