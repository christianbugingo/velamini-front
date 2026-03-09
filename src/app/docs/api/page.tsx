import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "API Reference | Velamini Docs",
  description: "Core API endpoints, authentication notes, and integration guidance for Velamini.",
};

export default function DocsApiPage() {
  return (
    <InfoPage
      eyebrow="Documentation"
      title="API Reference"
      description="Overview of the main Velamini API capabilities."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "Authentication",
          paragraphs: [
            "Authenticate requests with your API key using the Authorization header.",
            "Keep secrets server-side and rotate keys immediately when exposure is suspected.",
          ],
        },
        {
          title: "Core endpoints",
          paragraphs: [
            "Chat, session history, and feedback endpoints are available for agent-driven workflows.",
            "Endpoint examples and payload formats are documented in the main docs page.",
          ],
        },
        {
          title: "Rate limits and errors",
          paragraphs: [
            "Use retry logic with exponential backoff for temporary failures.",
            "Handle validation and authentication errors explicitly in your integration code.",
          ],
        },
      ]}
      primaryCta={{ label: "Open Full Docs", href: "/docs" }}
    />
  );
}
