import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, User2, Loader2, Plus, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { useLeads } from "@/lib/leads-client";
import { api } from "@/api/client";
import { EmailComposeModal } from "@/components/compose-email";
import { Avatar, leadStatusStyles, leadStatusLabels, Pill } from "@/components/shared";

export const Route = createFileRoute("/app/chat")({
  component: AIChat,
});

type Msg = { id: string; role: "user" | "assistant"; text: string; citations?: string[] };

const suggested = [
  "Which leads are ready to move forward this week?",
  "Who has the highest budget among qualified leads?",
  "Summarize my proposals and closed deals this month.",
  "Which sources bring in the most leads?",
];

function AIChat() {
  const { leads } = useLeads();
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", text: "Hi — I'm your lead assistant. Ask me anything about your pipeline. I'll cite specific leads when I answer." },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ type: "email"; leadId: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const leadById = useMemo(() => Object.fromEntries(leads.map((l) => [l.id, l])), [leads]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, pending]);

  // The chat always opens fresh — past conversations are never loaded, so
  // each visit (and each "New chat") starts from a clean slate.
  function newChat() {
    setMessages([
      { id: "m0", role: "assistant", text: "Hi — I'm your lead assistant. Ask me anything about your pipeline. I'll cite specific leads when I answer." },
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || pending) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: t };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);
    api.insertChatMessage({ role: "user", content: t });
    try {
      // Send every lead so the model can answer about any of them — trimmed to
      // the fields chat actually needs, to keep the prompt size reasonable.
      const ctx = leads.map((l) => ({
        id: l.id, name: l.name, company: l.company, email: l.email, phone: l.phone,
        city: l.city, status: l.status, score: l.score,
        notes: l.notes, // requirements & context live here — the AI needs it to answer "what does this lead want"
        interest: l.interest, category: l.category,
        region: l.region, budget_max: l.budget_max, urgency: l.urgency,
      }));
      const history = messages
        .filter((m) => m.id !== "m0")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await api.aiChat({ question: t, leads: ctx, history });
      const asst: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: res.text,
        citations: res.citations,
      };
      setMessages((prev) => [...prev, asst]);
      api.insertChatMessage({ role: "assistant", content: res.text, citations: res.citations });
    } catch (e) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: `Sorry — I couldn't reach the AI service. ${(e as Error).message}` }]);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function renderText(text: string) {
    const parts = text.split(/(\[lead:[a-z0-9-]{8,}\])/gi);
    return parts.map((p, i) => {
      const m = p.match(/^\[lead:([a-z0-9-]{8,})\]$/i);
      if (!m) return <span key={i}>{p}</span>;
      const short = m[1];
      const full = leads.find((l) => l.id.startsWith(short));
      if (!full) return <span key={i} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">lead</span>;
      return (
        <span key={i} className="mx-0.5 inline-flex items-center gap-0.5 align-middle" onMouseEnter={() => setHovered(full.id)} onMouseLeave={() => setHovered(null)}>
          <Link
            to="/app/leads/$leadId"
            params={{ leadId: full.id }}
            className="inline-flex items-center gap-1 rounded-md bg-lilac/60 px-1.5 py-0.5 text-xs font-medium text-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            {full.name}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setCompose({ type: "email", leadId: full.id }); }}
            className="grid h-5 w-5 place-items-center rounded-md bg-lilac/60 text-foreground transition hover:bg-primary hover:text-primary-foreground"
            title={`Email ${full.name}`}
            aria-label={`Email ${full.name}`}
          >
            <Mail className="h-3 w-3" />
          </button>
          {/* WhatsApp isn't enabled yet — inline quick-send hidden until it is. */}
        </span>
      );
    });
  }

  return (
    <div className="grid h-[calc(100vh-8.5rem)] min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white shadow-glow">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Ask your leads</div>
            <div className="truncate text-xs text-muted-foreground">AI answers using your {leads.length} live leads — with citations</div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs text-success-foreground sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Connected
          </div>
          <button
            onClick={newChat}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" /> New chat
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-brand text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md gradient-brand text-white shadow-glow"
                  : "rounded-bl-md bg-muted/60 text-foreground"
              }`}>
                {m.role === "assistant" ? renderText(m.text) : m.text}
                {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    <span>Cited:</span>
                    {m.citations.map((id) => {
                      const l = leadById[id];
                      return l ? (
                        <Link key={id} to="/app/leads/$leadId" params={{ leadId: id }} className="rounded bg-card px-1.5 py-0.5 transition hover:bg-accent hover:text-foreground">
                          {l.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-background">
                  <User2 className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {pending && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-brand text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about your leads…"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <button onClick={() => send()} disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-2 text-xs font-medium text-white shadow-glow disabled:opacity-60">
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </div>
      </div>

      <aside className="hidden space-y-4 lg:block">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="text-sm font-semibold">Suggested prompts</div>
          <div className="mt-3 space-y-2">
            {suggested.map((s) => (
              <button key={s} onClick={() => send(s)} className="flex w-full items-start gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs leading-snug transition hover:bg-accent">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="text-sm font-semibold">Lead in focus</div>
          {hovered && leadById[hovered] ? (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Avatar name={leadById[hovered].name} className="h-8 w-8" />
                <div>
                  <Link to="/app/leads/$leadId" params={{ leadId: leadById[hovered].id }} className="text-sm font-semibold hover:underline">
                    {leadById[hovered].name}
                  </Link>
                  <div className="text-muted-foreground">{leadById[hovered].company} · {leadById[hovered].city}</div>
                </div>
              </div>
              {leadById[hovered].notes && <div className="rounded-lg bg-muted/60 p-2 leading-snug">{leadById[hovered].notes}</div>}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg bg-background p-2"><div className="text-muted-foreground">Score</div><div className="font-semibold tabular-nums">{leadById[hovered].score}</div></div>
                <div className="rounded-lg bg-background p-2"><div className="text-muted-foreground">Stage</div><Pill className={`mt-0.5 ${leadStatusStyles[leadById[hovered].status]}`}>{leadStatusLabels[leadById[hovered].status]}</Pill></div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => setCompose({ type: "email", leadId: leadById[hovered].id })}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-medium transition hover:bg-accent"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs leading-relaxed text-muted-foreground">Hover a cited lead to preview them here.</div>
          )}
        </div>
      </aside>

      {compose?.type === "email" && (
        <EmailComposeModal
          leads={leads}
          initialLeadId={compose.leadId}
          onClose={() => setCompose(null)}
          onDone={() => setCompose(null)}
        />
      )}
    </div>
  );
}
