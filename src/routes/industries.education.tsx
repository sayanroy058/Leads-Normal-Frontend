import { createFileRoute } from "@tanstack/react-router";
import Education from "@/site/components/Education";

export const Route = createFileRoute("/industries/education")({
  head: () => ({ meta: [{ title: "Education — GradLeadAI" }] }),
  component: Education,
});
