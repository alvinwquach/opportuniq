"use client";

import { Navbar, Footer } from "@/components/landing";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        mode === "dark" ? "bg-[#111111]" : "bg-white"
      )}
    >
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
