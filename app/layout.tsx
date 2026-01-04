import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Amplitude } from '@/amplitude';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <Amplitude />
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
