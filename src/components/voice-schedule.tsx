import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarClock, Check, Loader2, MapPin, PhoneCall, PhoneIncoming, PhoneOutgoing, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { api, type LeadVoice, type VoiceCallback, type VoiceCounts, type VoiceSchedule, type VoiceVisit } from "@/api/client";
import { EmptyState, Pill, btnOutline, parseServerDate, timeAgo } from "@/components/shared";
import { cn } from "@/lib/utils";

// Everything the AI voice agent arranged — promised callbacks and site visits —
// shown in India Standard Time, with overdue / due-soon cues.

const IST = "Asia/Kolkata";

export function fmtIst(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = parseServerDate(iso);
  if (Number.isNaN(t)) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(t));
}

/** Date part of an instant in IST, as yyyy-mm-dd (for day grouping). */
function istDay(t: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t));
}

type Urgency = "overdue" | "soon" | "later" | "closed";
function callbackUrgency(cb: VoiceCallback, now: number): Urgency {
  if (cb.status !== "pending" && cb.status !== "calling") return "closed";
  const due = parseServerDate(cb.due_at);
  if (due < now - 5 * 60000) return "overdue";
  if (due <= now + 15 * 60000) return "soon";
  return "later";
}

const urgencyStyle: Record<Urgency, string> = {
  overdue: "border-destructive/40 bg-destructive/5",
  soon: "border-warning/50 bg-warning/10",
  later: "border-border bg-background",
  closed: "border-border bg-background opacity-70",
};

const cbStatusStyle: Record<VoiceCallback["status"], string> = {
  pending: "bg-primary/10 text-primary",
  calling: "bg-warning/20 text-foreground",
  done: "bg-success/15 text-success-foreground",
  missed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const visitStatusStyle: Record<VoiceVisit["status"], string> = {
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/15 text-success-foreground",
  cancelled: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/10 text-destructive",
};

/** Poll the Voice Agent schedule. `now` ticks so countdowns stay fresh. */
export function useVoiceSchedule(intervalMs = 30000) {
  const [data, setData] = useState<VoiceSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const reload = useCallback(async () => {
    try {
      setData(await api.getVoiceSchedule());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    reload();
    const id = setInterval(reload, intervalMs);
    return () => clearInterval(id);
  }, [reload, intervalMs]);

  return { data, error, now, reload };
}

/** Light poll for the sidebar badge. */
export function useVoiceCounts(intervalMs = 60000): VoiceCounts | null {
  const [counts, setCounts] = useState<VoiceCounts | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => api.getVoiceCounts().then((c) => alive && setCounts(c)).catch(() => {});
    load();
    const id = setInterval(load, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);
  return counts;
}

function LeadLink({ id, name, phone }: { id: string; name: string; phone: string | null }) {
  return (
    <div className="min-w-0">
      <Link to="/app/leads/$leadId" params={{ leadId: id }} className="block truncate text-sm font-medium hover:underline">{name}</Link>
      {phone && <div className="truncate text-xs tabular-nums text-muted-foreground">{phone}</div>}
    </div>
  );
}

/** Inline IST date-time picker used for rescheduling. */
function RescheduleForm({ busy, onSubmit, onCancel }: { busy: boolean; onSubmit: (when: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
        aria-label="New date and time (India time)"
      />
      <span className="text-[11px] text-muted-foreground">India time</span>
      <button disabled={!value || busy} onClick={() => onSubmit(value)} className="rounded-md gradient-brand px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
      </button>
      <button onClick={onCancel} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
    </div>
  );
}

function ActionBtn({ label, onClick, disabled, tone = "default", icon: Icon }: { label: string; onClick: () => void; disabled?: boolean; tone?: "default" | "danger"; icon?: typeof Check }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition disabled:opacity-50",
        tone === "danger" ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-border hover:bg-accent",
      )}
    >
      {Icon && <Icon className="h-3 w-3" />} {label}
    </button>
  );
}

export function CallbackCard({ cb, now, onChanged, compact }: { cb: VoiceCallback; now: number; onChanged: () => void; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const urgency = callbackUrgency(cb, now);
  const open = cb.status === "pending" || cb.status === "calling";
  const due = parseServerDate(cb.due_at);

  async function run(data: { status?: string; when?: string }, done: string) {
    setBusy(true);
    try {
      await api.updateCallback(cb.id, data);
      toast.success(done);
      setRescheduling(false);
      onChanged();
    } catch (e) {
      toast.error("Couldn't update the callback", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-xl border p-3", urgencyStyle[urgency])}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", urgency === "overdue" ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary")}>
          <PhoneCall className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <LeadLink id={cb.lead_id} name={cb.lead_name} phone={cb.lead_phone} />
            <Pill className={cbStatusStyle[cb.status]}>{cb.status}</Pill>
            {urgency === "overdue" && <Pill className="bg-destructive/15 text-destructive">overdue {timeAgo(cb.due_at).replace(" ago", "")}</Pill>}
            {urgency === "soon" && <Pill className="bg-warning/25 text-foreground">due {due <= now ? "now" : timeAgo(cb.due_at)}</Pill>}
          </div>
          <div className="mt-1 text-sm font-medium">{fmtIst(cb.due_at)} <span className="text-xs font-normal text-muted-foreground">IST{open && urgency === "later" ? ` · ${timeAgo(cb.due_at)}` : ""}</span></div>
          {!compact && (cb.reason || cb.lead_interest) && (
            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{[cb.reason, cb.lead_interest].filter(Boolean).join(" · ")}</div>
          )}
          {open && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ActionBtn label="Mark done" icon={Check} disabled={busy} onClick={() => run({ status: "done" }, "Marked done")} />
              <ActionBtn label="Reschedule" icon={CalendarClock} disabled={busy} onClick={() => setRescheduling((v) => !v)} />
              <ActionBtn label="Cancel" icon={X} tone="danger" disabled={busy} onClick={() => run({ status: "cancelled" }, "Callback cancelled")} />
            </div>
          )}
          {rescheduling && <RescheduleForm busy={busy} onSubmit={(when) => run({ when }, "Callback rescheduled")} onCancel={() => setRescheduling(false)} />}
        </div>
      </div>
    </div>
  );
}

export function VisitCard({ v, now, onChanged, compact }: { v: VoiceVisit; now: number; onChanged: () => void; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const when = parseServerDate(v.scheduled_at);
  const upcoming = v.status === "confirmed";
  const today = istDay(when) === istDay(now);

  async function run(data: { status?: string; when?: string }, done: string) {
    setBusy(true);
    try {
      await api.updateVisit(v.id, data);
      toast.success(done);
      setRescheduling(false);
      onChanged();
    } catch (e) {
      toast.error("Couldn't update the visit", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("rounded-xl border p-3", upcoming && today ? "border-primary/40 bg-primary/5" : upcoming ? "border-border bg-background" : "border-border bg-background opacity-70")}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success-foreground">
          <CalendarCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <LeadLink id={v.lead_id} name={v.lead_name} phone={v.lead_phone} />
            <Pill className={visitStatusStyle[v.status]}>{v.status.replace("_", " ")}</Pill>
            {upcoming && today && <Pill className="bg-primary/15 text-primary">today</Pill>}
            {v.source === "voice-agent" && <Pill className="bg-muted text-muted-foreground">booked by AI</Pill>}
          </div>
          <div className="mt-1 text-sm font-medium">{v.project ?? v.title ?? "Site visit"}</div>
          <div className="text-sm">{fmtIst(v.scheduled_at)} <span className="text-xs text-muted-foreground">IST{upcoming ? ` · ${timeAgo(v.scheduled_at)}` : ""}</span></div>
          {v.location && <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{v.location}</div>}
          {!compact && v.notes && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{v.notes}</div>}
          {upcoming && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ActionBtn label="Completed" icon={Check} disabled={busy} onClick={() => run({ status: "completed" }, "Visit marked completed")} />
              <ActionBtn label="Reschedule" icon={CalendarClock} disabled={busy} onClick={() => setRescheduling((x) => !x)} />
              <ActionBtn label="No show" disabled={busy} onClick={() => run({ status: "no_show" }, "Marked as no show")} />
              <ActionBtn label="Cancel" icon={X} tone="danger" disabled={busy} onClick={() => run({ status: "cancelled" }, "Visit cancelled")} />
            </div>
          )}
          {rescheduling && <RescheduleForm busy={busy} onSubmit={(when) => run({ when }, "Visit rescheduled")} onCancel={() => setRescheduling(false)} />}
        </div>
      </div>
    </div>
  );
}

type Tab = "today" | "callbacks" | "visits";

function StatChip({ label, value, tone }: { label: string; value: number; tone?: "alert" | "warn" }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2", tone === "alert" && value > 0 ? "border-destructive/40 bg-destructive/5" : tone === "warn" && value > 0 ? "border-warning/50 bg-warning/10" : "border-border bg-background")}>
      <div className="text-lg font-semibold tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export function SchedulePanel() {
  const { data, error, now, reload } = useVoiceSchedule();
  const [tab, setTab] = useState<Tab>("today");
  const [showClosed, setShowClosed] = useState(false);

  const view = useMemo(() => {
    const cbs = data?.callbacks ?? [];
    const visits = data?.visits ?? [];
    const today = istDay(now);
    const openCbs = cbs.filter((c) => c.status === "pending" || c.status === "calling");
    const closedCbs = cbs.filter((c) => !(c.status === "pending" || c.status === "calling")).sort((a, b) => parseServerDate(b.due_at) - parseServerDate(a.due_at));
    const upVisits = visits.filter((v) => v.status === "confirmed");
    const pastVisits = visits.filter((v) => v.status !== "confirmed").sort((a, b) => parseServerDate(b.scheduled_at) - parseServerDate(a.scheduled_at));
    return {
      todayCbs: openCbs.filter((c) => istDay(parseServerDate(c.due_at)) <= today),
      todayVisits: upVisits.filter((v) => istDay(parseServerDate(v.scheduled_at)) === today),
      openCbs, closedCbs, upVisits, pastVisits,
    };
  }, [data, now]);

  const counts = data?.counts;
  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: "today", label: "Today", n: view.todayCbs.length + view.todayVisits.length },
    { key: "callbacks", label: "Callbacks", n: view.openCbs.length },
    { key: "visits", label: "Site visits", n: view.upVisits.length },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Callbacks & site visits</div>
          <span className="text-[11px] text-muted-foreground">India time{data ? ` · now ${new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(now))}` : ""}</span>
        </div>
        <button onClick={reload} className={btnOutline} aria-label="Refresh"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      {counts && (
        <div className="grid grid-cols-2 gap-2 border-b border-border p-4 sm:grid-cols-4">
          <StatChip label="Overdue callbacks" value={counts.callbacks_overdue} tone="alert" />
          <StatChip label="Due in 15 min" value={Math.max(0, counts.callbacks_due_now - counts.callbacks_overdue)} tone="warn" />
          <StatChip label="Pending callbacks" value={counts.callbacks_pending} />
          <StatChip label="Site visits today" value={counts.visits_today} />
        </div>
      )}

      <div className="flex gap-1 border-b border-border px-4 pt-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition", tab === t.key ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
            <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">{t.n}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2 p-4">
        {error && !data && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">Couldn't load the schedule: {error}</div>}
        {!data && !error && <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

        {data && tab === "today" && (
          <>
            {view.todayCbs.length + view.todayVisits.length === 0 && (
              <EmptyState icon={CalendarCheck} title="Nothing scheduled for today" description="Callbacks and site visits the AI agent arranges for today will appear here." className="py-8" />
            )}
            {view.todayCbs.length > 0 && <div className="text-xs font-semibold text-muted-foreground">Callbacks to make</div>}
            {view.todayCbs.map((c) => <CallbackCard key={c.id} cb={c} now={now} onChanged={reload} />)}
            {view.todayVisits.length > 0 && <div className="pt-1 text-xs font-semibold text-muted-foreground">Site visits today</div>}
            {view.todayVisits.map((v) => <VisitCard key={v.id} v={v} now={now} onChanged={reload} />)}
          </>
        )}

        {data && tab === "callbacks" && (
          <>
            {view.openCbs.length === 0 && <EmptyState icon={PhoneCall} title="No pending callbacks" description="When a caller says “call me after an hour”, it is scheduled here." className="py-8" />}
            {view.openCbs.map((c) => <CallbackCard key={c.id} cb={c} now={now} onChanged={reload} />)}
            {view.closedCbs.length > 0 && (
              <button onClick={() => setShowClosed((v) => !v)} className="pt-1 text-xs text-muted-foreground hover:text-foreground">
                {showClosed ? "Hide" : "Show"} completed & cancelled ({view.closedCbs.length})
              </button>
            )}
            {showClosed && view.closedCbs.map((c) => <CallbackCard key={c.id} cb={c} now={now} onChanged={reload} compact />)}
          </>
        )}

        {data && tab === "visits" && (
          <>
            {view.upVisits.length === 0 && <EmptyState icon={CalendarCheck} title="No upcoming site visits" description="Visits the AI agent books will appear here with the project and time." className="py-8" />}
            {view.upVisits.map((v) => <VisitCard key={v.id} v={v} now={now} onChanged={reload} />)}
            {view.pastVisits.length > 0 && (
              <button onClick={() => setShowClosed((x) => !x)} className="pt-1 text-xs text-muted-foreground hover:text-foreground">
                {showClosed ? "Hide" : "Show"} past visits ({view.pastVisits.length})
              </button>
            )}
            {showClosed && view.pastVisits.map((v) => <VisitCard key={v.id} v={v} now={now} onChanged={reload} compact />)}
          </>
        )}
      </div>
    </div>
  );
}

/** Per-lead card: this lead's callbacks, site visits and recent AI calls. */
export function LeadVoiceCard({ leadId }: { leadId: string }) {
  const [data, setData] = useState<LeadVoice | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const load = useCallback(async () => {
    try { setData(await api.getLeadVoice(leadId)); } catch { /* card simply stays empty */ }
    setNow(Date.now());
  }, [leadId]);
  useEffect(() => { load(); }, [load]);

  if (!data) return null;
  const cbs = data.callbacks.filter((c) => c.status === "pending" || c.status === "calling");
  const visits = data.visits.filter((v) => v.status === "confirmed");
  if (!cbs.length && !visits.length && !data.calls.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4 text-primary" /> Voice agent activity</div>
      <div className="space-y-2">
        {cbs.map((c) => <CallbackCard key={c.id} cb={c} now={now} onChanged={load} compact />)}
        {visits.map((v) => <VisitCard key={v.id} v={v} now={now} onChanged={load} compact />)}
        {data.calls.slice(0, 3).map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {c.direction === "outbound" ? <PhoneOutgoing className="h-3.5 w-3.5" /> : <PhoneIncoming className="h-3.5 w-3.5" />}
              <span className="capitalize">{c.direction ?? "call"}</span> · {timeAgo(c.created_at)}
              {c.duration_sec > 0 && <> · {Math.floor(c.duration_sec / 60)}m {c.duration_sec % 60}s</>}
              {c.outcome && <Pill className="bg-success/15 text-success-foreground">{c.outcome}</Pill>}
            </div>
            {c.summary && <div className="mt-1 line-clamp-3 text-xs leading-snug">{c.summary}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact "what's next" strip for the main dashboard. Hidden when nothing is pending. */
export function UpcomingStrip() {
  const { data, now } = useVoiceSchedule(60000);
  if (!data) return null;
  const cbs = data.callbacks.filter((c) => c.status === "pending" || c.status === "calling").slice(0, 4);
  const visits = data.visits.filter((v) => v.status === "confirmed" && parseServerDate(v.scheduled_at) >= now - 3600000).slice(0, 4);
  if (!cbs.length && !visits.length) return null;
  const c = data.counts;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarClock className="h-4 w-4 text-primary" /> Up next from the AI voice agent
          {c.callbacks_overdue > 0 && <Pill className="bg-destructive/15 text-destructive">{c.callbacks_overdue} overdue</Pill>}
        </div>
        <Link to="/app/caller" className="text-xs text-primary hover:underline">Open Voice Agent →</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Callbacks ({c.callbacks_pending})</div>
          {cbs.length === 0 && <div className="text-xs text-muted-foreground">None pending</div>}
          {cbs.map((cb) => (
            <div key={cb.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <PhoneCall className={cn("h-3.5 w-3.5 shrink-0", callbackUrgency(cb, now) === "overdue" ? "text-destructive" : "text-primary")} />
              <Link to="/app/leads/$leadId" params={{ leadId: cb.lead_id }} className="min-w-0 flex-1 truncate text-sm hover:underline">{cb.lead_name}</Link>
              <span className="shrink-0 text-xs text-muted-foreground">{fmtIst(cb.due_at)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Site visits ({c.visits_upcoming})</div>
          {visits.length === 0 && <div className="text-xs text-muted-foreground">None booked</div>}
          {visits.map((v) => (
            <div key={v.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-success" />
              <Link to="/app/leads/$leadId" params={{ leadId: v.lead_id }} className="min-w-0 flex-1 truncate text-sm hover:underline">{v.lead_name}{v.project ? ` · ${v.project}` : ""}</Link>
              <span className="shrink-0 text-xs text-muted-foreground">{fmtIst(v.scheduled_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
