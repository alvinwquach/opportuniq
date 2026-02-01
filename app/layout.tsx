/**
 * Root layout. Wraps all routes with fonts, global styles, and providers.
 * Metadata here is the default for the app; segment layouts and pages override
 * with export const metadata or generateMetadata.
 */
import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Amplitude } from "@/amplitude";
import { getStructuredData } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpportunIQ - Every Decision Made Simple. For Everyone.",
  description: "Expert guidance for every home and auto decision. Know if it's safe, risky, or urgent. Compare costs, find pros, track projects with family. Photo diagnosis, risk analysis, budget planning—in any language. 100+ languages.",
  keywords: [
    "multilingual repair help",
    "photo diagnosis",
    "smart repair decisions",
    "DIY vs professional comparison",
    "home repair assistant",
    "budget tracking",
    "risk analysis",
    "vendor discovery",
    "family collaboration",
    "household decisions",
    "multilingual support",
    "Vietnamese repair help",
    "Spanish repair help",
    "Chinese repair help",
    "auto repair decisions",
    "appliance repair guide",
    "cost comparison tool",
    "local contractor finder"
  ],
  authors: [{ name: "OpportunIQ" }],
  creator: "OpportunIQ",
  publisher: "OpportunIQ",
  metadataBase: new URL("https://opportuniq.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OpportunIQ - Every Decision Made Simple. For Everyone.",
    description: "Expert guidance for every home and auto decision. Know if it's safe, risky, or urgent. Compare costs, find pros, track with family—in any language.",
    url: "https://opportuniq.app",
    siteName: "OpportunIQ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpportunIQ - Smart Decisions in Any Language",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpportunIQ - Every Decision Made Simple. For Everyone.",
    description: "Expert guidance for every home and auto decision. Know if it's safe, risky, or urgent. Compare costs, find pros—in any language.",
    images: ["/og-image.png"],
    creator: "@opportuniq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = getStructuredData();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <Amplitude />
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
