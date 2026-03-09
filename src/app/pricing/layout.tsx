import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Velamini Pricing — Free AI Agent Plan Available",
  description: "Start free. No credit card. Upgrade as you grow.",
  openGraph: {
    title: "Velamini Pricing — Free AI Agent Plan Available",
    description: "Start free. No credit card. Upgrade as you grow.",
    url: "https://velamini.com/pricing",
    siteName: "Velamini",
    images: [
      {
        url: "https://velamini.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Velamini Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
