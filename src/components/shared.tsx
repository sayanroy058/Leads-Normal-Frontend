import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads-client";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Parse a timestamp that may be either a proper ISO string ("...T...Z"/with
 * offset) or SQLite's bare `datetime('now')` format ("YYYY-MM-DD HH:MM:SS",
 * always UTC but with no timezone marker). `new Date(...)` treats the latter
 * as local time, which silently shifts every such timestamp by the browser's
 * UTC offset — e.g. a row created seconds ago showing as "6h ago". Detecting
 * the space-separated, marker-less form and re-parsing it as UTC fixes that.
 */
export function parseServerDate(raw: string): number {
  const isBareSqliteFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw);
  const iso = isBareSqliteFormat ? `${raw.replace(" ", "T")}Z` : raw;
  return new Date(iso).getTime();
}

/** Compact relative time: "just now", "5m ago", "3h ago", "2d ago", or a date. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = parseServerDate(iso);
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const past = diff >= 0;
  const mins = Math.round(Math.abs(diff) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return past ? `${mins}m ago` : `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return past ? `${days}d ago` : `in ${days}d`;
  return new Date(then).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  const val = (name ?? "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return val || "?";
}

/* ------------------------------------------------------------------ */
/* Avatar — deterministic pastel tint per name                         */
/* ------------------------------------------------------------------ */

const AVATAR_TINTS = [
  "bg-[oklch(0.45_0.18_255)] text-white",
  "bg-[oklch(0.62_0.14_165)] text-white",
  "bg-[oklch(0.6_0.15_25)] text-white",
  "bg-[oklch(0.55_0.12_75)] text-white",
  "bg-[oklch(0.58_0.13_290)] text-white",
  "bg-[oklch(0.55_0.12_230)] text-white",
];

export function Avatar({ name, className }: { name: string; className?: string }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const tint = AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
  return (
    <div
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-semibold",
        tint,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint = "gradient-soft",
  trend,
  className,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  icon: typeof import("lucide-react").User;
  tint?: string;
  /** e.g. "+12%" with a direction for the little arrow color. */
  trend?: { text: string; dir: "up" | "down" | "flat" } | null;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tint)}>
          <Icon className="h-4 w-4 text-foreground/80" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 flex min-h-4 items-center gap-2 text-xs text-muted-foreground">
        {trend && (
          <span
            className={cn(
              "font-medium",
              trend.dir === "up" && "text-success-foreground",
              trend.dir === "down" && "text-destructive",
            )}
          >
            {trend.text}
          </span>
        )}
        {sub && <span className="truncate">{sub}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof import("lucide-react").User;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-soft">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status pills                                                        */
/* ------------------------------------------------------------------ */

export const leadStatusStyles: Record<LeadStatus, string> = {
  new: "bg-sky/40 text-foreground",
  contacted: "bg-warning/20 text-warning-foreground",
  qualified: "bg-lilac/50 text-foreground",
  meeting: "bg-mint/40 text-foreground",
  proposal: "bg-brand/15 text-brand",
  closed: "bg-success/25 text-success-foreground",
  lost: "bg-destructive/15 text-destructive",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  meeting: "Meeting",
  proposal: "Proposal",
  closed: "Closed",
  lost: "Lost",
};

/** Interest badges (industry-neutral: buying / selling / partnering). */
export const interestLabels: Record<string, string> = {
  buying: "Buying",
  selling: "Selling",
  partnering: "Partnering",
};

export const interestStyles: Record<string, string> = {
  buying: "bg-sky/40 text-foreground",
  selling: "bg-lilac/50 text-foreground",
  partnering: "bg-mint/40 text-foreground",
};

export const convStatusStyles: Record<string, string> = {
  new: "bg-sky/40 text-foreground",
  active: "bg-lilac/50 text-foreground",
  awaiting_reply: "bg-warning/20 text-warning-foreground",
  resolved: "bg-success/25 text-success-foreground",
  archived: "bg-muted text-muted-foreground",
};

export const slaStyles: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  within_sla: "bg-success/25 text-success-foreground",
  breached: "bg-destructive/15 text-destructive",
};

export function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Kanban lane shell (email / whatsapp / caller / studio boards)       */
/* ------------------------------------------------------------------ */

export function LaneShell({
  label,
  icon: Icon,
  tint,
  count,
  accent,
  children,
}: {
  label: string;
  icon: typeof import("lucide-react").User;
  tint: string;
  count: number;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[280px] flex-col rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("grid h-7 w-7 place-items-center rounded-lg", tint)}>
            <Icon className={cn("h-3.5 w-3.5 text-foreground/80", accent)} />
          </span>
          <div className="text-sm font-semibold">{label}</div>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading skeletons                                                   */
/* ------------------------------------------------------------------ */

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function StatSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Bar className="h-9 w-9 rounded-xl" />
          <Bar className="mt-3 h-7 w-24" />
          <Bar className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Bar className="h-9 w-9 rounded-xl" />
          <Bar className="h-3 w-40" />
          <Bar className="ml-auto h-3 w-24" />
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coming-soon page gate (channels not yet enabled for this workspace) */
/* ------------------------------------------------------------------ */

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof import("lucide-react").User;
  title: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <EmptyState
        icon={Icon}
        title={title}
        description={description ?? "This feature isn't enabled for your workspace yet. Ask your admin if you need it turned on."}
        className="max-w-sm"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons — the two house styles, as small helpers                    */
/* ------------------------------------------------------------------ */

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-60";

export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:pointer-events-none disabled:opacity-60";

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring";
