/** One file attached to an outbound email / WhatsApp message. `data` is base64. */
export interface Attachment {
  filename: string;
  contentType: string;
  data: string;
  size: number;
}

export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB per file (serverless body limits)

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.slice(s.indexOf(",") + 1)); // strip the data:…;base64, prefix
    };
    r.onerror = () => reject(r.error ?? new Error("Couldn't read file"));
    r.readAsDataURL(file);
  });
}

/** Read a FileList into Attachment objects, enforcing count + size limits. */
export async function filesToAttachments(files: FileList | File[] | null | undefined): Promise<{ attachments: Attachment[]; errors: string[] }> {
  const list = Array.from(files ?? []);
  const attachments: Attachment[] = [];
  const errors: string[] = [];
  if (list.length > MAX_ATTACHMENTS) {
    errors.push(`You can attach up to ${MAX_ATTACHMENTS} files at once.`);
  }
  for (const f of list.slice(0, MAX_ATTACHMENTS)) {
    if (f.size > MAX_ATTACHMENT_BYTES) {
      errors.push(`“${f.name}” is over the 2 MB limit and was skipped.`);
      continue;
    }
    try {
      const data = await fileToBase64(f);
      attachments.push({
        filename: f.name,
        contentType: f.type || "application/octet-stream",
        data,
        size: f.size,
      });
    } catch {
      errors.push(`“${f.name}” couldn't be read and was skipped.`);
    }
  }
  return { attachments, errors };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Replace {name}, {company}, {city} placeholders with a lead's values so a
 * manually written broadcast still reads as personalized per recipient.
 */
export function personalize(text: string, lead: { name: string; company?: string | null; city?: string | null }): string {
  return text
    .replace(/\{name\}/gi, lead.name.trim() || "there")
    .replace(/\{company\}/gi, (lead.company ?? "").trim() || "your company")
    .replace(/\{city\}/gi, (lead.city ?? "").trim() || "");
}

/** A stored attachment row (everything except the client-side size field). */
export type StoredAttachment = Pick<Attachment, "filename" | "contentType" | "data">;

/** Parse the backend's stored JSON attachments column into an array. */
export function parseStoredAttachments(raw: string | null | undefined): StoredAttachment[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
