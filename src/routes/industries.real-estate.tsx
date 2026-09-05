import { createFileRoute } from "@tanstack/react-router";
import RealEstate from "@/site/components/RealEstate";

export const Route = createFileRoute("/industries/real-estate")({
  head: () => ({ meta: [{ title: "Real Estate — GradLeadAI" }] }),
  component: RealEstate,
});
