import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Security | Velamini",
  description: "Security practices and safeguards used across the Velamini platform.",
};

export default function SecurityPage() {
  return (
    <InfoPage
      eyebrow="Trust"
      title="Security"
      description="Security is built into how we ship, monitor, and operate Velamini."
      updatedAt="March 9, 2026"
      sections={[
        {
          title: "Data protection",
          paragraphs: [
            "Transport is protected with HTTPS/TLS and sensitive credentials are stored securely.",
            "Access to production systems is limited to authorized personnel and audited workflows.",
          ],
        },
        {
          title: "Operational security",
          paragraphs: [
            "We apply regular dependency and infrastructure updates to reduce known vulnerabilities.",
            "Logging and monitoring are used to detect abnormal activity and service issues early.",
          ],
        },
        {
          title: "Responsible disclosure",
          paragraphs: [
            "If you discover a security issue, contact us at support@velamini.com with reproduction details.",
            "Please avoid public disclosure until we investigate and apply a fix.",
          ],
        },
      ]}
      primaryCta={{ label: "Contact Security Team", href: "/contact" }}
    />
  );
}
