import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Career opportunities and hiring updates from Velamini.",
  alternates: {
    canonical: "/careers",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CareerLayout({ children }: { children: ReactNode }) {
  return children;
}
