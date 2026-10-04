import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PhoneCall, Plus, X, Loader2, Sparkles, Play, CalendarPlus, CheckCircle2, Mic, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useLeads, type Lead } from "@/lib/leads-client";
import { PageHeader, LaneShell, Pill, Avatar, timeAgo, btnPrimary, btnOutline, inputCls, EmptyState } from "@/components/shared";

export const Route = createFileRoute("/app/caller")({
  component: VoiceAgent,
});

const goals = ["Qualify prospect", "Book a meeting", "Discuss a proposal", "Re-engage"];

interface Call {
  id: string;
  lead_id: string | null;
  goal: string | null;
  voice: string | null;
  status: "queued" | "in_progress" | "completed" | "no_answer" | "failed";
  outcome: string | null;
  transcript: { speaker: string; text: string }[];
  summary: string | null;
  duration_sec: number;
  created_at: string;
}

function VoiceAgent() {
  const { leads, reload } = useLeads();
  const [calls, setCalls] = useState<Call[]>([]);
  const [appts, setAppts] = useState<{ id: string; title: string; scheduled_at: string; lead_id: string | null }[]>([]);
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState<Call | null>(null);

  async function refresh() {
    const data = (await api.getCallLogs()).map((c) => ({
      ...c,
      transcript: c.transcript ? (JSON.parse(c.transcript) as { speaker: string; text: string }[]) : [],
    })) as Call[];
    if (data) setCalls(data);
    const ap = await api.getAppointments() as { id: string; title: string; scheduled_at: string; lead_id: string | null }[];
    if (ap) setAppts(ap);
  }
  useEffect(() => { refresh(); }, []);

  const groups = useMemo(() => {
    const g: Record<string, Call[]> = { queued: [], in_progress: [], completed: [], no_answer: [] };
    for (const c of calls) (g[c.status === "failed" ? "no_answer" : c.status] ??= []).push(c);
    return g;
  }, [calls]);

  const lanes: { key: string; label: string; tint: string; Icon: typeof PhoneCall }[] = [
    { key: "queued", label: "Queued", tint: "gradient-soft", Icon: Clock },
    { key: "in_progress", label: "Calling", tint: "gradient-peach", Icon: PhoneCall },
    { key: "completed", label: "Completed", tint: "gradient-mint", Icon: CheckCircle2 },
    { key: "no_answer", label: "No answer", tint: "gradient-sky", Icon: X },
  ];

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
        description={`Pick a lead and the AI agent calls them to discuss their own requirements. ${withPhone} of ${leads.length} leads have a phone number.`}
      >
        <button onClick={() => setComposing(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Bulk call
        </button>
      </PageHeader>

      {/* Primary action: see each lead's details and call them. */}
      <CallBoard leads={leads} goal={goals[0]} onDialed={refresh} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {lanes.map(({ key, label, tint, Icon }) => (
          <LaneShell key={key} label={label} icon={Icon} tint={tint} count={groups[key]?.length ?? 0}>
            {(groups[key] ?? []).map((c) => {
              const lead = leads.find((l) => l.id === c.lead_id);
              return (
                <button key={c.id} onClick={() => setOpen(c)} className="w-full rounded-xl border border-border bg-background p-3 text-left transition hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Avatar name={lead?.name ?? "Unknown"} className="h-7 w-7 text-[9px]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{lead?.name ?? "—"}</div>
                      <div className="truncate text-xs tabular-nums text-muted-foreground">{lead?.phone ?? ""}</div>
                    </div>
                    {c.outcome && <Pill className="bg-success/15 text-success-foreground">{c.outcome.replace("_", " ")}</Pill>}
                  </div>
                  <div className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">{c.summary ?? c.goal ?? "—"}</div>
                  <div className="mt-1.5 text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</div>
                </button>
              );
            })}
            {(groups[key]?.length ?? 0) === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No calls</div>
            )}
          </LaneShell>
        ))}
      </div>

      {appts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Appointments booked by the agent</div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {appts.map((a) => {
              const lead = leads.find((l) => l.id === a.lead_id);
              return (
                <div key={a.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <div className="truncate text-sm font-medium">{a.title}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {lead?.name ?? "—"} · {new Date(a.scheduled_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
  if (!lead.phone) {
    return (
      <span className="text-xs text-muted-foreground">No number</span>
    );
  }
  return (
    <button
      onClick={() => onDial(lead)}
      disabled={dialing}
      title={`Call ${lead.name} about ${lead.interest ?? "their enquiry"}`}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Ready to call</div>
          <Pill className="bg-muted text-muted-foreground">{eligible.length}</Pill>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-48 rounded-lg border border-border bg-background py-1.5 px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
          <button onClick={dialAll} disabled={busy} className={btnOutline}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            Call all
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filtered.map((lead) => (
          <div key={lead.id} className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-muted/20">
            <Avatar name={lead.name} />
            <div className="min-w-[180px] flex-1">
              <div className="truncate text-sm font-medium">{lead.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {lead.phone}
                {lead.company ? ` · ${lead.company}` : ""}
              </div>
            </div>
            {/* The exact details the agent will speak from. */}
            <div className="min-w-[220px] flex-[2]">
              {lead.interest && <div className="truncate text-xs font-medium">{lead.interest}</div>}
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {lead.notes ?? "No notes — the agent will confirm their requirement on the call."}
              </div>
            </div>
            <CallButton lead={lead} goal={goal} dialing={dialing === lead.id} onDial={dial} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No leads match “{search}”.</div>
        )}
      </div>
    </div>
  );
}

function CallDetail({ call, lead, onClose }: { call: Call; lead: Lead | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="grid max-h-[85vh] w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {lead ? <Avatar name={lead.name} /> : <div className="grid h-9 w-9 place-items-center rounded-xl gradient-sky"><PhoneCall className="h-4 w-4 text-foreground/80" /></div>}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{lead?.name ?? "Unknown"}</div>
              <div className="truncate text-xs text-muted-foreground">
                {call.goal} · {Math.round(call.duration_sec / 60)}m {call.duration_sec % 60}s · <span className="capitalize">{call.outcome ?? call.status}</span>
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
          <div className="text-xs font-semibold">Transcript</div>
          <div className="mt-2 space-y-2">
            {(call.transcript ?? []).map((t, i) => (
              <div key={i} className={`flex gap-2 ${t.speaker === "agent" ? "" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${t.speaker === "agent" ? "rounded-bl-md bg-muted/60" : "rounded-br-md gradient-brand text-white"}`}>
                  <div className="text-[10px] uppercase tracking-wide opacity-70">{t.speaker}</div>
                  {t.text}
                </div>
              </div>
            ))}
            {(!call.transcript || call.transcript.length === 0) && (
              <EmptyState icon={Mic} title="No transcript captured" className="py-8" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
