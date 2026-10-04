import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Mail, Phone, Globe, MapPin, Loader2, Sparkles } from "lucide-react";
import { api } from "@/api/client";
import type { PublicKb } from "@/lib/knowledge-client";

// Public, read-only page. Rendered without any auth or app chrome — it is the
// user-facing half of the per-user Knowledge Base. The matching backend route
// only returns published knowledge bases.

export const Route = createFileRoute("/kb/$slug")({
  head: () => ({
    meta: [
      { title: "Knowledge Base" },
      { name: "description", content: "Business information and frequently asked questions." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PublicKbPage,
});

type State =
  | { status: "loading" }
  | { status: "ready"; kb: PublicKb }
  | { status: "missing" }
  | { status: "error"; message: string };

function PublicKbPage() {
  const { slug } = Route.useParams();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const kb = await api.getPublicKb(slug);
        if (alive) setState({ status: "ready", kb });
      } catch (e) {
        const message = (e as Error).message;
        if (alive) setState(/not found/i.test(message) ? { status: "missing" } : { status: "error", message });
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (state.status === "ready" && state.kb.title) {
      document.title = `${state.kb.title} — Knowledge Base`;
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">{state.status === "missing" ? "Knowledge base not found" : "Something went wrong"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.status === "missing"
              ? "This page doesn't exist or hasn't been published yet."
              : state.message}
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-xl gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow">Go home</Link>
        </div>
      </div>
    );
  }

  const { kb } = state;
  const contactItems = [
    kb.contact.email && { icon: Mail, label: kb.contact.email, href: `mailto:${kb.contact.email}` },
    kb.contact.phone && { icon: Phone, label: kb.contact.phone, href: `tel:${kb.contact.phone}` },
    kb.contact.website && { icon: Globe, label: kb.contact.website, href: kb.contact.website },
    kb.contact.address && { icon: MapPin, label: kb.contact.address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href?: string }[];

  return (
    <div className="min-h-screen gradient-hero text-foreground">
      <header className="border-b border-border glass">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand shadow-glow">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">{kb.title ?? "Knowledge Base"}</h1>
            {kb.tagline && <p className="truncate text-sm text-muted-foreground">{kb.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {kb.description && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> About
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{kb.description}</p>
          </section>
        )}

        {contactItems.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {contactItems.map((c) => {
                const Icon = c.icon;
                const inner = (
                  <span className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-brand" />
                    <span className="min-w-0 truncate">{c.label}</span>
                  </span>
                );
                return c.href
                  ? <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="rounded-lg transition hover:text-primary">{inner}</a>
                  : <div key={c.label}>{inner}</div>;
              })}
            </div>
          </section>
        )}

        {kb.sections.filter((s) => (s.body ?? "").trim()).map((s, i) => (
          <section key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold capitalize">{s.title || s.kind || "Details"}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}

        {kb.faqs.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">Frequently asked questions</h2>
            <div className="mt-3 divide-y divide-border">
              {kb.faqs.map((f, i) => (
                <details key={i} className="group py-3" open={i === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                    {f.question}
                    <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Powered by <Link to="/" className="text-primary hover:underline">GradLeadAI</Link>
        </footer>
      </main>
    </div>
  );
}
