import { useState } from "react";
import {
  MessageCircle, Sparkles, Send, Wand2, Loader2, X, Clock, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { personalize, type Attachment } from "@/lib/attachments";
import { AttachmentPicker } from "@/components/attachments";
import { btnPrimary, btnOutline, inputCls } from "@/components/shared";
import type { Lead } from "@/lib/leads-client";

const intents = ["Meeting reminder", "Follow-up", "New offer alert", "Quick check-in"];

export type ComposeMode = "ai" | "manual";

export function WhatsappComposeModal({
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
  const [intent, setIntent] = useState(intents[0]);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const eligible = leads.filter((l) => l.phone);
  const filtered = eligible.filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()));

  function toggle(id: string) { setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function selectAll() { setSelected(new Set(filtered.map((l) => l.id))); }

  async function generate() {
    if (!selected.size) { toast.error("Pick at least one recipient"); return; }
    setBusy(true);
    try {
      const targets = leads.filter((l) => selected.has(l.id));
      const results = await Promise.all(
        targets.map(async (lead) => {
          const out = await api.aiComposeWhatsapp({
            lead: { id: lead.id, name: lead.name, company: lead.company, email: lead.email, city: lead.city, status: lead.status, score: lead.score, value: lead.value, source: lead.source, notes: lead.notes },
            intent,
          });
          return { lead_id: lead.id, body: out.body, status: "draft" };
        }),
      );
      await api.insertWhatsapps(results);
      toast.success(`Drafted ${results.length} messages`);
      onDone();
    } catch (e) {
      toast.error("AI failed", { description: (e as Error).message });
    } finally { setBusy(false); }
  }

  async function saveOrSend(sendNow: boolean) {
    if (!selected.size) { toast.error("Pick at least one recipient"); return; }
    if (!body.trim()) { toast.error("Write a message first"); return; }
    setBusy(true);
    try {
      const targets = leads.filter((l) => selected.has(l.id));
      const items = targets.map((lead) => ({
        lead_id: lead.id,
        body: personalize(body, lead),
        status: "draft",
        attachments,
      }));
      const res = await api.insertWhatsapps(items);
      if (sendNow) {
        let ok = 0;
        let failed = 0;
        for (const it of res.items) {
          try { await api.sendWhatsapp(it.id); ok++; }
          catch { failed++; }
        }
        if (failed === 0) toast.success(`${ok} message${ok === 1 ? "" : "s"} sent`);
        else toast.success(`${ok} message${ok === 1 ? "" : "s"} sent`, { description: `${failed} failed — check the list for details.` });
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
          <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /><div className="text-sm font-semibold">New WhatsApp message</div></div>
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
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">Recipients ({selected.size}/{eligible.length})</div>
              <button onClick={selectAll} className="text-xs font-medium text-primary hover:underline">Select all</button>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={`${inputCls} mt-2`} />
            <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border bg-background p-2">
              {filtered.slice(0, 60).map((l) => (
                <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                  <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="accent-primary" />
                  <span className="flex-1 truncate">{l.name} <span className="text-xs text-muted-foreground">· {l.phone}</span></span>
                </label>
              ))}
              {eligible.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No leads with a phone number. Add phone numbers to your leads first.
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {mode === "ai" ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Message intent</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {intents.map((g) => (
                    <button key={g} onClick={() => setIntent(g)} className={`rounded-full border px-3 py-1 text-xs transition ${intent === g ? "gradient-brand border-transparent text-white" : "border-border bg-background hover:bg-accent"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground"><Sparkles className="h-3.5 w-3.5" /> Personalized per recipient</div>
                <p className="mt-1">AI writes a unique 1-3 sentence message for each lead. Edit any draft before sending.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Message</div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Write your message… Use {name}, {company} or {city} to personalize each recipient's copy."
                  className={`${inputCls} mt-1 resize-y`}
                />
              </div>
              <AttachmentPicker files={attachments} onChange={setAttachments} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
          <div className="text-xs text-muted-foreground">
            {mode === "manual"
              ? `Same copy to every recipient${attachments.length ? ` · ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}` : ""}`
              : "Drafts are saved to the list — send from there."}
          </div>
          <div className="flex items-center gap-2">
            {mode === "manual" && (
              <button onClick={() => saveOrSend(false)} disabled={busy} className={btnOutline}>
                <Clock className="h-4 w-4" /> Save as drafts
              </button>
            )}
            {mode === "ai" ? (
              <button onClick={generate} disabled={busy} className={btnPrimary}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate drafts
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
