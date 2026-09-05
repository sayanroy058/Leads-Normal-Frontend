import type { ReactNode } from "react";
import { Mail, MessageCircle, X, Send, Loader2, Paperclip, FileText, Image as ImageIcon, ArrowDownLeft, ArrowUpRight, Bot, Reply, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { parseStoredAttachments, formatBytes, type StoredAttachment } from "@/lib/attachments";
import { Avatar, Pill, timeAgo, leadStatusStyles } from "@/components/shared";
import type { Lead } from "@/lib/leads-client";

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

function ReaderShell({
  title,
  icon: Icon,
  subtitle,
  meta,
  children,
  footer,
  onClose,
}: {
  title: ReactNode;
  icon: typeof Mail;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="grid max-h-[88vh] w-full max-w-2xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-base font-semibold leading-tight">{title}</div>
                {meta}
              </div>
              {subtitle && <div className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-accent" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

function dataUrl(a: StoredAttachment): string {
  return `data:${a.contentType};base64,${a.data}`;
}

function AttachmentList({ attachments }: { attachments: StoredAttachment[] }) {
  if (!attachments.length) return null;
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Paperclip className="h-3.5 w-3.5" /> Attachments ({attachments.length})
      </div>
      <div className="space-y-2">
        {attachments.map((a) => {
          const isImage = a.contentType.startsWith("image/");
          const size = Math.round((a.data.length / 4) * 3); // rough base64 → bytes
          return (
            <div key={a.filename} className="rounded-xl border border-border bg-background p-2.5">
              {isImage && (
                <img src={dataUrl(a)} alt={a.filename} className="mb-2 max-h-48 rounded-lg border border-border object-contain" />
              )}
              <a
                href={dataUrl(a)}
                download={a.filename}
                className="flex items-center gap-2 text-xs hover:text-foreground"
                title={`Download ${a.filename}`}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${isImage ? "bg-sky/20 text-sky" : "bg-muted text-muted-foreground"}`}>
                  {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{a.filename}</span>
                  <span className="text-[10px] text-muted-foreground">{a.contentType} · {formatBytes(size)} · click to download</span>
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Email reader                                                        */
/* ------------------------------------------------------------------ */

interface EmailLike {
  id: string;
  lead_id: string | null;
  subject: string;
  body: string;
  tone: string | null;
  goal: string | null;
  status: string;
  direction: "outbound" | "inbound" | null;
  from_email: string | null;
  to_email: string | null;
  attachments?: string | null;
  created_at: string;
}

const emailStatusPills: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  queued: "bg-warning/20 text-warning-foreground",
  sent: "bg-sky/40 text-foreground",
  delivered: "bg-success/25 text-success-foreground",
  opened: "bg-lilac/50 text-foreground",
  received: "bg-sky/40 text-foreground",
  failed: "bg-destructive/15 text-destructive",
};

export function EmailReader({
  email,
  lead,
  sending,
  onSend,
  onClose,
}: {
  email: EmailLike;
  lead: Lead | null | undefined;
  sending: boolean;
  onSend: () => void;
  onClose: () => void;
}) {
  const inbound = email.direction === "inbound" || email.status === "received";
  const attachments = parseStoredAttachments(email.attachments);

  return (
    <ReaderShell
      icon={Mail}
      title={email.subject || "(no subject)"}
      meta={<Pill className={emailStatusPills[inbound ? "received" : email.status]}>{inbound ? "Received" : email.status}</Pill>}
      subtitle={
        inbound
          ? `From ${email.from_email ?? "unknown"} · ${timeAgo(email.created_at)}`
          : `To ${email.to_email ?? "unknown"} · ${timeAgo(email.created_at)}`
      }
      onClose={onClose}
      footer={
        email.status === "draft" ? (
          <button onClick={onSend} disabled={sending} className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow transition disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send this email"}
          </button>
        ) : undefined
      }
    >
      {lead && (
        <Link to="/app/leads/$leadId" params={{ leadId: lead.id }} className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:bg-muted/30">
          <Avatar name={lead.name} className="h-9 w-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{lead.name}</div>
            <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span>{lead.company ?? lead.email ?? "—"}</span>
              <Pill className={leadStatusStyles[lead.status]}>{lead.status}</Pill>
            </div>
          </div>
        </Link>
      )}
      {email.tone || email.goal ? (
        <div className="mb-4 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          {email.tone && <span className="rounded-full bg-muted px-2 py-0.5 capitalize">Tone: {email.tone}</span>}
          {email.goal && <span className="rounded-full bg-muted px-2 py-0.5 capitalize">Goal: {email.goal}</span>}
        </div>
      ) : null}
      <div className="whitespace-pre-wrap break-words rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed">
        {email.body || "—"}
      </div>
      <AttachmentList attachments={attachments} />
    </ReaderShell>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp reader                                                     */
/* ------------------------------------------------------------------ */

interface WhatsappLike {
  id: string;
  lead_id: string | null;
  body: string;
  status: string;
  direction?: string | null;
  from_number?: string | null;
  to_number?: string | null;
  acknowledged_at?: string | null;
  attachments?: string | null;
  created_at: string;
}

const waStatusPills: Record<string, string> = {
  received: "bg-sky/40 text-foreground",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky/40 text-foreground",
  delivered: "bg-success/25 text-success-foreground",
  read: "bg-lilac/50 text-foreground",
  replied: "bg-success/25 text-success-foreground",
  failed: "bg-destructive/15 text-destructive",
};

export function WhatsappReader({
  msg,
  lead,
  sending,
  onSend,
  onClose,
}: {
  msg: WhatsappLike;
  lead: Lead | null | undefined;
  sending: boolean;
  onSend: () => void;
  onClose: () => void;
}) {
  const inbound = msg.direction === "inbound" || msg.status === "received";
  const attachments = parseStoredAttachments(msg.attachments);

  return (
    <ReaderShell
      icon={MessageCircle}
      title={lead?.name ?? (inbound ? msg.from_number : msg.to_number) ?? "Unknown"}
      meta={<Pill className={waStatusPills[inbound ? "received" : msg.status]}>{inbound ? "Received" : msg.status}</Pill>}
      subtitle={
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1">
            {inbound ? <ArrowDownLeft className="h-3 w-3 text-sky" /> : <ArrowUpRight className="h-3 w-3 text-muted-foreground/50" />}
            {inbound ? msg.from_number ?? "—" : msg.to_number ?? "—"}
          </span>
          <span>· {timeAgo(msg.created_at)}</span>
        </span>
      }
      onClose={onClose}
      footer={
        msg.status === "draft" ? (
          <button onClick={onSend} disabled={sending} className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow transition disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send this message"}
          </button>
        ) : undefined
      }
    >
      {lead && (
        <Link to="/app/leads/$leadId" params={{ leadId: lead.id }} className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:bg-muted/30">
          <Avatar name={lead.name} className="h-9 w-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{lead.name}</div>
            <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span className="tabular-nums">{lead.phone ?? "—"}</span>
              <Pill className={leadStatusStyles[lead.status]}>{lead.status}</Pill>
            </div>
          </div>
        </Link>
      )}
      <div className="flex justify-start">
        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${inbound ? "rounded-tl-md border border-border bg-background" : "rounded-tr-md gradient-soft"}`}>
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {inbound ? <Bot className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {inbound ? (msg.acknowledged_at ? "Auto-acked off-hours" : "Inbound") : "Outbound"}
            <span>· {timeAgo(msg.created_at)}</span>
          </div>
          <div className="whitespace-pre-wrap break-words">{msg.body || "—"}</div>
        </div>
      </div>
      {msg.status === "replied" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-success-foreground">
          <Reply className="h-3.5 w-3.5" /> The lead replied to this message.
        </div>
      )}
      <AttachmentList attachments={attachments} />
    </ReaderShell>
  );
}
