import { useRef } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { filesToAttachments, formatBytes, MAX_ATTACHMENTS, type Attachment } from "@/lib/attachments";

function FileGlyph({ name }: { name: string }) {
  const isImage = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${isImage ? "bg-sky/20 text-sky" : "bg-muted text-muted-foreground"}`}>
      {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
    </span>
  );
}

/**
 * Multi-file attachment picker. `files` is the current list (base64); onChange
 * replaces it. Files are validated (count + 2 MB each) as they're added.
 */
export function AttachmentPicker({
  files,
  onChange,
}: {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(list: FileList | null) {
    if (!list || !list.length) return;
    const { attachments, errors } = await filesToAttachments(list);
    for (const err of errors) toast.error(err);
    if (attachments.length) onChange([...files, ...attachments]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => onPick(e.target.files)}
        className="hidden"
      />
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((f) => (
            <span
              key={f.filename}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background py-1 pl-1 pr-1.5 text-xs"
            >
              <FileGlyph name={f.filename} />
              <span className="max-w-[180px] truncate font-medium">{f.filename}</span>
              <span className="text-[10px] text-muted-foreground">{formatBytes(f.size)}</span>
              <button
                onClick={() => onChange(files.filter((x) => x !== f))}
                className="grid h-5 w-5 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`Remove ${f.filename}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= MAX_ATTACHMENTS}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground disabled:opacity-50"
      >
        <Paperclip className="h-3.5 w-3.5" />
        {files.length ? `Add more (${files.length}/${MAX_ATTACHMENTS})` : "Attach files"}
      </button>
      <p className="mt-1 text-[10px] text-muted-foreground">Up to {MAX_ATTACHMENTS} files · 2 MB each</p>
    </div>
  );
}
