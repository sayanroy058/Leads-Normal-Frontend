import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in to Leads Normal" },
      { name: "description", content: "Log in to Leads Normal to upload leads and run AI email, WhatsApp and calling campaigns." },
      { property: "og:title", content: "Sign in to Leads Normal" },
      { property: "og:description", content: "Log in or create a Leads Normal account to manage your leads with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

// Public self-serve signup is disabled — accounts are created by an admin
// from the admin panel (/app/admin). Only the login form is shown here.
function AuthPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate({ to: "/app", replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Check your details", { description: "Enter a valid email and a password of at least 6 characters." });
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error("Login failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen gradient-hero lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Leads Normal</span>
        </Link>
        <div>
          <h2 className="max-w-md text-4xl font-bold tracking-tight">
            Every lead, <span className="text-gradient-brand">answered.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Upload CSV or Excel lead lists, chat with your data, and let AI handle email, WhatsApp and calls.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Leads Normal</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Leads Normal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back — pick up where you left off.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Email</span>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Password</span>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need an account? Ask your workspace admin to create one for you.
          </p>
        </div>
      </div>
    </div>
  );
}
