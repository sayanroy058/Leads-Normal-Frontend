import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, Save, Trash2, Loader2, Sparkles, Mail, Phone,
  Building2, MapPin, Tag, FileText, DollarSign, AlertTriangle, Home,
  MessageCircle, PhoneCall, MessagesSquare, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import type { LeadStatus } from "@/lib/leads-client";
import {
  PageHeader, Pill, Avatar, timeAgo, leadStatusStyles, leadStatusLabels,
  interestLabels, interestStyles, btnPrimary, inputCls,
} from "@/components/shared";

export const Route = createFileRoute("/app/leads/$leadId")({
  component: LeadDetail,
});

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  score: number;
  value: number | null;
  city: string | null;
  notes: string | null;
  last_activity: string | null;
  created_at: string;
  // Lead detail fields
  interest: string | null;
  category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  region: string | null;
  urgency: string | null;
};

const statuses: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "proposal", "closed", "lost"];
const interestOptions = ["buying", "selling", "partnering"];
const categoryOptions = ["product", "service", "subscription", "partnership"];
const urgencyOptions = ["asap", "1-3 months", "3-6 months", "6+ months"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function LeadDetail() {
  const { leadId } = Route.useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLead(await api.getLead(leadId));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId]);

  const set = (patch: Partial<Lead>) => setLead((p) => (p ? { ...p, ...patch } : p));

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    try {
      const updated = await api.updateLead(leadId, lead);
      setLead(updated);
      toast.success("Lead updated");
    } catch (err) {
      toast.error("Update failed", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!lead) return;
    if (!window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteLead(leadId);
      toast.success("Lead deleted");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error("Delete failed", { description: (err as Error).message });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Lead not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">It may have been deleted or the link is invalid.</p>
        <Link
          to="/app"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow"
        >
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </Link>
      </div>
    );
  }

  const quickActions = [
    { to: "/app/email", label: "AI email", icon: Mail, disabled: false },
    { to: "/app/messages", label: "WhatsApp", icon: MessageCircle, disabled: true },
    { to: "/app/caller", label: "Voice call", icon: PhoneCall, disabled: true },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.name}
        description={
          <span className="inline-flex items-center gap-2">
            <Pill className={leadStatusStyles[lead.status]}>{lead.status}</Pill>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Active {timeAgo(lead.last_activity ?? lead.created_at)}
            </span>
          </span>
        }
      >
        <button
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-60"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
        </button>
        <button
          type="submit"
          form="lead-form"
          disabled={saving}
          className={btnPrimary}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </PageHeader>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/app" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Leads
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-foreground">{lead.name}</span>
      </div>

      <form id="lead-form" onSubmit={onSave} className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="text-sm font-semibold">Contact &amp; lead info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className={inputCls} value={lead.name} onChange={(e) => set({ name: e.target.value })} required />
            </Field>
            <Field label="Stage">
              <select className={inputCls} value={lead.status} onChange={(e) => set({ status: e.target.value as LeadStatus })}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{leadStatusLabels[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={lead.email ?? ""} onChange={(e) => set({ email: e.target.value || null })} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={lead.phone ?? ""} onChange={(e) => set({ phone: e.target.value || null })} />
            </Field>
            <Field label="Company">
              <input className={inputCls} value={lead.company ?? ""} onChange={(e) => set({ company: e.target.value || null })} />
            </Field>
            <Field label="City">
              <input className={inputCls} value={lead.city ?? ""} onChange={(e) => set({ city: e.target.value || null })} />
            </Field>
            <Field label="Source">
              <input className={inputCls} value={lead.source ?? ""} onChange={(e) => set({ source: e.target.value || null })} />
            </Field>
            <Field label="Score (auto)">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full gradient-brand" style={{ width: `${lead.score}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums">{lead.score}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Auto-scored from how many lead fields are filled.</p>
            </Field>
            <Field label="Deal value (USD)">
              <input type="number" min={0} step="any" className={inputCls} value={lead.value ?? ""} onChange={(e) => set({ value: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
          </div>

          <h2 className="mt-6 text-sm font-semibold">Lead details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Interest">
              <select className={inputCls} value={lead.interest ?? ""} onChange={(e) => set({ interest: e.target.value || null })}>
                <option value="">Not specified</option>
                {interestOptions.map((o) => <option key={o} value={o}>{interestLabels[o] ?? o}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={lead.category ?? ""} onChange={(e) => set({ category: e.target.value || null })}>
                <option value="">Any / not sure</option>
                {categoryOptions.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Region">
              <input className={inputCls} value={lead.region ?? ""} onChange={(e) => set({ region: e.target.value || null })} placeholder="e.g. North, EMEA, Downtown" />
            </Field>
            <Field label="Urgency">
              <select className={inputCls} value={lead.urgency ?? ""} onChange={(e) => set({ urgency: e.target.value || null })}>
                <option value="">Not specified</option>
                {urgencyOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Budget (min, USD)">
              <input type="number" min={0} step="any" className={inputCls} value={lead.budget_min ?? ""} onChange={(e) => set({ budget_min: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="Budget (max, USD)">
              <input type="number" min={0} step="any" className={inputCls} value={lead.budget_max ?? ""} onChange={(e) => set({ budget_max: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notes">
              <textarea rows={4} className={inputCls} value={lead.notes ?? ""} onChange={(e) => set({ notes: e.target.value || null })} />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Summary</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={lead.name} className="h-12 w-12 text-sm" />
              <div>
                <div className="font-medium leading-tight">{lead.name}</div>
                <Pill className={`mt-0.5 ${leadStatusStyles[lead.status]}`}>{leadStatusLabels[lead.status]}</Pill>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{lead.email ?? "—"}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /><span className="tabular-nums">{lead.phone ?? "—"}</span></div>
              {lead.interest && (
                <div className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4 shrink-0" /><Pill className={interestStyles[lead.interest] ?? "bg-muted text-muted-foreground"}>{interestLabels[lead.interest] ?? lead.interest}</Pill></div>
              )}
              {lead.category && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4 shrink-0" /><span className="capitalize">{lead.category}</span></div>}
              {lead.region && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /><span>{lead.region}</span></div>}
              {(lead.budget_min || lead.budget_max) && (
                <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4 shrink-0" /><span className="tabular-nums">${Number(lead.budget_min ?? 0).toLocaleString()} – ${Number(lead.budget_max ?? 0).toLocaleString()}</span></div>
              )}
              {lead.urgency && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /><span className="capitalize">{lead.urgency}</span></div>}
              <div className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4 shrink-0" /><span className="capitalize">{lead.source ?? "—"}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-4 w-4 shrink-0" /><span>Score {lead.score}/100</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Take action</h2>
            <div className="mt-3 grid gap-2">
              {quickActions.map((a) =>
                a.disabled ? (
                  <div
                    key={a.to}
                    title={`${a.label} — coming soon`}
                    aria-disabled
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground/60"
                  >
                    <a.icon className="h-4 w-4" />
                    <span className="flex-1">{a.label}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide">Soon</span>
                  </div>
                ) : (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition hover:bg-accent"
                  >
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    {a.label}
                  </Link>
                )
              )}
              <Link
                to="/app/conversations"
                search={{ open: `conv-${lead.id}` }}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition hover:bg-accent"
              >
                <MessagesSquare className="h-4 w-4 text-muted-foreground" />
                Open conversation
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground shadow-soft">
            <FileText className="mb-2 h-4 w-4" />
            <div className="flex justify-between gap-2"><span>Created</span><span className="text-foreground/80">{timeAgo(lead.created_at)}</span></div>
            <div className="mt-1 flex justify-between gap-2"><span>Last activity</span><span className="text-foreground/80">{lead.last_activity ? timeAgo(lead.last_activity) : "—"}</span></div>
            <div className="mt-1 flex justify-between gap-2"><span>ID</span><span className="truncate pl-2 text-foreground/60">{lead.id}</span></div>
          </div>
        </div>
      </form>
    </div>
  );
}
