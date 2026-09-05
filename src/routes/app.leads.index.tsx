import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Loader2, Trash2, Download, Wand2, Upload, Users, RefreshCw, X } from "lucide-react";
import { useLeads, downloadLeadsCsv, normalizePhone, type LeadStatus } from "@/lib/leads-client";
import { api } from "@/api/client";
import {
  PageHeader, EmptyState, Avatar, timeAgo, leadStatusStyles, leadStatusLabels, interestLabels, interestStyles, Pill,
  TableSkeleton, btnPrimary, btnOutline,
} from "@/components/shared";

export const Route = createFileRoute("/app/leads/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: AllLeads,
});

const statuses: LeadStatus[] = ["new", "contacted", "qualified", "meeting", "proposal", "closed", "lost"];

function AllLeads() {
  const navigate = useNavigate();
  const searchQ = Route.useSearch({ select: (s) => s.q });
  const { leads, loading, reload } = useLeads();
  const [q, setQ] = useState(searchQ ?? "");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [fixingPhones, setFixingPhones] = useState(false);

  // Keep local search in sync when the header search navigates here with ?q=.
  useEffect(() => { if (searchQ !== undefined) setQ(searchQ); }, [searchQ]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        l.name.toLowerCase().includes(s) ||
        (l.email ?? "").toLowerCase().includes(s) ||
        (l.company ?? "").toLowerCase().includes(s) ||
        (l.phone ?? "").toLowerCase().includes(s) ||
        (l.city ?? "").toLowerCase().includes(s)
      );
    });
  }, [leads, q, status]);

  const counts = useMemo(() => {
    const t: Record<string, number> = {};
    for (const l of leads) t[l.status] = (t[l.status] ?? 0) + 1;
    return t;
  }, [leads]);

  // Drop any selected ids that fell out of the current filter/result set.
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(filtered.map((l) => l.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const rows = selected.size ? filtered.filter((l) => selected.has(l.id)) : filtered;
    if (!rows.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadLeadsCsv(rows, `leads-export-${stamp}.csv`);
  }

  // One-time cleanup: re-run the phone normalizer over existing leads so
  // records saved before the parser fix (or entered with messy formatting)
  // get reformatted, and unusable values (junk placeholders, too-short
  // numbers) get cleared instead of sitting there looking like real data.
  async function fixPhoneNumbers() {
    const targets = (selected.size ? filtered.filter((l) => selected.has(l.id)) : leads).filter((l) => l.phone);
    if (!targets.length) {
      window.alert("No phone numbers to check in the current view.");
      return;
    }
    if (!window.confirm(`Re-check formatting on ${targets.length} lead${targets.length === 1 ? "" : "s"} with a phone number? Unusable values will be cleared.`)) return;
    setFixingPhones(true);
    let changed = 0;
    let cleared = 0;
    try {
      for (const l of targets) {
        const result = normalizePhone(l.phone!);
        const next = result.valid ? result.formatted : null;
        if (next === l.phone) continue; // already in the right shape
        await api.updateLead(l.id, { phone: next });
        changed++;
        if (!result.valid) cleared++;
      }
      await reload();
      window.alert(
        changed
          ? `Updated ${changed} lead${changed === 1 ? "" : "s"}.${cleared ? ` ${cleared} had an unusable number and were cleared.` : ""}`
          : "All phone numbers were already in the correct format."
      );
    } catch (e) {
      window.alert(`Failed to fix phone numbers: ${(e as Error).message}`);
    } finally {
      setFixingPhones(false);
    }
  }

  async function deleteSelected() {
    if (!selected.size) return;
    const ids = [...selected];
    if (!window.confirm(`Delete ${ids.length} lead${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteLeadsBulk(ids);
      setSelected(new Set());
      await reload();
    } catch (e) {
      window.alert(`Failed to delete leads: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  const noLeads = !loading && leads.length === 0;
  const noMatches = !loading && leads.length > 0 && filtered.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="All leads"
        description="Every lead in one place — with interest, budget and stage. Click a row to view or edit."
      >
        <Link to="/app" className={btnOutline}>
          <Upload className="h-4 w-4" /> Import
        </Link>
        <button onClick={() => reload()} className={btnOutline} aria-label="Refresh leads">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </PageHeader>

      {/* Toolbar: search + status pills */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, company, phone…"
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatus("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              status === "all" ? "gradient-brand text-white shadow-glow" : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            All <span className="tabular-nums opacity-70">{leads.length}</span>
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                status === s ? "gradient-brand text-white shadow-glow" : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {leadStatusLabels[s]} <span className="tabular-nums opacity-70">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            onClick={fixPhoneNumbers}
            disabled={fixingPhones}
            title={selected.size ? `Re-check phone formatting on ${selected.size} selected lead(s)` : "Re-check phone formatting on all leads"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-60"
          >
            {fixingPhones ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Fix phones
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            title={selected.size ? `Export ${selected.size} selected lead(s)` : `Export ${filtered.length} lead(s)`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <TableSkeleton rows={8} />
        </div>
      ) : noLeads ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Import a CSV/Excel of your buyer and seller list, or add a lead manually — they'll show up here."
        >
          <Link to="/app" className={btnPrimary}>Go to importer</Link>
        </EmptyState>
      ) : noMatches ? (
        <EmptyState
          icon={Search}
          title="No leads match"
          description={`Nothing found for ${q ? `“${q}”` : "these filters"}. Try a different search or clear the status filter.`}
        >
          <button onClick={() => { setQ(""); setStatus("all"); }} className={btnOutline}>Clear filters</button>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleAll}
                      aria-label="Select all leads"
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">Lead</th>
                  <th className="px-4 py-2.5 text-left font-medium">Interest</th>
                  <th className="px-4 py-2.5 text-left font-medium">Company / City</th>
                  <th className="px-4 py-2.5 text-left font-medium">Phone</th>
                  <th className="px-4 py-2.5 text-left font-medium">Source</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Score</th>
                  <th className="px-4 py-2.5 text-right font-medium">Value</th>
                  <th className="px-4 py-2.5 text-left font-medium">Added</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => navigate({ to: "/app/leads/$leadId", params: { leadId: l.id } })}
                    className={`cursor-pointer border-t border-border transition hover:bg-muted/30 ${selected.has(l.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleOne(l.id)}
                        aria-label={`Select ${l.name}`}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium leading-tight">{l.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{l.email ?? "—"}</div>
                        </div>
                      </div>
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
                    <td className="px-4 py-3">{l.company ?? "—"}<div className="text-xs text-muted-foreground">{l.city ?? ""}</div></td>
                    <td className="px-4 py-3 tabular-nums">{l.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{l.source ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${leadStatusStyles[l.status]}`}>{leadStatusLabels[l.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
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
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span>{filtered.length} lead{filtered.length === 1 ? "" : "s"}</span>
            <span className="lg:hidden">
              <button onClick={exportCsv} className="inline-flex items-center gap-1 hover:text-foreground"><Download className="h-3 w-3" /> Export</button>
            </span>
          </div>
        </div>
      )}

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-elegant backdrop-blur">
            <span className="px-1 text-sm font-medium">{selected.size} selected</span>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={fixPhoneNumbers}
              disabled={fixingPhones}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-60"
            >
              {fixingPhones ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Fix phones
            </button>
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
            </button>
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setSelected(new Set())} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Clear selection">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
