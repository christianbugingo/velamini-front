import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Velamini documentation for API integration, embed widgets, templates, and implementation guides.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Velamini Documentation",
    description:
      "Velamini documentation for API integration, embed widgets, templates, and implementation guides.",
    url: "/docs",
    type: "website",
  },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children;
}
