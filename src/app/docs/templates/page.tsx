import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Agent Templates | Velamini Docs",
  description: "Starter template ideas for support, sales, and operations AI agents.",
};

export default function DocsTemplatesPage() {
  return (
    <InfoPage
      eyebrow="Documentation"
      title="Agent Templates"
      description="Template starting points you can adapt to your business context."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "Support template",
          paragraphs: [
            "Designed for handling FAQs, account help, and order-status style questions.",
            "Pair with a clear escalation policy for complex or sensitive requests.",
          ],
        },
        {
          title: "Sales template",
          paragraphs: [
            "Focuses on qualification, plan guidance, and objection handling.",
            "Use strong guardrails to avoid unsupported pricing or policy claims.",
          ],
        },
        {
          title: "Operations template",
          paragraphs: [
            "Useful for internal SOP guidance, task checklists, and team onboarding flows.",
            "Keep source knowledge current and review responses regularly with domain owners.",
          ],
        },
      ]}
      primaryCta={{ label: "View Use Cases", href: "/docs/use-cases" }}
    />
  );
}
