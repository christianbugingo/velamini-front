import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Velamini for support, sales questions, partnerships, and onboarding help.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Velamini",
    description:
      "Contact Velamini for support, sales questions, partnerships, and onboarding help.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
