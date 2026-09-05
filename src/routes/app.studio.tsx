import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Image as ImageIcon, Sparkles, Download, Share2, Wand2, Plus, X, Loader2, CheckCircle2, Clock,
  AlertCircle, PenLine, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { PageHeader, Pill, timeAgo, btnPrimary, btnOutline, inputCls, EmptyState } from "@/components/shared";

export const Route = createFileRoute("/app/studio")({
  component: Studio,
});

const presets = [
  { id: "poster", label: "Poster", ratio: "3:4", w: 600, h: 800, size: "1024x1536" },
  { id: "banner", label: "Web banner", ratio: "16:9", w: 800, h: 450, size: "1536x1024" },
  { id: "story", label: "IG Story", ratio: "9:16", w: 450, h: 800, size: "1024x1536" },
  { id: "square", label: "IG Post", ratio: "1:1", w: 600, h: 600, size: "1024x1024" },
  { id: "ad", label: "Ad creative", ratio: "4:5", w: 600, h: 750, size: "1024x1536" },
];

type Stage = "queued" | "generating" | "ready";
interface Job {
  id: string;
  prompt: string;
  preset: typeof presets[number];
  stage: Stage;
  createdAt: number;
  swatch: string;
  imageUrl?: string;
  error?: string;
}

const swatches = [
  "linear-gradient(135deg,#a78bfa,#fbbf24)",
  "linear-gradient(135deg,#7dd3fc,#f0abfc)",
  "linear-gradient(135deg,#86efac,#a5f3fc)",
  "linear-gradient(135deg,#fda4af,#fdba74)",
  "linear-gradient(135deg,#c4b5fd,#fde68a)",
  "linear-gradient(135deg,#67e8f9,#c084fc)",
];

function fileBase(id: string) {
  return `leadsnormal-${id}-${Date.now()}`;
}

async function downloadImage(url: string, filename: string) {
  try {
    if (url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = await (await fetch(url)).blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(obj);
    }
    toast.success("Downloaded", { description: filename });
  } catch {
    window.open(url, "_blank");
  }
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Couldn't copy — select and copy manually.");
  }
}

const stageMeta: Record<Stage, { label: string; cls: string; Icon: typeof Clock }> = {
  queued: { label: "Queued", cls: "bg-muted text-muted-foreground", Icon: Clock },
  generating: { label: "Generating", cls: "bg-warning/20 text-warning-foreground", Icon: Loader2 },
  ready: { label: "Ready", cls: "bg-success/25 text-success-foreground", Icon: CheckCircle2 },
};

type Tab = "all" | Stage;

function Studio() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [composing, setComposing] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  async function enqueue(job: Job) {
    setJobs((prev) => [job, ...prev]);
    await new Promise((r) => setTimeout(r, 400));
    setJobs((p) => p.map((x) => (x.id === job.id ? { ...x, stage: "generating" } : x)));
    try {
      const res = await api.aiImage({ prompt: job.prompt, size: job.preset.size });
      setJobs((p) => p.map((x) => (x.id === job.id ? { ...x, stage: "ready", imageUrl: res.image, error: undefined } : x)));
    } catch (e) {
      const msg = (e as Error).message;
      setJobs((p) => p.map((x) => (x.id === job.id ? { ...x, stage: "ready", imageUrl: undefined, error: msg } : x)));
      toast.error("Generation failed", { description: msg });
    }
  }

  const retry = (j: Job) => enqueue({ ...j, id: crypto.randomUUID(), stage: "queued", imageUrl: undefined, error: undefined });

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(() => {
    const count = (s: Stage | null) => (s ? jobs.filter((j) => j.stage === s).length : jobs.length);
    return [
      { key: "all", label: "All", count: count(null) },
      { key: "queued", label: "Queued", count: count("queued") },
      { key: "generating", label: "Generating", count: count("generating") },
      { key: "ready", label: "Ready", count: count("ready") },
    ];
  }, [jobs]);

  const visible = useMemo(() => (tab === "all" ? jobs : jobs.filter((j) => j.stage === tab)), [jobs, tab]);

  const readyCount = jobs.filter((j) => j.stage === "ready" && !j.error && j.imageUrl).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creative Studio"
        description="Create product posts, promo graphics and launch announcements — image, caption and hashtags in one click."
      >
        <button onClick={() => setComposing(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> New creative
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              tab === t.key
                ? "gradient-brand text-white shadow-glow"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {t.label} <span className={`tabular-nums ${tab === t.key ? "opacity-70" : "text-muted-foreground/70"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Gallery */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No creatives yet"
          description="Generate a single image or a complete post — image, caption and hashtags — ready to publish."
        >
          <button onClick={() => setComposing(true)} className={btnPrimary}>
            <Plus className="h-4 w-4" /> New creative
          </button>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={`Nothing ${tab === "all" ? "" : `in “${tabs.find((t) => t.key === tab)?.label}” `}yet`}
          description="Creatives in this view will show up here as they move through the pipeline."
        >
          <button onClick={() => setTab("all")} className={btnOutline}>
            Show all creatives
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{visible.length} creative{visible.length === 1 ? "" : "s"}</span>
            {readyCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {readyCount} ready to download
              </span>
            )}
          </div>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4">
            {visible.map((j) => {
              const meta = stageMeta[j.stage];
              return (
                <div key={j.id} className="break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {/* Image */}
                  <div className="group relative" style={{ aspectRatio: `${j.preset.w}/${j.preset.h}` }}>
                    {j.imageUrl ? (
                      <img src={j.imageUrl} alt={j.prompt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="relative grid h-full w-full place-items-center text-white" style={{ background: j.swatch }}>
                        <div className="px-6 text-center text-sm font-semibold leading-snug drop-shadow">{j.prompt.slice(0, 80)}</div>
                      </div>
                    )}

                    {/* Status chip */}
                    <div className="absolute left-3 top-3">
                      <Pill className={`${meta.cls} shadow-soft`}>
                        <meta.Icon className={`h-3 w-3 ${j.stage === "generating" ? "animate-spin" : ""}`} />
                        {meta.label}
                      </Pill>
                    </div>

                    {/* Generating overlay */}
                    {j.stage === "generating" && (
                      <div className="absolute inset-0 grid place-items-center bg-foreground/40 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                        </div>
                      </div>
                    )}

                    {/* Hover actions (ready images only) */}
                    {j.stage === "ready" && j.imageUrl && (
                      <div className="absolute inset-x-0 bottom-0 hidden items-center justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-3 group-hover:flex">
                        <button
                          onClick={() => downloadImage(j.imageUrl!, `${fileBase(j.preset.id)}.png`)}
                          className="inline-flex items-center gap-1.5 rounded-lg gradient-brand px-3 py-1.5 text-xs font-medium text-white shadow-glow"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(j.imageUrl!); toast.success("Image data copied"); }}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                          title="Copy image data"
                          aria-label="Copy image data"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => retry(j)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                          title="Regenerate"
                          aria-label="Regenerate"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold capitalize">{j.preset.label}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{j.preset.ratio}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{j.prompt}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(new Date(j.createdAt).toISOString())}</span>
                    </div>

                    {j.stage === "ready" && j.error && (
                      <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                        <div className="flex items-center gap-1.5 font-medium"><AlertCircle className="h-3.5 w-3.5" /> Generation failed</div>
                        <p className="mt-1 break-words text-destructive/80">{j.error}</p>
                        <button onClick={() => retry(j)} className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs hover:bg-accent">
                          <Wand2 className="h-3 w-3" /> Retry
                        </button>
                      </div>
                    )}

                    {/* Always-visible actions for ready images on touch (no hover) */}
                    {j.stage === "ready" && j.imageUrl && (
                      <div className="mt-3 flex gap-1.5 sm:hidden">
                        <button onClick={() => downloadImage(j.imageUrl!, `${fileBase(j.preset.id)}.png`)} className={`${btnPrimary} flex-1 px-2 py-1.5 text-xs`}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                        <button onClick={() => retry(j)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Regenerate">
                          <Wand2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {composing && (
        <Composer
          onClose={() => setComposing(false)}
          onSubmit={(prompt, preset) => {
            enqueue({ id: crypto.randomUUID(), prompt, preset, stage: "queued", createdAt: Date.now(), swatch: swatches[Math.floor(Math.random() * swatches.length)] });
            setComposing(false);
            toast.success("Creative queued");
          }}
          onPostDone={(image, imagePrompt, preset) => {
            setJobs((prev) => [
              { id: crypto.randomUUID(), prompt: imagePrompt, preset, stage: "ready", createdAt: Date.now(), swatch: swatches[Math.floor(Math.random() * swatches.length)], imageUrl: image },
              ...prev,
            ]);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composer — single image or complete post                            */
/* ------------------------------------------------------------------ */

type ComposerMode = "creative" | "post";

const platforms: { id: string; label: string; size: string }[] = [
  { id: "Instagram", label: "Instagram", size: "1024x1024" },
  { id: "Instagram Story", label: "IG Story", size: "1024x1536" },
  { id: "LinkedIn", label: "LinkedIn", size: "1536x1024" },
  { id: "Facebook", label: "Facebook", size: "1536x1024" },
  { id: "X", label: "X (Twitter)", size: "1536x1024" },
];

function presetForSize(size: string) {
  return presets.find((p) => p.size === size) ?? presets[0];
}

interface GeneratedPost {
  caption: string;
  hashtags: string[];
  image: string;
  imagePrompt: string;
  platform: string;
}

function Composer({
  onClose,
  onSubmit,
  onPostDone,
}: {
  onClose: () => void;
  onSubmit: (prompt: string, preset: typeof presets[number]) => void;
  onPostDone: (image: string, imagePrompt: string, preset: typeof presets[number]) => void;
}) {
  const [mode, setMode] = useState<ComposerMode>("creative");
  const [prompt, setPrompt] = useState("Festive product launch poster with bold typography");
  const [preset, setPreset] = useState(presets[0]);
  // Post fields
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [post, setPost] = useState<GeneratedPost | null>(null);

  async function copy(text: string, label: string) {
    await copyText(text, label);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  async function generatePost() {
    if (!topic.trim()) { toast.error("Describe the post topic first"); return; }
    setBusy(true);
    try {
      const res = await api.aiPost({ topic: topic.trim(), platform: platform.id, audience: audience.trim() || undefined });
      const img = await api.aiImage({ prompt: res.image_prompt, size: platform.size });
      setPost({ caption: res.caption, hashtags: res.hashtags, image: img.image, imagePrompt: res.image_prompt, platform: platform.label });
      onPostDone(img.image, res.image_prompt, presetForSize(platform.size));
    } catch (e) {
      toast.error("Post generation failed", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function resetPost() {
    setPost(null);
    setTopic("");
    setAudience("");
  }

  const fullPostText = post
    ? `${post.caption}\n\n${post.hashtags.join(" ")}`
    : "";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="grid max-h-[90vh] w-full max-w-2xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <div className="text-sm font-semibold">{mode === "post" && post ? "Your post is ready" : "New creative"}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-muted p-1">
              <button
                onClick={() => { setMode("creative"); setPost(null); }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "creative" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ImageIcon className="h-3.5 w-3.5" /> Creative
              </button>
              <button
                onClick={() => { setMode("post"); setPost(null); }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${mode === "post" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                <PenLine className="h-3.5 w-3.5" /> Post
              </button>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          {mode === "creative" ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Prompt</div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={`${inputCls} mt-1`} />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Format</div>
                <div className="mt-1 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {presets.map((p) => (
                    <button key={p.id} onClick={() => setPreset(p)} className={`rounded-xl border px-3 py-2 text-left text-xs transition ${preset.id === p.id ? "border-primary bg-accent" : "border-border bg-background hover:bg-accent"}`}>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-muted-foreground">{p.ratio}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : post ? (
            /* Post result */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="overflow-hidden rounded-xl border border-border" style={{ aspectRatio: "1/1" }}>
                  <img src={post.image} alt={post.imagePrompt} className="h-full w-full object-cover" />
                </div>
                <button
                  onClick={() => downloadImage(post.image, `leadsnormal-post-${Date.now()}.png`)}
                  className={`${btnPrimary} mt-3 w-full`}
                >
                  <Download className="h-4 w-4" /> Download image
                </button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">Posted to your gallery · {post.platform}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Caption</span>
                    <button
                      onClick={() => copy(post.caption, "Caption")}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      {copied === "Caption" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />} Copy
                    </button>
                  </div>
                  <div className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-sm leading-relaxed">
                    {post.caption}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Hashtags ({post.hashtags.length})</span>
                    <button
                      onClick={() => copy(post.hashtags.join(" "), "Hashtags")}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      {copied === "Hashtags" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />} Copy
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.hashtags.map((h) => (
                      <span key={h} className="rounded-full bg-lilac/40 px-2.5 py-1 text-xs font-medium text-foreground">{h}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => copy(fullPostText, "Full post")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium transition hover:bg-accent"
                >
                  {copied === "Full post" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy caption + hashtags
                </button>
              </div>
            </div>
          ) : (
            /* Post form */
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Post topic</div>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="e.g. We just launched our new analytics dashboard — real-time insights, no setup required"
                  className={`${inputCls} mt-1`}
                />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Platform</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${platform.id === p.id ? "gradient-brand border-transparent text-white" : "border-border bg-background hover:bg-accent"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Target audience <span className="font-normal">(optional)</span></div>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. startup founders, marketing managers"
                  className={`${inputCls} mt-1`}
                />
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground"><Sparkles className="h-3.5 w-3.5" /> One click, everything</div>
                <p className="mt-1">AI writes the caption and hashtags, crafts a matching image, and adds the finished image to your gallery.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
          {mode === "post" && post ? (
            <>
              <button onClick={resetPost} className={btnOutline} disabled={busy}>
                <Wand2 className="h-4 w-4" /> Generate another
              </button>
              <button onClick={onClose} className={btnPrimary}>
                <CheckCircle2 className="h-4 w-4" /> Done
              </button>
            </>
          ) : mode === "creative" ? (
            <button onClick={() => onSubmit(prompt, preset)} className={`${btnPrimary} ml-auto`}>
              <Sparkles className="h-4 w-4" /> Generate
            </button>
          ) : (
            <button onClick={generatePost} disabled={busy} className={`${btnPrimary} ml-auto`}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Generating post…" : "Generate post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
