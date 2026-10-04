import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen, Save, Plus, Trash2, Loader2, Globe, FileText, Upload, ExternalLink,
  Eye, EyeOff, Sparkles, RefreshCw, X, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { PageHeader, btnPrimary, btnOutline, inputCls, EmptyState, Pill } from "@/components/shared";
import type { KbSection, KbEntry, KbSource, KbCrawlJob } from "@/lib/knowledge-client";

export const Route = createFileRoute("/app/knowledge")({
  component: KnowledgeBasePage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Profile {
  title: string;
  tagline: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  contact_website: string;
  contact_address: string;
  slug: string;
}

function KnowledgeBasePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    title: "", tagline: "", description: "", contact_email: "", contact_phone: "", contact_website: "", contact_address: "", slug: "",
  });
  const [kbStatus, setKbStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<KbSection[]>([]);
  const [entries, setEntries] = useState<KbEntry[]>([]);
  const [sources, setSources] = useState<KbSource[]>([]);
  const [job, setJob] = useState<KbCrawlJob | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState("");

  // crawl form
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlLimit, setCrawlLimit] = useState(100);
  const [crawlDepth, setCrawlDepth] = useState(3);
  const [crawlInclude, setCrawlInclude] = useState("");
  const [crawlExclude, setCrawlExclude] = useState("");
  const pollRef = useRef(false);

  async function load() {
    try {
      const b = await api.getKnowledge();
      setProfile({
        title: b.kb.title ?? "",
        tagline: b.kb.tagline ?? "",
        description: b.kb.description ?? "",
        contact_email: b.kb.contact_email ?? "",
        contact_phone: b.kb.contact_phone ?? "",
        contact_website: b.kb.contact_website ?? "",
        contact_address: b.kb.contact_address ?? "",
        slug: b.kb.slug ?? "",
      });
      setKbStatus(b.kb.status);
      setSections(b.sections);
      setEntries(b.entries);
      setSources(b.sources);
      const active = b.crawlJobs.find((j) => j.status === "paused" || j.status === "running" || j.status === "queued");
      setJob(active ?? b.crawlJobs[0] ?? null);
    } catch (e) {
      toast.error("Could not load your knowledge base", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Keep crawling in the background until it finishes, resuming across the
  // serverless time budget.
  async function runCrawl(id: string, start: KbCrawlJob) {
    if (pollRef.current) return;
    pollRef.current = true;
    let current = start;
    try {
      while (current.status === "paused" || current.status === "queued" || current.status === "running") {
        setJob(current);
        if (current.status === "paused" || current.status === "queued") {
          current = await api.resumeKbCrawl(id);
        } else {
          await sleep(1200);
          current = await api.getKbCrawl(id);
        }
      }
      setJob(current);
      if (current.status === "done") toast.success(`Website synced — ${current.pages_done} page${current.pages_done === 1 ? "" : "s"} indexed`);
      else if (current.status === "failed") toast.error("Crawl failed", { description: current.error ?? undefined });
      const b = await api.getKnowledge();
      setSources(b.sources);
    } catch (e) {
      toast.error("Crawl stopped", { description: (e as Error).message });
    } finally {
      pollRef.current = false;
    }
  }

  const publicUrl = profile.slug ? `${window.location.origin}/kb/${profile.slug}` : "";

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await api.updateKnowledge(profile);
      setKbStatus(updated.status);
      setProfile((p) => ({ ...p, slug: updated.slug ?? p.slug }));
      toast.success("Saved");
    } catch (e) {
      toast.error("Save failed", { description: (e as Error).message });
    } finally {
      setSavingProfile(false);
    }
  }

  async function togglePublish() {
    setBusy("publish");
    try {
      const updated = kbStatus === "published" ? await api.unpublishKnowledge() : await api.publishKnowledge();
      setKbStatus(updated.status);
      toast.success(updated.status === "published" ? "Published — live on the public URL" : "Unpublished");
    } catch (e) {
      toast.error("Could not update visibility", { description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  // ---- Sections ----
  function updateSectionLocal(id: string, patch: Partial<KbSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  async function saveSection(s: KbSection) {
    setBusy(`section-${s.id}`);
    try {
      await api.updateKbSection(s.id, { kind: s.kind ?? undefined, title: s.title ?? undefined, body: s.body ?? undefined, position: s.position });
      toast.success("Section saved");
    } catch (e) { toast.error("Save failed", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }
  async function addSection() {
    setBusy("add-section");
    try {
      const row = await api.createKbSection({ kind: "custom", title: "", body: "", position: sections.length });
      setSections((prev) => [...prev, row]);
    } catch (e) { toast.error("Could not add section", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }
  async function removeSection(id: string) {
    try { await api.deleteKbSection(id); setSections((prev) => prev.filter((s) => s.id !== id)); }
    catch (e) { toast.error("Delete failed", { description: (e as Error).message }); }
  }

  // ---- FAQ ----
  function updateEntryLocal(id: string, patch: Partial<KbEntry>) {
    setEntries((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  async function saveEntry(e: KbEntry) {
    setBusy(`entry-${e.id}`);
    try { await api.updateKbEntry(e.id, { question: e.question, answer: e.answer, tags: e.tags ?? undefined, position: e.position }); toast.success("FAQ saved"); }
    catch (err) { toast.error("Save failed", { description: (err as Error).message }); }
    finally { setBusy(null); }
  }
  async function addEntry() {
    setBusy("add-entry");
    try {
      const row = await api.createKbEntry({ question: "New question", answer: "Answer…", position: entries.length });
      setEntries((prev) => [...prev, row]);
    } catch (e) { toast.error("Could not add FAQ", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }
  async function removeEntry(id: string) {
    try { await api.deleteKbEntry(id); setEntries((prev) => prev.filter((s) => s.id !== id)); }
    catch (e) { toast.error("Delete failed", { description: (e as Error).message }); }
  }

  // ---- Files ----
  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy("files");
    try {
      const payload = await Promise.all(
        Array.from(files).map(async (f) => ({ filename: f.name, contentType: f.type || undefined, data: await fileToBase64(f) })),
      );
      const res = await api.uploadKbFiles(payload);
      const b = await api.getKnowledge();
      setSources(b.sources);
      if (res.indexed.length) toast.success(`Indexed ${res.indexed.length} file${res.indexed.length === 1 ? "" : "s"}`);
      if (res.skipped.length) toast.warning("Some files were skipped", { description: res.skipped.map((s) => `${s.filename}: ${s.reason}`).join("\n") });
    } catch (e) { toast.error("Upload failed", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }

  async function removeSource(id: string) {
    try { await api.deleteKbSource(id); setSources((prev) => prev.filter((s) => s.id !== id)); }
    catch (e) { toast.error("Delete failed", { description: (e as Error).message }); }
  }

  // ---- Crawl ----
  async function startCrawl() {
    if (!crawlUrl.trim()) { toast.error("Enter a website URL"); return; }
    setBusy("crawl");
    try {
      const started = await api.startKbCrawl({
        source_url: crawlUrl.trim(),
        limit: crawlLimit,
        max_depth: crawlDepth,
        include_paths: crawlInclude.trim(),
        exclude_paths: crawlExclude.trim(),
      });
      setJob(started);
      toast.success("Crawl started");
      runCrawl(started.id, started);
    } catch (e) { toast.error("Could not start crawl", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }

  async function cancelCrawl() {
    if (!job) return;
    try { const j = await api.cancelKbCrawl(job.id); setJob(j); } catch { /* ignore */ }
  }

  async function doPreview() {
    setBusy("preview");
    try { const { context } = await api.previewKnowledge(profile.title); setPreview(context || "(nothing indexed yet)"); }
    catch (e) { toast.error("Preview failed", { description: (e as Error).message }); }
    finally { setBusy(null); }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Add your business details here. They power your AI chat, emails, WhatsApp messages and voice agent — and publish as a read-only public page."
      >
        <div className="flex items-center gap-2">
          {kbStatus === "published" && publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className={btnOutline}>
              <ExternalLink className="h-4 w-4" /> View public page
            </a>
          )}
          <button onClick={togglePublish} disabled={busy === "publish"} className={kbStatus === "published" ? btnOutline : btnPrimary}>
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : kbStatus === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {kbStatus === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </PageHeader>

      {kbStatus === "published" && publicUrl && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-xs">
          <CheckCircle2 className="h-4 w-4 text-success-foreground" />
          <span className="text-muted-foreground">Publicly available at</span>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{publicUrl}</a>
        </div>
      )}

      {/* Profile */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Business profile</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Business name">
            <input className={inputCls} value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Acme Realty" />
          </Field>
          <Field label="Public URL slug">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">/kb/</span>
              <input className="flex-1 bg-transparent outline-none" value={profile.slug} onChange={(e) => setProfile({ ...profile, slug: e.target.value })} placeholder="acme-realty" />
            </div>
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <input className={inputCls} value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="Homes for modern families" />
          </Field>
          <Field label="About / description" className="sm:col-span-2">
            <textarea className={`${inputCls} min-h-24`} value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} placeholder="What you do, who you serve, what makes you different…" />
          </Field>
          <Field label="Contact email">
            <input className={inputCls} value={profile.contact_email} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} placeholder="hello@acme.com" />
          </Field>
          <Field label="Contact phone">
            <input className={inputCls} value={profile.contact_phone} onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={profile.contact_website} onChange={(e) => setProfile({ ...profile, contact_website: e.target.value })} placeholder="https://acme.com" />
          </Field>
          <Field label="Address">
            <input className={inputCls} value={profile.contact_address} onChange={(e) => setProfile({ ...profile, contact_address: e.target.value })} placeholder="123 Main St, Bengaluru" />
          </Field>
        </div>
        <div className="mt-4">
          <button onClick={saveProfile} disabled={savingProfile} className={btnPrimary}>
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
          </button>
        </div>
      </section>

      {/* Sections */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sections</h2>
          <button onClick={addSection} disabled={busy === "add-section"} className={btnOutline}>
            {busy === "add-section" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add section
          </button>
        </div>
        {sections.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">Add sections like Services, Opening hours, Coverage areas or Policies.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sections.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-background p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                  <input className={inputCls} value={s.title ?? ""} onChange={(e) => updateSectionLocal(s.id, { title: e.target.value })} placeholder="Section title" />
                  <select className={inputCls} value={s.kind ?? "custom"} onChange={(e) => updateSectionLocal(s.id, { kind: e.target.value })}>
                    {["custom", "services", "products", "hours", "location", "policy", "pricing", "about"].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <textarea className={`${inputCls} mt-3 min-h-20`} value={s.body ?? ""} onChange={(e) => updateSectionLocal(s.id, { body: e.target.value })} placeholder="Write the details…" />
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => saveSection(s)} disabled={busy === `section-${s.id}`} className={btnPrimary}>
                    {busy === `section-${s.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={() => removeSection(s.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">FAQ</h2>
          <button onClick={addEntry} disabled={busy === "add-entry"} className={btnOutline}>
            {busy === "add-entry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add FAQ
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">Add the questions customers ask most — the AI answers using these.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {entries.map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-background p-4">
                <input className={inputCls} value={e.question} onChange={(ev) => updateEntryLocal(e.id, { question: ev.target.value })} placeholder="Question" />
                <textarea className={`${inputCls} mt-3 min-h-16`} value={e.answer} onChange={(ev) => updateEntryLocal(e.id, { answer: ev.target.value })} placeholder="Answer" />
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => saveEntry(e)} disabled={busy === `entry-${e.id}`} className={btnPrimary}>
                    {busy === `entry-${e.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={() => removeEntry(e.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sources: files + website crawl */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Data sources</h2>
        </div>

        {/* Website crawl — mirrors Plivo's "Sync from website" */}
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sync from website</div>
          <input className={`${inputCls} mt-3`} value={crawlUrl} onChange={(e) => setCrawlUrl(e.target.value)} placeholder="https://your-website.com" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              <span className="text-muted-foreground">Limit (pages)</span>
              <input type="number" min={1} max={500} className={`${inputCls} mt-1`} value={crawlLimit} onChange={(e) => setCrawlLimit(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Max depth</span>
              <input type="number" min={0} max={5} className={`${inputCls} mt-1`} value={crawlDepth} onChange={(e) => setCrawlDepth(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Exclude paths (comma-separated)</span>
              <input className={`${inputCls} mt-1`} value={crawlExclude} onChange={(e) => setCrawlExclude(e.target.value)} placeholder="blog/*, about/*" />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Include only paths</span>
              <input className={`${inputCls} mt-1`} value={crawlInclude} onChange={(e) => setCrawlInclude(e.target.value)} placeholder="articles/*" />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={startCrawl} disabled={busy === "crawl" || (job != null && (job.status === "running" || job.status === "paused" || job.status === "queued"))} className={btnPrimary}>
              {busy === "crawl" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Crawl &amp; sync
            </button>
            {job && (job.status === "running" || job.status === "paused" || job.status === "queued") && (
              <button onClick={cancelCrawl} className={btnOutline}><X className="h-4 w-4" /> Cancel</button>
            )}
          </div>
          {job && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Pill className={job.status === "done" ? "bg-success/25 text-success-foreground" : job.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-sky/40 text-foreground"}>
                {job.status}
              </Pill>
              {job.status === "running" || job.status === "paused" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>{job.pages_done} page{job.pages_done === 1 ? "" : "s"} indexed{job.pages_found > job.pages_done ? ` · ${job.pages_found - job.pages_done} queued` : ""}</span>
              {job.error && <span className="text-destructive">· {job.error}</span>}
            </div>
          )}
        </div>

        {/* File upload */}
        <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Import files</div>
            <label className={`${btnOutline} cursor-pointer`}>
              {busy === "files" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
              <input type="file" multiple className="hidden" accept=".txt,.md,.markdown,.csv,.tsv,.json,.xml,.html,.htm" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Text, Markdown, CSV, JSON, XML or HTML — up to 2 MB each.</p>
        </div>

        {/* Indexed sources */}
        {sources.length > 0 && (
          <div className="mt-4 space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {s.type === "url" ? <Globe className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1 truncate">{s.name ?? s.id}</span>
                <Pill className="bg-muted text-muted-foreground">{s.status ?? "ready"}</Pill>
                <button onClick={() => removeSource(s.id)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-destructive/10" aria-label="Remove source">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Retrieval preview */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">What the AI sees</h2>
          </div>
          <button onClick={doPreview} disabled={busy === "preview"} className={btnOutline}>
            {busy === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Preview
          </button>
        </div>
        {preview && <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">{preview}</pre>}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Looking for how the AI uses this? It grounds your <Link to="/app/chat" className="text-primary hover:underline">AI Chat</Link>, email drafts, WhatsApp messages and the voice agent.
      </p>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`text-xs ${className ?? ""}`}>
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
