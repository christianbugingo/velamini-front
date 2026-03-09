import type { Metadata } from "next";
import CareersPage from "../career/page";

export const metadata: Metadata = {
  title: "Careers | Velamini",
  description: "Hiring updates and opportunities at Velamini.",
  alternates: {
    canonical: "/careers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default CareersPage;
