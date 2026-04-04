"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IoMenu, IoClose } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { OpportunIQLogo } from "./OpportunIQLogo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || mobileMenuOpen
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-white/80 backdrop-blur-xl border-b border-gray-100"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <OpportunIQLogo className="h-7 w-7 text-blue-600 transition-all duration-300 group-hover:text-blue-500" />
            <span className="font-bold text-base tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              OpportunIQ
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="h-9 px-4 font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center"
            >
              Get Started
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/auth/login"
              className="h-9 px-4 font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <IoClose className="h-5 w-5" /> : <IoMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-40 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col space-y-1 pt-2 border-t border-gray-200">
            
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
