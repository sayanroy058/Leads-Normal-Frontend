import { createFileRoute } from "@tanstack/react-router";
import BlogsPage from "@/site/components/BlogsPage";

export const Route = createFileRoute("/blogs")({
  head: () => ({ meta: [{ title: "Blogs — GradLeadAI" }] }),
  component: BlogsPage,
});
