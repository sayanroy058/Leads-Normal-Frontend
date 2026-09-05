import { createFileRoute } from "@tanstack/react-router";
import Home from "@/site/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GradLeadAI — Turn Every Lead Into a Closed Deal" },
      {
        name: "description",
        content:
          "Capture, qualify and convert leads with AI-powered automation — so no opportunity sits in your inbox untouched.",
      },
      { property: "og:title", content: "GradLeadAI" },
      {
        property: "og:description",
        content: "AI-powered lead management that turns every lead into a closed deal.",
      },
    ],
  }),
  component: Home,
});
