"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IoMenu, IoChevronDown, IoBarChart, IoBulb, IoGitBranch, IoShield, IoTime, IoWallet, IoPeople, IoBook, IoHelpCircle, IoDocument } from "react-icons/io5";
import { IoStatsChart, IoLayersOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { WaitlistModal } from "./WaitlistModal";
import { OpportunIQLogo } from "./OpportunIQLogo";

const PRODUCT_SUBMENU = [
  { href: "/product", label: "Overview", icon: IoBarChart, description: "Platform overview" },
  { href: "/product/analytics", label: "Analytics", icon: IoStatsChart, description: "Data insights" },
  { href: "/product/insights", label: "Insights", icon: IoBulb, description: "Smart recommendations" },
  { href: "/product", label: "Features", icon: IoLayersOutline, description: "All capabilities" },
];

const MAIN_NAV_LINKS = [
  { href: "/product/decision-frames", label: "Decision Frames", icon: IoGitBranch },
  { href: "/product/safety-risk", label: "Safety & Risk", icon: IoShield },
  { href: "/product/opportunity-cost", label: "Opportunity Cost", icon: IoTime },
  { href: "/product/budget-tracking", label: "Budget & Expenses", icon: IoWallet },
  { href: "/product/collaboration", label: "Solo or Shared", icon: IoPeople },
  { href: "/product/decision-ledger", label: "Decision Ledger", icon: IoBook },
];

const RESOURCE_LINKS = [
  { href: "/help-center", label: "Help Center", icon: IoHelpCircle },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrolled(window.scrollY > 20);
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setProductOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
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
          <Link href="/" className="flex items-center gap-3 group">
            <OpportunIQLogo className="h-9 w-9 text-teal-500 transition-all duration-300 group-hover:text-teal-400" />
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-400 transition-colors">
              OpportuniQ
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            <div ref={productRef} className="relative">
              <button
                onClick={() => {
                  setProductOpen(!productOpen);
                  setResourcesOpen(false);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  productOpen ? "text-teal-400 bg-teal-500/10" : "text-neutral-300 hover:text-white hover:bg-white/5"
                )}
              >
                Product
                <IoChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  productOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "absolute top-full left-0 mt-2 w-64 rounded-xl bg-[#1a1a1a] border border-neutral-800 shadow-xl overflow-hidden transition-all duration-200",
                productOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              )}>
                <div className="p-2">
                  {PRODUCT_SUBMENU.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={() => setProductOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                        <link.icon className="w-4 h-4 text-teal-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                          {link.label}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {MAIN_NAV_LINKS.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div ref={resourcesRef} className="relative">
              <button
                onClick={() => {
                  setResourcesOpen(!resourcesOpen);
                  setProductOpen(false);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  resourcesOpen ? "text-teal-400 bg-teal-500/10" : "text-neutral-300 hover:text-white hover:bg-white/5"
                )}
              >
                Resources
                <IoChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  resourcesOpen && "rotate-180"
                )} />
              </button>
              <div className={cn(
                "absolute top-full right-0 mt-2 w-56 rounded-xl bg-[#1a1a1a] border border-neutral-800 shadow-xl overflow-hidden transition-all duration-200",
                resourcesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              )}>
                <div className="p-2">
                  {RESOURCE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <link.icon className="w-4 h-4 text-neutral-400 group-hover:text-teal-400 transition-colors" />
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-neutral-800 mt-2 pt-2">
                    {MAIN_NAV_LINKS.slice(4).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <link.icon className="w-4 h-4 text-neutral-400 group-hover:text-teal-400 transition-colors" />
                        <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
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
          <Sheet>
            <SheetTrigger asChild className="lg:hidden" suppressHydrationWarning>
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-neutral-800 hover:border-neutral-700 hover:bg-white/5 transition-all">
                <IoMenu className="h-5 w-5 text-neutral-300" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#111111] border-l border-neutral-800" suppressHydrationWarning>
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-3 pb-6 border-b border-neutral-800">
                  <OpportunIQLogo className="h-9 w-9 text-teal-500" />
                  <span className="font-bold text-lg text-white">OpportuniQ</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-2">Product</p>
                  {PRODUCT_SUBMENU.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-teal-500" />
                      <span className="text-sm text-neutral-200">{link.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-2">Features</p>
                  {MAIN_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-teal-500" />
                      <span className="text-sm text-neutral-200">{link.label}</span>
                    </Link>
                  ))}
                </div>
                  <div className="space-y-1 pt-4 border-t border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-2">Resources</p>
                  {RESOURCE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-200">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-6 border-t border-neutral-800 space-y-3">
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
    </>
  );
}
