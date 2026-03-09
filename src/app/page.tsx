import type { Metadata } from "next";
import HomeClientPage from "./page.client";

const siteUrl = "https://velamini.com";

export const metadata: Metadata = {
  title: "AI Agents For African Businesses | Velamini",
  description:
    "Launch AI customer and support agents in minutes. Built for African businesses with fast setup, embed widgets, APIs, and analytics.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Agents For African Businesses | Velamini",
    description:
      "Launch AI customer and support agents in minutes. Built for African businesses with fast setup, embed widgets, APIs, and analytics.",
    url: siteUrl,
    siteName: "Velamini",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/velamini.png`,
        width: 1200,
        height: 630,
        alt: "Velamini AI platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agents For African Businesses | Velamini",
    description:
      "Launch AI customer and support agents in minutes. Built for African businesses with fast setup, embed widgets, APIs, and analytics.",
    images: [`${siteUrl}/velamini.png`],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Velamini",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@velamini.com",
      areaServed: "Africa",
      availableLanguage: ["English"],
    },
  ],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Velamini",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/blog?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <HomeClientPage />
    </>
  );
}
