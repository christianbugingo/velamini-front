import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Cookie Policy | Velamini",
  description: "How Velamini uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookie Policy"
      description="This page explains how cookies are used to improve your Velamini experience."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "What cookies are",
          paragraphs: [
            "Cookies are small text files stored on your device to remember preferences and improve website behavior.",
            "We use both session cookies and persistent cookies depending on the feature.",
          ],
        },
        {
          title: "How we use cookies",
          paragraphs: [
            "Essential cookies keep authentication, routing, and security features working correctly.",
            "Performance cookies help us understand usage patterns so we can improve speed and usability.",
          ],
        },
        {
          title: "Your controls",
          paragraphs: [
            "You can manage or delete cookies in your browser settings at any time.",
            "Disabling essential cookies may affect login and core functionality.",
          ],
        },
      ]}
      primaryCta={{ label: "Read Privacy Policy", href: "/privacy" }}
    />
  );
}
