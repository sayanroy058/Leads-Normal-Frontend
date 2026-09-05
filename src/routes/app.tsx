import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Bot, Mail, MessageCircle, PhoneCall, ImageIcon, Sparkles, Search, Bell, Sun, Moon, LogOut,
  Loader2, Users, PanelLeftClose, PanelLeftOpen, Menu, X, AlertTriangle, Inbox, ShieldAlert,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth-client";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";
import { initials, parseServerDate } from "@/components/shared";

const SIDEBAR_KEY = "sidebar_collapsed";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — Leads Normal" }] }),
  component: AppLayout,
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; disabled?: boolean }[] = [
  { to: "/app", label: "Leads", icon: LayoutDashboard, exact: true },
  { to: "/app/leads", label: "All Leads", icon: Users },
  { to: "/app/chat", label: "AI Chat", icon: Bot },
  { to: "/app/email", label: "Email Studio", icon: Mail },
  { to: "/app/messages", label: "WhatsApp", icon: MessageCircle, disabled: true },
  { to: "/app/caller", label: "Voice Agent", icon: PhoneCall, disabled: true },
  { to: "/app/studio", label: "Creatives", icon: ImageIcon },
];

const adminNav: { to: string; label: string; icon: typeof ShieldAlert; exact?: boolean } = {
  to: "/app/admin", label: "Admin", icon: ShieldAlert,
};

interface BreachedConv {
  id: string;
  lead_name: string;
  last_event_created: string | null;
}

function AppLayout() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isLoading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [breached, setBreached] = useState<BreachedConv[]>([]);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  // Auth guard: redirect to /auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isLoading, user, navigate]);

  // Admins only manage users — send them straight to the admin panel and
  // keep them out of the lead-working pages (and vice versa for normal users).
  useEffect(() => {
    if (!user) return;
    if (user.is_admin && !pathname.startsWith("/app/admin")) {
      navigate({ to: "/app/admin", replace: true });
    } else if (!user.is_admin && pathname.startsWith("/app/admin")) {
      navigate({ to: "/app", replace: true });
    }
  }, [user, pathname, navigate]);

  // Close the mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); setBellOpen(false); }, [pathname]);

  // SLA watchdog: breached conversations power the notification bell.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    async function load() {
      try {
        const rows = (await api.getConversations({ sla: "breached" })) as BreachedConv[];
        if (alive) setBreached(rows ?? []);
      } catch { /* non-critical */ }
    }
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  async function signOut() {
    await logout();
    navigate({ to: "/auth", replace: true });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    setSearchValue("");
    navigate({ to: "/app/leads", search: { q } });
  }

  const sidebarWidth = collapsed ? "lg:w-[72px]" : "lg:w-[260px]";

  const sidebarInner = (
    <>
      <div className={cn("flex h-16 items-center gap-2 border-b border-sidebar-border px-5", collapsed ? "lg:justify-center lg:px-2" : "")}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-brand shadow-glow">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className={cn("min-w-0", collapsed && "lg:hidden")}>
          <div className="truncate text-sm font-semibold leading-none">Leads Normal</div>
          <div className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">Workspace · {user?.name ?? "User"}</div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-accent lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {user?.is_admin ? (
          // Admin accounts manage users only — no lead-working pages.
          (() => {
            const active = pathname.startsWith(adminNav.to);
            const Icon = adminNav.icon;
            return (
              <Link
                to={adminNav.to as "/app/admin"}
                title={collapsed ? adminNav.label : undefined}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  collapsed && "lg:justify-center lg:px-0",
                  active
                    ? "gradient-brand text-white shadow-glow"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{adminNav.label}</span>
              </Link>
            );
          })()
        ) : (
          nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  title={`${item.label} — coming soon`}
                  aria-disabled
                  className={cn(
                    "mb-1 flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/35",
                    collapsed && "lg:justify-center lg:px-0",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn("flex-1", collapsed && "lg:hidden")}>{item.label}</span>
                  {!collapsed && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to as "/app"}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  collapsed && "lg:justify-center lg:px-0",
                  active
                    ? "gradient-brand text-white shadow-glow"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>
      <button
        onClick={toggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute -right-3 top-16 hidden h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft hover:bg-accent hover:text-foreground lg:grid",
          collapsed && "lg:grid",
        )}
      >
        {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
      </button>
    </>
  );

  return (
    <div className="min-h-screen gradient-hero text-foreground">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar — drawer on mobile, static on desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] -translate-x-full flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            sidebarWidth,
            mobileOpen && "translate-x-0",
          )}
        >
          {sidebarInner}
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border glass px-4 sm:px-6">
            <div className="flex flex-1 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card hover:bg-accent lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <form onSubmit={submitSearch} className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search leads…"
                  className="w-full rounded-xl border border-border bg-card/80 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </form>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card hover:bg-accent" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* SLA notifications */}
              <div className="relative">
                <button
                  onClick={() => setBellOpen((v) => !v)}
                  className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card hover:bg-accent"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {breached.length > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {breached.length}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="text-sm font-semibold">Notifications</div>
                        {breached.length > 0 && (
                          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                            {breached.length} SLA breach{breached.length === 1 ? "" : "es"}
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {breached.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                            <Inbox className="mx-auto mb-2 h-5 w-5 opacity-50" />
                            You're all caught up — no breached SLAs.
                          </div>
                        ) : (
                          breached.map((c) => (
                            <Link
                              key={c.id}
                              to="/app/conversations"
                              search={{ open: c.id }}
                              className="flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-accent/60"
                            >
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/15">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{c.lead_name}</div>
                                <div className="text-[11px] text-muted-foreground">
                                  Reply overdue · last event{" "}
                                  {c.last_event_created ? new Date(parseServerDate(c.last_event_created)).toLocaleString() : "unknown"}
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      <Link
                        to="/app/conversations"
                        className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-accent/60"
                      >
                        Open conversations
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className="ml-1 flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg gradient-brand text-xs font-semibold text-white">
                  {initials(user!.name ?? user!.email)}
                </div>
                <div className="hidden max-w-[150px] truncate text-xs leading-tight md:block">
                  <div className="truncate font-medium">{user!.name ?? user!.email}</div>
                  <div className="text-muted-foreground">{user!.email}</div>
                </div>
                <button onClick={signOut} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-accent" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>
          <div className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
