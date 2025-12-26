import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing";

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
  title: "OpportuniQ - Smart Home & Auto Repair Decision Platform",
  description: "Track expenses, manage budgets, and make informed repair decisions. Know when to DIY, when to hire, or when to wait — solo or with your group.",
  keywords: [
    "home repair decisions",
    "budget tracking",
    "DIY vs hire",
    "expense management",
    "repair cost calculator",
    "household budget",
    "group expense tracking",
    "maintenance planning",
    "auto repair decisions",
    "collaborative budgeting"
  ],
  authors: [{ name: "OpportuniQ" }],
  creator: "OpportuniQ",
  publisher: "OpportuniQ",
  metadataBase: new URL("https://opportuniq.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OpportuniQ - Smart Home & Auto Repair Decision Platform",
    description: "Track expenses, manage budgets, and make informed repair decisions. Know when to DIY, when to hire, or when to wait — solo or with your group.",
    url: "https://opportuniq.app",
    siteName: "OpportuniQ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpportuniQ - Smart Repair Decisions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpportuniQ - Smart Home & Auto Repair Decision Platform",
    description: "Track expenses, manage budgets, and make informed repair decisions. Know when to DIY, when to hire, or when to wait.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
