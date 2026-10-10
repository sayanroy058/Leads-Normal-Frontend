import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  KeyRound, Plus, Trash2, Copy, Check, X, Loader2, ShieldCheck, Ban, Code2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { api, type ApiKey, type ApiKeyCreated } from "@/api/client";
import {
  PageHeader, EmptyState, Pill, TableSkeleton, timeAgo, btnPrimary, btnOutline, inputCls,
} from "@/components/shared";

export const Route = createFileRoute("/app/api-keys")({
  head: () => ({ meta: [{ title: "API keys — GradLeadAI" }] }),
  component: ApiKeysPage,
});

const CURL_EXAMPLE = `curl -X POST https://<your-backend>/api/v1/leads/<lead-id>/requirements \\
  -H "X-API-Key: gld_..." -H "Content-Type: application/json" \\
  -d '{"label":"Property","value":"2 BHK Flat in Newtown, Kolkata"}'`;

function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setKeys(await api.getApiKeys());
    } catch (err) {
      toast.error("Couldn't load API keys", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function copy(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard unavailable */ }
  }

  async function revoke(k: ApiKey) {
    if (!confirm(`Revoke API key "${k.name ?? k.prefix ?? k.id}"? Anything using it will stop working immediately.`)) return;
    try {
      await api.revokeApiKey(k.id);
      toast.success("Key revoked");
      load();
    } catch (err) {
      toast.error("Revoke failed", { description: (err as Error).message });
    }
  }

  const active = keys.filter((k) => !k.revoked_at);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API keys"
        description="Keys let external systems — like your AI calling agent — read and update your leads over the REST API. Changes made through the API show up here instantly."
        badge={<Pill className="bg-brand/15 text-brand"><KeyRound className="h-3 w-3" /> API</Pill>}
      >
        <button onClick={() => setShowCreate(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> New key
        </button>
      </PageHeader>

      {/* Usage reference */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold"><Code2 className="h-4 w-4" /> Quick start</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Send the key in an <code className="rounded bg-muted px-1">X-API-Key</code> header (or{" "}
          <code className="rounded bg-muted px-1">Authorization: Bearer</code>). Base URL:{" "}
          <code className="rounded bg-muted px-1">/api/v1</code>. Full endpoint reference is in{" "}
          <code className="rounded bg-muted px-1">API.md</code>.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-muted/40 p-3 text-[11px] leading-relaxed">
          {CURL_EXAMPLE}
        </pre>
      </section>

      {/* Keys table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : keys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create a key and paste it into your AI calling agent so it can update leads automatically."
          >
            <button onClick={() => setShowCreate(true)} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Create key
            </button>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last used</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{k.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{k.prefix ?? "gld_…"}</code>
                    </td>
                    <td className="px-4 py-3">
                      {k.revoked_at ? (
                        <Pill className="bg-destructive/15 text-destructive"><Ban className="h-3 w-3" /> Revoked</Pill>
                      ) : (
                        <Pill className="bg-success/25 text-success-foreground"><ShieldCheck className="h-3 w-3" /> Active</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{k.last_used_at ? timeAgo(k.last_used_at) : "Never"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(k.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {!k.revoked_at && (
                        <button
                          onClick={() => revoke(k)}
                          title="Revoke"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && keys.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {active.length} active key{active.length === 1 ? "" : "s"} · {keys.length} total
          </div>
        )}
      </div>

      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={(k) => { setCreated(k); load(); }}
        />
      )}

      {created && (
        <RevealKeyModal created={created} copied={copied} onCopy={copy} onClose={() => setCreated(null)} />
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateKeyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (k: ApiKeyCreated) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const k = await api.createApiKey({ name: name.trim() || undefined });
      toast.success("API key created");
      onCreated(k);
      onClose();
    } catch (err) {
      toast.error("Couldn't create key", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell title="New API key" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Name (what will use it)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Plivo calling agent"
            className={`${inputCls} mt-1`}
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={btnOutline}>Cancel</button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Create key
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RevealKeyModal({
  created, copied, onCopy, onClose,
}: {
  created: ApiKeyCreated;
  copied: string | null;
  onCopy: (text: string, tag: string) => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Copy your API key" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This is the only time the full key is shown. Store it somewhere safe — you won't be able to see it again.</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
          <code className="flex-1 break-all text-xs">{created.key}</code>
          <button
            onClick={() => onCopy(created.key, "key")}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-accent"
            aria-label="Copy key"
          >
            {copied === "key" ? <Check className="h-3.5 w-3.5 text-success-foreground" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className={btnPrimary}>Done</button>
        </div>
      </div>
    </ModalShell>
  );
}
