import { createFileRoute } from "@tanstack/react-router";
import Home from "@/site/Home";

// Catch-all for the marketing-site deep links that don't have dedicated pages
// yet (features/*, solutions/*, how-it-works/*, integrations/*, privacy, terms,
// cookies). They render the landing home instead of a 404, and the nav/footer
// "Get Started" links still route to /auth.
export const Route = createFileRoute("/$")({
  head: () => ({ meta: [{ title: "GradLeadAI — AI-Powered Lead Management" }] }),
  component: Home,
});
