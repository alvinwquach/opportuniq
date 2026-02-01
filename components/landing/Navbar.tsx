"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoMenu, IoClose, IoChevronDown } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { OpportunIQLogo } from "./OpportunIQLogo";

const productLinks = {
  diagnose: [
    { label: "Smart Diagnostics", href: "/product/smart-diagnostics", description: "AI-powered Q&A diagnosis" },
    { label: "Photo Analysis", href: "/product/photo-analysis", description: "Upload photos for instant analysis" },
    { label: "Safety & Risk", href: "/product/safety-risk", description: "Risk assessment & PPE guidance" },
  ],
  decide: [
    { label: "Opportunity Cost", href: "/product/opportunity-cost", description: "Compare DIY vs. hire vs. defer" },
    { label: "Decision Ledger", href: "/product/decision-ledger", description: "Track every repair decision" },
    { label: "Pro Finder", href: "/product/pro-finder", description: "Find trusted professionals" },
  ],
  manage: [
    { label: "Budget Tracking", href: "/product/budget", description: "Track repair spending" },
    { label: "Calendar", href: "/product/calendar", description: "Schedule maintenance tasks" },
    { label: "DIY Guides", href: "/product/guides", description: "Step-by-step repair guides" },
    { label: "Collaboration", href: "/product/collaboration", description: "Share with household members" },
  ],
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const productButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productMenuOpen &&
        productMenuRef.current &&
        productButtonRef.current &&
        !productMenuRef.current.contains(event.target as Node) &&
        !productButtonRef.current.contains(event.target as Node)
      ) {
        setProductMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productMenuOpen]);

  // Close mega menu on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setProductMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || mobileMenuOpen || productMenuOpen
          ? "bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800 shadow-lg shadow-black/20"
          : "bg-neutral-950 border-b border-neutral-800/50"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <OpportunIQLogo className="h-7 w-7 text-teal-500 transition-all duration-300 group-hover:text-teal-400" />
            <span className="font-bold text-base tracking-tight text-white group-hover:text-teal-400 transition-colors">
              OpportunIQ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Product Mega Menu Trigger */}
            <button
              ref={productButtonRef}
              onClick={() => setProductMenuOpen(!productMenuOpen)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                productMenuOpen
                  ? "text-white bg-neutral-800"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-800"
              )}
            >
              Product
              <IoChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  productMenuOpen && "rotate-180"
                )}
              />
            </button>

            <Link
              href="/help-center"
              className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Help
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="h-9 px-4 font-medium text-sm bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-all duration-200 flex items-center"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/auth/login"
              className="h-9 px-4 font-medium text-sm bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-all flex items-center"
            >
              Get Started
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setProductMenuOpen(false);
              }}
              className="h-9 w-9 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <IoClose className="h-5 w-5" />
              ) : (
                <IoMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[600px] pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col space-y-1 pt-2 border-t border-neutral-800">
            {/* Mobile Product Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Diagnose
              </p>
              {productLinks.diagnose.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="block py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Decide
              </p>
              {productLinks.decide.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="block py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Manage
              </p>
              {productLinks.manage.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="block py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-neutral-800 mx-3" />

            <Link
              href="/product"
              onClick={handleNavClick}
              className="px-3 py-2.5 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              View All Features →
            </Link>

            <Link
              href="/help-center"
              onClick={handleNavClick}
              className="px-3 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Help Center
            </Link>

            <Link
              href="/auth/login"
              onClick={handleNavClick}
              className="px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Mega Menu Dropdown */}
      <div
        ref={productMenuRef}
        className={cn(
          "hidden md:block absolute left-0 right-0 top-full overflow-hidden transition-all duration-300",
          productMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="bg-neutral-900 border-b border-neutral-800 shadow-xl shadow-black/30">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-4 gap-8">
              {/* Column 1: Diagnose */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                  Diagnose
                </h3>
                <ul className="space-y-3">
                  {productLinks.diagnose.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className="group block"
                      >
                        <span className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                          {link.label}
                        </span>
                        <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors mt-0.5">
                          {link.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Decide */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                  Decide
                </h3>
                <ul className="space-y-3">
                  {productLinks.decide.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className="group block"
                      >
                        <span className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                          {link.label}
                        </span>
                        <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors mt-0.5">
                          {link.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Manage */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                  Manage
                </h3>
                <ul className="space-y-3">
                  {productLinks.manage.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className="group block"
                      >
                        <span className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                          {link.label}
                        </span>
                        <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors mt-0.5">
                          {link.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: CTA Card */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-teal-900/40 to-neutral-900 border border-teal-500/20 p-6 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-medium mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Free to use
                  </span>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Make smarter repair decisions
                  </h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Diagnose issues, compare options, and track every decision—all in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={handleNavClick}
                    className="inline-flex items-center justify-center h-10 px-4 font-medium text-sm bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-all"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/product"
                    onClick={handleNavClick}
                    className="inline-flex items-center justify-center h-10 px-4 font-medium text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-all"
                  >
                    Explore All Features →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
