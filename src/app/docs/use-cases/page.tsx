import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Use Cases | Velamini Docs",
  description: "Practical ways teams use Velamini for support, onboarding, and internal productivity.",
};

export default function DocsUseCasesPage() {
  return (
    <InfoPage
      eyebrow="Documentation"
      title="Use Cases"
      description="Common implementation patterns used by teams on Velamini."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "Customer support",
          paragraphs: [
            "Deflect repetitive support tickets and provide instant answers for common customer questions.",
            "Escalate unresolved conversations to human agents with preserved context.",
          ],
        },
        {
          title: "Sales and onboarding",
          paragraphs: [
            "Guide prospects to the right plan and answer product questions in real time.",
            "Automate onboarding checklists and setup instructions for new accounts.",
          ],
        },
        {
          title: "Internal knowledge",
          paragraphs: [
            "Give teams a searchable assistant for policy, process, and operations questions.",
            "Reduce back-and-forth in internal channels with standardized answers.",
          ],
        },
      ]}
      primaryCta={{ label: "Explore Templates", href: "/docs/templates" }}
    />
  );
}
