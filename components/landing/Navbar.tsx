"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IoMenu } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { WaitlistModal } from "./WaitlistModal";
import { OpportunIQLogo } from "./OpportunIQLogo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setScrolled(window.scrollY > 20);
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        mounted ? "transition-all duration-300" : "",
        scrolled
          ? "bg-[#111111]/95 backdrop-blur-xl border-b border-neutral-800"
          : "bg-[#111111] border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <OpportunIQLogo className="h-9 w-9 text-teal-500 transition-all duration-300 group-hover:text-teal-400" />
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-400 transition-colors">
            OpportuniQ
          </span>
        </Link>

        {/* Desktop: Log in + Join Waitlist */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <WaitlistModal>
            <Button className="h-10 px-5 font-semibold text-sm bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/25">
              Join Waitlist
            </Button>
          </WaitlistModal>
        </div>

        {/* Mobile: Hamburger menu */}
        <Sheet>
          <SheetTrigger asChild className="sm:hidden" suppressHydrationWarning>
            <Button variant="ghost" size="icon" className="h-10 w-10 border border-neutral-800 hover:border-neutral-700 hover:bg-white/5 transition-all">
              <IoMenu className="h-5 w-5 text-neutral-300" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-[#111111] border-l border-neutral-800" suppressHydrationWarning>
            <div className="flex flex-col h-full mt-8">
              {/* Logo in mobile menu */}
              <div className="flex items-center gap-3 pb-6 border-b border-neutral-800">
                <OpportunIQLogo className="h-9 w-9 text-teal-500" />
                <span className="font-bold text-lg text-white">OpportuniQ</span>
              </div>

              {/* Spacer to push CTA to bottom */}
              <div className="flex-1" />

              {/* CTA buttons */}
              <div className="pt-6 border-t border-neutral-800 space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 text-sm font-medium text-neutral-300 hover:text-white transition-colors border border-neutral-800 rounded-lg hover:border-neutral-700"
                >
                  Log in
                </Link>
                <WaitlistModal>
                  <Button className="w-full h-12 font-semibold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all">
                    Join Waitlist
                  </Button>
                </WaitlistModal>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
