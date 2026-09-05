import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-client";
import gradleadLogo from "@/site/assets/gradlead-logo.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in to GradLeadAI" },
      { name: "description", content: "Log in to GradLeadAI to upload leads and run AI email, WhatsApp and calling campaigns." },
      { property: "og:title", content: "Sign in to GradLeadAI" },
      { property: "og:description", content: "Log in or create a GradLeadAI account to manage your leads with AI." },
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

  // GradLead homepage visual language (see src/site/components/Hero.css):
  // light mint-white gradient, subtle navy grid, soft green glow, navy→green CTA.
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(112, 195, 144, 0.20), transparent 45%), radial-gradient(circle at 85% 35%, rgba(66, 88, 111, 0.10), transparent 35%), linear-gradient(180deg, #f9fcfa 0%, #f0f7f2 55%, #f8faf9 100%)",
      }}
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(28, 33, 67, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 33, 67, 0.045) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 60%)",
        }}
      />

      {/* Background glows */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 620,
          height: 620,
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(112, 195, 144, 0.18)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 420,
          height: 420,
          right: -140,
          top: 320,
          background: "rgba(66, 88, 111, 0.12)",
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
        {/* Brand header — mirrors the gradelead navbar */}
        <header className="flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
              <img
                src={gradleadLogo}
                alt="GradLead AI Logo"
                className="block h-full w-full object-contain"
              />
            </span>
            <span
              className="whitespace-nowrap font-bold"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontSize: 19,
                letterSpacing: "-0.35px",
                color: "#1c2143",
              }}
            >
              Grad<span style={{ color: "#70c390" }}>Lead AI</span>
            </span>
          </Link>

          <Link
            to="/"
            className="rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors"
            style={{ color: "#42586f" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1c2143")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#42586f")}
          >
            ← Back to home
          </Link>
        </header>

        {/* Login card — styled with the gradelead homepage palette */}
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <div
              className="rounded-2xl border bg-white/85 p-8 backdrop-blur-md sm:p-10"
              style={{
                borderColor: "rgba(112, 195, 144, 0.35)",
                boxShadow:
                  "0 8px 25px rgba(28, 33, 67, 0.07), 0 20px 60px -20px rgba(28, 33, 67, 0.18)",
              }}
            >
              <div className="text-center">
                <div
                  className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide"
                  style={{
                    color: "#1c2143",
                    background: "rgba(255, 255, 255, 0.88)",
                    borderColor: "rgba(112, 195, 144, 0.32)",
                    boxShadow: "0 8px 25px rgba(28, 33, 67, 0.07)",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  <span style={{ color: "#70c390" }}>✦</span>
                  WELCOME BACK
                </div>

                <h1
                  className="mt-4 text-3xl font-bold tracking-tight"
                  style={{ color: "#1c2143", fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
                >
                  Sign in to GradLeadAI
                </h1>

                <p className="mt-2 text-sm" style={{ color: "#42586f", fontFamily: '"Inter", sans-serif' }}>
                  Enter your credentials to access your lead dashboard.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "#1c2143" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ width: 16, height: 16, color: "#70c390" }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                      style={{
                        borderColor: "rgba(28, 33, 67, 0.14)",
                        color: "#1c2143",
                        fontFamily: '"Inter", sans-serif',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#70c390";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(112, 195, 144, 0.25)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(28, 33, 67, 0.14)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>


                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "#1c2143" }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ width: 16, height: 16, color: "#70c390" }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                      style={{
                        borderColor: "rgba(28, 33, 67, 0.14)",
                        color: "#1c2143",
                        fontFamily: '"Inter", sans-serif',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#70c390";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(112, 195, 144, 0.25)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(28, 33, 67, 0.14)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, #1c2143 0%, #293451 30%, #42586f 70%, #70c390 100%)",
                    boxShadow:
                      "0 12px 30px rgba(28, 33, 67, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 40px rgba(28, 33, 67, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 30px rgba(28, 33, 67, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.14)";
                  }}
                >
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <span aria-hidden>→</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs" style={{ color: "#42586f", fontFamily: '"Inter", sans-serif' }}>
                New to GradLeadAI? Ask your admin to create an account for you.
              </p>
            </div>


            {/* Footer trust line — mirrors the homepage CTA trust bar */}
            <p
              className="mt-6 text-center text-xs tracking-wide"
              style={{ color: "rgba(28, 33, 67, 0.55)", fontFamily: '"Inter", sans-serif' }}
            >
              <span>Capture</span>
              <span style={{ color: "#70c390" }}> • </span>
              <span>Qualify</span>
              <span style={{ color: "#70c390" }}> • </span>
              <span>Engage</span>
              <span style={{ color: "#70c390" }}> • </span>
              <span>Convert</span>
              <span> — all with GradLead AI.</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

