import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Upload, Users, FileSpreadsheet, Search, Mail, MessageCircle, PhoneCall, Plus, UserPlus, X,
  Loader2, Eye, Inbox, AlertTriangle, CheckCheck, Clock, DollarSign, CalendarCheck, Reply,
  ArrowRight,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import {
  useLeads, insertLeadsBulk, parseLeadFile, rowsToLeads, normalizePhone, useActivity, updateLeadStatus,
  type LeadStatus,
} from "@/lib/leads-client";
import { api } from "@/api/client";
import {
  PageHeader, StatCard, EmptyState, Avatar, timeAgo, leadStatusStyles,
  leadStatusLabels, interestLabels, interestStyles, Pill,
  StatSkeletonRow, btnPrimary, btnOutline, inputCls, parseServerDate,
} from "@/components/shared";

export const Route = createFileRoute("/app/")({
  component: LeadsDashboard,
});

const statuses: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "proposal", "closed", "lost"];

const interestOptions = ["buying", "selling", "partnering"];
const categoryOptions = ["product", "service", "subscription", "partnership"];
const urgencyOptions = ["asap", "1-3 months", "3-6 months", "6+ months"];

const DAY = 86_400_000;

function LeadsDashboard() {
  const { leads, loading, reload, setLeads } = useLeads();
  const { counts, activity } = useActivity();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [adding, setAdding] = useState(false);
  const [awaiting, setAwaiting] = useState(0);
  const [breached, setBreached] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Conversation health: what actually needs attention today.
  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          api.getConversations({ status: "awaiting_reply" }),
          api.getConversations({ sla: "breached" }),
        ]);
        setAwaiting(Array.isArray(a) ? a.length : 0);
        setBreached(Array.isArray(b) ? b.length : 0);
      } catch { /* non-critical */ }
    })();
  }, [leads.length]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return l.name.toLowerCase().includes(s) || (l.email ?? "").toLowerCase().includes(s) || (l.company ?? "").toLowerCase().includes(s);
    });
  }, [leads, q, status]);

  /* ---------------- KPI math (all real, no placeholders) ---------------- */

  const kpis = useMemo(() => {
    const now = Date.now();
    const thisWeek = leads.filter((l) => now - parseServerDate(l.created_at) < 7 * DAY).length;
    const lastWeek = leads.filter((l) => {
      const age = now - parseServerDate(l.created_at);
      return age >= 7 * DAY && age < 14 * DAY;
    }).length;
    const trend =
      lastWeek > 0
        ? { text: `${thisWeek >= lastWeek ? "+" : ""}${Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}%`, dir: (thisWeek >= lastWeek ? "up" : "down") as "up" | "down" }
        : thisWeek > 0
          ? { text: `+${thisWeek}`, dir: "up" as const }
          : null;

    const openValue = leads.filter((l) => l.status !== "lost").reduce((s, l) => s + Number(l.value ?? 0), 0);
    const closed = leads.filter((l) => l.status === "closed").length;
    const conversion = leads.length ? Math.round((closed / leads.length) * 100) : 0;
    const outreach = counts.emails + counts.whatsapps + counts.calls;

    return { thisWeek, trend, openValue, closed, conversion, outreach };
  }, [leads, counts]);

  /* ---------------- Charts ---------------- */

  const createdPerDay = useMemo(() => {
    const days: { day: string; leads: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const label = d.toLocaleDateString("en", { weekday: "short" });
      const n = leads.filter((l) => new Date(parseServerDate(l.created_at)).toDateString() === d.toDateString()).length;
      days.push({ day: label, leads: n });
    }
    return days;
  }, [leads]);

  const funnel = useMemo(() => {
    const by = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
    const total = Math.max(leads.length, 1);
    return (["new", "contacted", "qualified", "meeting", "proposal", "closed"] as LeadStatus[]).map((key) => ({
      key,
      label: leadStatusLabels[key],
      count: by(key),
      pct: Math.round((by(key) / total) * 100),
    }));
  }, [leads]);

  const lostCount = useMemo(() => leads.filter((l) => l.status === "lost").length, [leads]);

  const topSources = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of leads) map[l.source ?? "other"] = (map[l.source ?? "other"] ?? 0) + 1;
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 4).map(([name, value]) => ({ name, value }));
    const rest = entries.slice(4).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push({ name: "other", value: rest });
    return top;
  }, [leads]);

  const maxSource = Math.max(...topSources.map((s) => s.value), 1);

  /* ---------------- Import ---------------- */

  async function onUpload(files: FileList | null) {
    if (!files || !files.length) return;
    const f = files[0];
    let rows: Record<string, string>[] = [];
    try {
      rows = await parseLeadFile(f);
    } catch (err) {
      toast.error("Couldn't read that file", { description: (err as Error).message });
      return;
    }
    const { leads: newLeads, stats } = rowsToLeads(rows);
    if (!newLeads.length) {
      toast.error("Couldn't parse leads", { description: "Make sure your file has a header row with at least a name or email column." });
      return;
    }
    const { error } = await insertLeadsBulk(newLeads);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      return;
    }
    if (stats.invalidPhones > 0) {
      toast.success(`Imported ${stats.imported} leads`, {
        description: `${f.name} — ${stats.invalidPhones} lead${stats.invalidPhones === 1 ? "" : "s"} had an unusable phone number and were imported without one.`,
      });
    } else {
      toast.success(`Imported ${stats.imported} leads`, { description: f.name });
    }
    reload();
  }

  async function quickStatus(id: string, next: LeadStatus) {
    // Optimistic update; revert on failure.
    const prev = leads;
    setLeads((rows) => rows.map((l) => (l.id === id ? { ...l, status: next } : l)));
    try {
      await updateLeadStatus(id, next);
    } catch (e) {
      setLeads(prev);
      toast.error("Couldn't update status", { description: (e as Error).message });
    }
  }

  const chartColor = "oklch(0.62 0.16 255)";

  /* ---------------- Render ---------------- */

  const isEmpty = !loading && leads.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads overview"
        description="A live snapshot of your lead pipeline, meetings, proposals and outreach."
      >
        <button onClick={() => setAdding(true)} className={btnOutline}>
          <UserPlus className="h-4 w-4" /> Add lead
        </button>
        <button onClick={() => fileRef.current?.click()} className={btnPrimary}>
          <Upload className="h-4 w-4" /> Upload leads
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,.tsv,.xlsx,.xls,.xlsm,.ods"
          onChange={(e) => onUpload(e.target.files)}
          className="hidden"
        />
      </PageHeader>

      {loading ? (
        <>
          <StatSkeletonRow />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl border border-border bg-card shadow-soft lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-2xl border border-border bg-card shadow-soft" />
          </div>
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card shadow-soft" />
        </>
      ) : isEmpty ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Import your lead list — interest, budget and region are auto-detected, leads are scored automatically, and every channel lives in one inbox."
        >
          <button onClick={() => fileRef.current?.click()} className={btnPrimary}>
            <Upload className="h-4 w-4" /> Upload a file
          </button>
          <button onClick={() => setAdding(true)} className={btnOutline}>
            <Plus className="h-4 w-4" /> Add manually
          </button>
        </EmptyState>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total leads"
              value={leads.length.toLocaleString()}
              icon={Users}
              tint="gradient-soft"
              trend={kpis.trend}
              sub={`${kpis.thisWeek} new this week`}
            />
            <StatCard
              label="Pipeline value"
              value={`$${kpis.openValue.toLocaleString()}`}
              icon={DollarSign}
              tint="gradient-peach"
              sub="open deals (excl. lost)"
            />
            <StatCard
              label="Closed deals"
              value={kpis.closed.toLocaleString()}
              icon={CalendarCheck}
              tint="gradient-mint"
              sub={`${kpis.conversion}% of all leads`}
            />
            <StatCard
              label="Awaiting reply"
              value={awaiting.toLocaleString()}
              icon={Reply}
              tint="gradient-sky"
              sub={
                breached > 0 ? (
                  <Link to="/app/conversations" search={{}} className="font-medium text-destructive hover:underline">
                    {breached} SLA breach{breached === 1 ? "" : "es"} →
                  </Link>
                ) : (
                  "no SLA breaches"
                )
              }
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">New leads</div>
                  <div className="text-xs text-muted-foreground">Created per day · last 14 days</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: chartColor }} />
                  {createdPerDay.reduce((s, d) => s + d.leads, 0)} total
                </div>
              </div>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={createdPerDay} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" vertical={false} />
                    <XAxis dataKey="day" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="leads" stroke={chartColor} fill="url(#gLeads)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funnel + sources */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="text-sm font-semibold">Pipeline funnel</div>
                <div className="text-xs text-muted-foreground">Share of {leads.length} leads per stage</div>
                <div className="mt-4 space-y-3">
                  {funnel.map((s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="font-medium capitalize">{s.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {s.count} · {s.pct}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full gradient-brand transition-all"
                          style={{ width: `${Math.max(s.pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {lostCount > 0 && (
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Plus {lostCount} lost — {Math.round((lostCount / leads.length) * 100)}% of all leads.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="text-sm font-semibold">Top sources</div>
                <div className="text-xs text-muted-foreground">Where your leads come from</div>
                <div className="mt-3 space-y-2.5">
                  {topSources.map((s) => (
                    <div key={s.name} className="flex items-center gap-3 text-xs">
                      <span className="w-20 shrink-0 truncate capitalize text-muted-foreground">{s.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-sky" style={{ width: `${(s.value / maxSource) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right font-medium tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table + activity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card shadow-soft lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-semibold">Recent leads</div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{filtered.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-40 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <select value={status} onChange={(e) => setStatus(e.target.value as "all" | LeadStatus)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs capitalize outline-none">
                    <option value="all">All status</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Link
                    to="/app/leads"
                    search={{}}
                    className="inline-flex items-center gap-1.5 rounded-lg gradient-brand px-2.5 py-1.5 text-xs font-medium text-white shadow-glow"
                  >
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Lead</th>
                      <th className="px-4 py-2.5 text-left font-medium">Interest</th>
                      <th className="px-4 py-2.5 text-left font-medium">Status</th>
                      <th className="px-4 py-2.5 text-left font-medium">Score</th>
                      <th className="px-4 py-2.5 text-right font-medium">Value</th>
                      <th className="px-4 py-2.5 text-left font-medium">Added</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 6).map((l) => (
                      <tr key={l.id} className="border-t border-border transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link to="/app/leads/$leadId" params={{ leadId: l.id }} className="flex items-center gap-3">
                            <Avatar name={l.name} />
                            <div className="min-w-0">
                              <div className="truncate font-medium leading-tight">{l.name}</div>
                              <div className="truncate text-xs text-muted-foreground">{l.company ?? l.email ?? "—"}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {l.interest ? (
                            <Pill className={interestStyles[l.interest] ?? "bg-muted text-muted-foreground"}>
                              {interestLabels[l.interest] ?? l.interest}
                            </Pill>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={l.status}
                            onChange={(e) => quickStatus(l.id, e.target.value as LeadStatus)}
                            className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-[11px] font-medium capitalize outline-none ${leadStatusStyles[l.status]}`}
                            aria-label={`Status for ${l.name}`}
                          >
                            {statuses.map((s) => <option key={s} value={s} className="bg-card text-foreground">{leadStatusLabels[s]}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${l.score >= 70 ? "bg-success" : l.score >= 40 ? "bg-warning" : "bg-muted-foreground/40"}`}
                                style={{ width: `${Math.max(l.score, 3)}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{l.score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">${Number(l.value ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(l.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/app/leads/$leadId"
                            params={{ leadId: l.id }}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No leads match your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Live activity</div>
                  <div className="text-xs text-muted-foreground">Across email, WhatsApp and calls</div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{counts.emails}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{counts.whatsapps}</span>
                  <span className="inline-flex items-center gap-1"><PhoneCall className="h-3 w-3" />{counts.calls}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                {activity.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No activity yet. Send your first AI email, WhatsApp, or call.
                  </div>
                )}
                {activity.map((a) => {
                  const Icon = a.text.startsWith("Inbound") ? Inbox : a.type === "email" ? Mail : a.type === "whatsapp" ? MessageCircle : PhoneCall;
                  const tint = a.text.startsWith("Inbound") ? "gradient-sky" : a.type === "email" ? "gradient-peach" : a.type === "whatsapp" ? "gradient-mint" : "gradient-soft";
                  const failed = /failed|no_answer/i.test(a.text);
                  const delivered = /(delivered|opened|completed|booked)/i.test(a.text);
                  const sent = /(sent|queued)/i.test(a.text) && !delivered;
                  const StatusIcon = failed ? AlertTriangle : delivered ? CheckCheck : sent ? Clock : null;
                  return (
                    <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3">
                      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tint}`}>
                        <Icon className="h-4 w-4 text-foreground/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{a.text}</div>
                        <div className="text-[11px] text-muted-foreground">{timeAgo(a.when)}</div>
                      </div>
                      {StatusIcon && (
                        <StatusIcon className={`h-4 w-4 shrink-0 ${failed ? "text-destructive" : delivered ? "text-success" : "text-muted-foreground/60"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {adding && (
        <AddLeadModal
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); reload(); }}
        />
      )}
    </div>
  );
}

const statusOptions: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "proposal", "closed", "lost"];

function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", city: "",
    source: "manual", status: "new" as LeadStatus, value: "", notes: "",
    interest: "buying", category: "", region: "", budget: "", urgency: "",
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const phoneInput = form.phone.trim();
    const phone = phoneInput ? normalizePhone(phoneInput) : null;
    if (phoneInput && !phone?.valid) {
      toast.error("That phone number doesn't look valid", { description: "Double-check it, or leave the field blank." });
      return;
    }
    setBusy(true);
    const { error } = await insertLeadsBulk([{
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: phone?.formatted ?? null,
      company: form.company.trim() || null,
      city: form.city.trim() || null,
      source: form.source.trim() || "manual",
      status: form.status,
      value: form.value.trim() === "" ? null : Number(form.value),
      notes: form.notes.trim() || null,
      interest: form.interest || null,
      category: form.category.trim().toLowerCase() || null,
      region: form.region.trim() || null,
      budget_max: form.budget.trim() === "" ? null : Number(form.budget),
      urgency: form.urgency || null,
    }]);
    setBusy(false);
    if (error) { toast.error("Couldn't add lead", { description: error.message }); return; }
    toast.success("Lead added");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="grid max-h-[90vh] w-full max-w-lg grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2"><UserPlus className="h-4 w-4" /><div className="text-sm font-semibold">Add lead manually</div></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <form id="add-lead-form" onSubmit={onSubmit} className="overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Full name *</span>
              <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} required autoFocus />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <select className={inputCls} value={form.status} onChange={(e) => set({ status: e.target.value as LeadStatus })}>
                {statusOptions.map((s) => <option key={s} value={s}>{leadStatusLabels[s]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Email</span>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Phone</span>
              <input className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Company</span>
              <input className={inputCls} value={form.company} onChange={(e) => set({ company: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">City</span>
              <input className={inputCls} value={form.city} onChange={(e) => set({ city: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Source</span>
              <input className={inputCls} value={form.source} onChange={(e) => set({ source: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Interest</span>
              <select className={inputCls} value={form.interest} onChange={(e) => set({ interest: e.target.value })}>
                {interestOptions.map((o) => <option key={o} value={o}>{interestLabels[o] ?? o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
                <option value="">Any / not sure</option>
                {categoryOptions.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Region</span>
              <input className={inputCls} value={form.region} onChange={(e) => set({ region: e.target.value })} placeholder="e.g. North, EMEA, Downtown" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Budget (max, USD)</span>
              <input type="number" min={0} step="any" className={inputCls} value={form.budget} onChange={(e) => set({ budget: e.target.value })} placeholder="e.g. 750000" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Urgency</span>
              <select className={inputCls} value={form.urgency} onChange={(e) => set({ urgency: e.target.value })}>
                <option value="">Not specified</option>
                {urgencyOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Deal value (USD)</span>
              <input type="number" min={0} step="any" className={inputCls} value={form.value} onChange={(e) => set({ value: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
              <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
            </label>
          </div>
        </form>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className={btnOutline}>Cancel</button>
          <button type="submit" form="add-lead-form" disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add lead
          </button>
        </div>
      </div>
    </div>
  );
}
