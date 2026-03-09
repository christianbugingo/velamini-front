import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Embed Guide | Velamini Docs",
  description: "How to add a Velamini AI agent to your website with the embed widget.",
};

export default function DocsEmbedPage() {
  return (
    <InfoPage
      eyebrow="Documentation"
      title="Embed Guide"
      description="Add an AI assistant to your site with lightweight script-based integration."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "Quick setup",
          paragraphs: [
            "Create an agent, copy your embed script, and paste it before the closing body tag.",
            "Deploy and verify widget behavior on desktop and mobile pages.",
          ],
        },
        {
          title: "Styling and behavior",
          paragraphs: [
            "Configure colors, launcher position, and greeting text to match your brand.",
            "Use clear fallback messaging when the agent is unavailable.",
          ],
        },
        {
          title: "Production tips",
          paragraphs: [
            "Load the script once per page and avoid conflicting duplicate initializations.",
            "Monitor usage and feedback to improve prompt quality over time.",
          ],
        },
      ]}
      primaryCta={{ label: "Back to Docs", href: "/docs" }}
    />
  );
}
