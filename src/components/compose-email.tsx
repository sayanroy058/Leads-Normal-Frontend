import { useState } from "react";
import {
  Mail, Sparkles, Send, Wand2, Loader2, X, CheckCircle2, Clock, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { personalize, type Attachment } from "@/lib/attachments";
import { AttachmentPicker } from "@/components/attachments";
import { btnPrimary, btnOutline, inputCls, EmptyState } from "@/components/shared";
import type { Lead } from "@/lib/leads-client";

const tones = ["Friendly", "Professional", "Direct", "Playful"] as const;
const goals = ["Schedule a meeting", "Send details", "New product alert", "Follow-up"] as const;

export type ComposeMode = "ai" | "manual";

export function EmailComposeModal({
  leads,
  initialLeadId,
  initialMode = "ai",
  onClose,
  onDone,
}: {
  leads: Lead[];
  initialLeadId?: string;
  initialMode?: ComposeMode;
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<ComposeMode>(initialMode);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialLeadId ? [initialLeadId] : []));
  const [tone, setTone] = useState<(typeof tones)[number]>("Professional");
  const [goal, setGoal] = useState<(typeof goals)[number]>("Schedule a meeting");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = leads.filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) { setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }

  async function generateAll() {
    if (!selected.size) { toast.error("Pick at least one recipient"); return; }
    setBusy(true);
    try {
      const targets = leads.filter((l) => selected.has(l.id));
      const results = await Promise.all(
        targets.map(async (lead) => {
          const out = await api.aiComposeEmail({
            lead: { id: lead.id, name: lead.name, company: lead.company, email: lead.email, city: lead.city, status: lead.status, score: lead.score, value: lead.value, source: lead.source, notes: lead.notes },
            tone, goal,
          });
          return { lead_id: lead.id, subject: out.subject, body: out.body, tone, goal, status: "draft" };
        }),
      );
      await api.insertEmails(results);
      toast.success(`AI drafted ${results.length} emails`);
      onDone();
    } catch (e) {
      toast.error("AI generation failed", { description: (e as Error).message });
    } finally { setBusy(false); }
  }

  async function saveOrSend(sendNow: boolean) {
    if (!selected.size) { toast.error("Pick at least one recipient"); return; }
    if (!subject.trim()) { toast.error("Add a subject line"); return; }
    if (!body.trim()) { toast.error("Write a message first"); return; }
    setBusy(true);
    try {
      const targets = leads.filter((l) => selected.has(l.id));
      const items = targets.map((lead) => ({
        lead_id: lead.id,
        subject: personalize(subject, lead),
        body: personalize(body, lead),
        status: "draft",
        attachments,
      }));
      const res = await api.insertEmails(items);
      if (sendNow) {
        // Send every recipient one after another with a pause in between —
        // pacing avoids Gmail throttling (which is what caused bulk sends to
        // leave most messages stuck in draft). Each send also gets its own
        // retries as a safety net.
        let ok = 0;
        let failed = 0;
        const failedNames: string[] = [];
        for (let i = 0; i < res.items.length; i++) {
          const it = res.items[i];
          let sent = false;
          for (let attempt = 1; attempt <= 3 && !sent; attempt++) {
            try { await api.sendEmail(it.id); sent = true; }
            catch {
              if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt)); // backoff
              else failedNames.push(leads.find((l) => l.id === it.lead_id)?.name ?? it.lead_id.slice(0, 8));
            }
          }
          if (sent) ok++; else failed++;
          // Pause between sends so they go out one at a time, not in a burst.
          if (i < res.items.length - 1) await new Promise((r) => setTimeout(r, 4000));
        }
        if (failed === 0) toast.success(`${ok} email${ok === 1 ? "" : "s"} sent`);
        else toast.success(`${ok} email${ok === 1 ? "" : "s"} sent`, { description: `${failed} still in draft: ${failedNames.join(", ")} — you can retry from Email Studio.` });
      } else {
        toast.success(`Saved ${items.length} draft${items.length === 1 ? "" : "s"}`);
      }
      onDone();
    } catch (e) {
      toast.error("Failed", { description: (e as Error).message });
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="grid max-h-[90vh] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><div className="text-sm font-semibold">New email</div></div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-muted p-1">
              <button
                onClick={() => setMode("ai")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "ai" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI assist
              </button>
              <button
                onClick={() => setMode("manual")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "manual" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                <PenLine className="h-3.5 w-3.5" /> Write manually
              </button>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
          {/* Recipients */}
          <div>
            <div className="text-xs font-medium text-muted-foreground">Recipients ({selected.size})</div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className={`${inputCls} mt-2`} />
            <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border bg-background p-2">
              {filtered.slice(0, 60).map((l) => (
                <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                  <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="accent-primary" />
                  <span className="flex-1 truncate">{l.name} <span className="text-xs text-muted-foreground">· {l.company}</span></span>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">No leads match.</div>
              )}
            </div>
            {leads.length === 0 && (
              <div className="mt-3">
                <EmptyState icon={Mail} title="No leads yet" description="Import leads first, then come back to draft emails." className="py-6" />
              </div>
            )}
          </div>

          {/* Content */}
          {mode === "ai" ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Tone</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {tones.map((t) => (
                    <button key={t} onClick={() => setTone(t)} className={`rounded-full border px-3 py-1 text-xs transition ${tone === t ? "gradient-brand border-transparent text-white" : "border-border bg-background hover:bg-accent"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Goal</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {goals.map((g) => (
                    <button key={g} onClick={() => setGoal(g)} className={`rounded-full border px-3 py-1 text-xs transition ${goal === g ? "gradient-brand border-transparent text-white" : "border-border bg-background hover:bg-accent"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground"><Sparkles className="h-3.5 w-3.5" /> One-click AI generation</div>
                <p className="mt-1">AI drafts a personalized email for each recipient using their company, city, and notes. You can edit any draft before sending.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Subject</div>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this email about?" className={`${inputCls} mt-1`} />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Message</div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Write your email… Use {name}, {company} or {city} to personalize each recipient's copy."
                  className={`${inputCls} mt-1 resize-y`}
                />
              </div>
              <AttachmentPicker files={attachments} onChange={setAttachments} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
          {mode === "ai" ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Drafts saved automatically</div>
          ) : (
            <div className="text-xs text-muted-foreground">Same copy goes to every recipient{attachments.length ? ` · ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}` : ""}</div>
          )}
          <div className="flex items-center gap-2">
            {mode === "manual" && (
              <button onClick={() => saveOrSend(false)} disabled={busy} className={btnOutline}>
                <Clock className="h-4 w-4" /> Save as drafts
              </button>
            )}
            {mode === "ai" ? (
              <button onClick={generateAll} disabled={busy} className={btnPrimary}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate {selected.size > 0 ? `${selected.size} email${selected.size === 1 ? "" : "s"}` : "emails"}
              </button>
            ) : (
              <button onClick={() => saveOrSend(true)} disabled={busy} className={btnPrimary}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send now{selected.size > 0 ? ` (${selected.size})` : ""}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
