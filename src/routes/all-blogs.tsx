import { createFileRoute } from "@tanstack/react-router";
import AllBlogs from "@/site/components/AllBlogs";

export const Route = createFileRoute("/all-blogs")({
  head: () => ({ meta: [{ title: "All Blogs — GradLeadAI" }] }),
  component: AllBlogs,
});
