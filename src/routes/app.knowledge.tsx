import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, Save, Loader2, Globe, Eye, EyeOff, Sparkles, CheckCircle2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { PageHeader, btnPrimary, btnOutline, inputCls, EmptyState } from "@/components/shared";
import type { KnowledgeBase } from "@/lib/knowledge-client";

export const Route = createFileRoute("/app/knowledge")({
  component: KnowledgeBasePage,
});

interface Profile {
  title: string;
  content: string;
  slug: string;
}

function KnowledgeBasePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({ title: "", content: "", slug: "" });
  const [kbStatus, setKbStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState("");

  async function load() {
    try {
      const b = await api.getKnowledge();
      setProfile({
        title: b.kb.title ?? "",
        content: b.kb.content ?? "",
        slug: b.kb.slug ?? "",
      });
      setKbStatus(b.kb.status);
    } catch (e) {
      toast.error("Could not load your knowledge base", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const publicUrl = profile.slug ? `${window.location.origin}/kb/${profile.slug}` : "";

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await api.updateKnowledge(profile);
      setKbStatus(updated.status);
      setProfile((p) => ({ ...p, slug: updated.slug ?? p.slug }));
      toast.success("Saved");
    } catch (e) {
      toast.error("Save failed", { description: (e as Error).message });
    } finally {
      setSaving(false);
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

  async function doPreview() {
    setBusy("preview");
    try {
      const { context } = await api.previewKnowledge(profile.title);
      setPreview(context || "(nothing written yet)");
    } catch (e) {
      toast.error("Preview failed", { description: (e as Error).message });
    } finally {
      setBusy(null);
    }
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
        description="Write all your business details here in plain text — property details, prices, services, policies, areas you cover, contact info, and anything else customers should know. This powers your AI chat, emails, WhatsApp messages and voice agent — and publishes as a read-only public page."
      >
        <div className="flex items-center gap-2">
          {kbStatus === "published" && publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className={btnOutline}>
              <ExternalLink className="h-4 w-4" /> View public page
            </a>
          )}
          <button
            onClick={togglePublish}
            disabled={busy === "publish"}
            className={kbStatus === "published" ? btnOutline : btnPrimary}
          >
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

      {/* Title + slug */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Business name & public URL</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">Business name</span>
            <input
              className={inputCls}
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="Acme Realty"
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">Public URL slug</span>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">/kb/</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={profile.slug}
                onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
                placeholder="acme-realty"
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={saveProfile} disabled={saving} className={btnPrimary}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save title
          </button>
        </div>
      </section>

      {/* Free-text content */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Business & property details</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Write everything your customers should know — property types, prices, areas, services, policies, hours, contact details, FAQs, anything. The AI uses this to answer questions and draft emails, WhatsApp messages and call scripts.
        </p>
        <textarea
          className={`${inputCls} mt-3 min-h-[420px] resize-y`}
          value={profile.content}
          onChange={(e) => setProfile({ ...profile, content: e.target.value })}
          placeholder={`Example:\n\nWe are Acme Realty, a real estate agency based in Bengaluru. We specialise in residential properties across South Bengaluru.\n\nPROPERTY TYPES\n- 2 BHK apartments: ₹65L – ₹1.2Cr\n- 3 BHK apartments: ₹1Cr – ₹2Cr\n- 4 BHK independent houses: ₹2.5Cr – ₹5Cr\n- Commercial retail spaces: ₹15L – ₹50L\n\nAREAS WE COVER\n- Jayanagar, JP Nagar, Banashankari\n- Indiranagar, Koramangala, Whitefield\n- Sarjapur Road, Electronic City\n\nSERVICE AREAS\n- Sale and purchase of residential and commercial properties\n- Rental listings\n- Property management\n- Home loan assistance partners\n\nPROCESS\n1. Buyer shares requirements (budget, location, size)\n2. We shortlist 3-5 properties within 24 hours\n3. Site visits arranged at buyer convenience\n4. Legal verification done before deal closure\n\nPOLICIES\n- No brokerage for seller-listed properties\n- 1% facilitation fee on brokered deals\n- 30-day refund if legal verification fails\n\nCONTACT\n- Email: hello@acmerealty.com\n- Phone: +91 98765 43210\n- Office: 123 100ft Road, Jayanagar 4th Block, Bengaluru 560011\n- Hours: Mon-Sat 10AM-7PM\n\nFAQ\nQ: How long does site visit take?\nA: 30-45 minutes per property, we can show up to 5 in a day.\nQ: Is registration included?\nA: Registration is handled by our partner lawyer, buyer pays stamp duty and registration charges only.`}
        />
        <div className="mt-4 flex items-center gap-2">
          <button onClick={saveProfile} disabled={saving} className={btnPrimary}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details
          </button>
          <span className="text-xs text-muted-foreground">{profile.content.length} characters</span>
        </div>
      </section>

      {/* Preview */}
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
        {preview && (
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
            {preview}
          </pre>
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Looking for how the AI uses this? It grounds your{" "}
        <a href="/app/chat" className="text-primary hover:underline">AI Chat</a>, email drafts, WhatsApp messages and the voice agent.
      </p>
    </div>
  );
}
