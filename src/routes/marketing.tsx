import { createFileRoute } from "@tanstack/react-router";
import Home from "@/site/Home";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "GradLeadAI — AI-native lead management for modern teams" },
      { name: "description", content: "Upload leads in any format. Talk to them through AI email, WhatsApp, and calling. Generate creatives in one click." },
    ],
  }),
  component: Home,
});
