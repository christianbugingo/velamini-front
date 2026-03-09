import { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://velamini.com"),
  title: {
    default: "Velamini",
    template: "%s | Velamini",
  },
  description:
    "Velamini helps African businesses launch AI agents for customer support, sales, and operations.",
  applicationName: "Velamini",
  keywords: [
    "AI agent",
    "AI customer support",
    "African business AI",
    "chatbot for business",
    "Rwanda AI",
    "Kenya AI",
    "Nigeria AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Velamini",
    locale: "en_US",
    url: "https://velamini.com",
    title: "Velamini",
    description:
      "Velamini helps African businesses launch AI agents for customer support, sales, and operations.",
    images: [
      {
        url: "/velamini.png",
        width: 1200,
        height: 630,
        alt: "Velamini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velamini",
    description:
      "Velamini helps African businesses launch AI agents for customer support, sales, and operations.",
    images: ["/velamini.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (!theme || theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      </head>
      <body className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

