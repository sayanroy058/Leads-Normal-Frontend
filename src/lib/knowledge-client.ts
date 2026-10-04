// Knowledge Base types (one per user). The API methods live on `api` in
// src/api/client.ts; these are the shared shapes.

export interface KnowledgeBase {
  id: string;
  user_id: number;
  slug: string | null;
  title: string | null;
  tagline: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_website: string | null;
  contact_address: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface KbSection {
  id: string;
  kb_id: string;
  kind: string | null;
  title: string | null;
  body: string | null;
  position: number;
  created_at?: string;
}

export interface KbEntry {
  id: string;
  kb_id: string;
  question: string;
  answer: string;
  tags: string | null;
  position: number;
  created_at?: string;
}

export interface KbSource {
  id: string;
  type: "file" | "url";
  name: string | null;
  status: string | null;
  fetched_at: string | null;
  created_at: string;
}

export interface KbCrawlJob {
  id: string;
  source_id: string | null;
  source_url: string;
  host: string | null;
  limit_pages: number;
  max_depth: number;
  status: "queued" | "running" | "paused" | "done" | "failed" | "cancelled";
  pages_found: number;
  pages_done: number;
  error: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface KnowledgeBundle {
  kb: KnowledgeBase;
  sections: KbSection[];
  entries: KbEntry[];
  sources: KbSource[];
  crawlJobs: KbCrawlJob[];
}

export interface PublicKb {
  slug: string;
  title: string | null;
  tagline: string | null;
  description: string | null;
  contact: { email: string | null; phone: string | null; website: string | null; address: string | null };
  sections: { kind: string | null; title: string | null; body: string | null }[];
  faqs: { question: string; answer: string }[];
  published_at: string | null;
  updated_at: string | null;
}
