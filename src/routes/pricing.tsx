import { createFileRoute } from "@tanstack/react-router";
import Pricing from "@/site/components/Pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — GradLeadAI" }] }),
  component: Pricing,
});
