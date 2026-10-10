import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen gradient-hero text-foreground">
      <header className="border-b border-border glass">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand shadow-glow">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">{kb.title ?? "Knowledge Base"}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {kb.content && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{kb.content}</p>
          </section>
        )}

        {!kb.content && (
          <p className="text-sm text-muted-foreground">No details published yet.</p>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Powered by <Link to="/" className="text-primary hover:underline">GradLeadAI</Link>
        </footer>
      </main>
    </div>
  );
}
