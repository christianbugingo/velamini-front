import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Changelog | Velamini",
  description: "Product updates, fixes, and improvements across the Velamini platform.",
};

export default function ChangelogPage() {
  return (
    <InfoPage
      eyebrow="Product Updates"
      title="Changelog"
      description="A running list of what has changed in Velamini."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "March 2026",
          paragraphs: [
            "Improved pricing and blog route stability for Next.js App Router pages.",
            "Refined public navigation and footer consistency across core marketing pages.",
          ],
        },
        {
          title: "February 2026",
          paragraphs: [
            "Expanded documentation structure with dedicated sections for API, embed, templates, and use cases.",
            "Improved metadata and social preview defaults for major public routes.",
          ],
        },
        {
          title: "January 2026",
          paragraphs: [
            "General performance and reliability fixes across dashboard and public pages.",
            "Polished onboarding and billing flows for better first-time experience.",
          ],
        },
      ]}
      primaryCta={{ label: "Read Documentation", href: "/docs" }}
    />
  );
}
