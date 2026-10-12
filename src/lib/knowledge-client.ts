// Knowledge Base types (one per user). The API methods live on `api` in
// src/api/client.ts; these are the shared shapes.

export interface KnowledgeBase {
  id: string;
  user_id: number;
  slug: string | null;
  title: string | null;
  content: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface KnowledgeBundle {
  kb: KnowledgeBase;
}

export interface PublicKb {
  slug: string;
  title: string | null;
  content: string | null;
  published_at: string | null;
  updated_at: string | null;
}
