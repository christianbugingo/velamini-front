import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Velamini's mission to build practical AI infrastructure for African businesses.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Velamini",
    description:
      "Learn about Velamini's mission to build practical AI infrastructure for African businesses.",
    url: "/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
