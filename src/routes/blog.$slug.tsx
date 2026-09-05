import { createFileRoute } from "@tanstack/react-router";
import BlogDetails from "@/site/components/BlogDetails";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({ meta: [{ title: "Blog — GradLeadAI" }] }),
  component: BlogDetails,
});
