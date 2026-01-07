"use client";

import Link from "next/link";
import { IoLogoGithub, IoLogoTwitter, IoLogoLinkedin, IoMail } from "react-icons/io5";
import { OpportunIQLogo } from "./OpportunIQLogo";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/product" },
      { label: "Analytics", href: "/product/analytics" },
      { label: "Insights", href: "/product/insights" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Decision Frames", href: "/product/decision-frames" },
      { label: "Safety & Risk", href: "/product/safety-risk" },
      { label: "Opportunity Cost", href: "/product/opportunity-cost" },
      { label: "Budget & Expenses", href: "/product/budget-tracking" },
      { label: "Solo or Shared", href: "/product/collaboration" },
      { label: "Decision Ledger", href: "/product/decision-ledger" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Contact", href: "mailto:support@opportuniq.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#111111" }}>
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(13,148,136,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 pb-12 border-b border-neutral-800">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group mb-6">
              <OpportunIQLogo className="h-10 w-10 text-teal-500 transition-all duration-300 group-hover:text-teal-400" />
              <span className="font-bold text-xl text-white group-hover:text-teal-400 transition-colors">
                OpportuniQ
              </span>
            </Link>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm leading-relaxed">
              Decision intelligence for everyday life. Analyze risk, safety, and budget to make smarter choices without second-guessing.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") || link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-neutral-700 group-hover:bg-teal-500 transition-colors" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-neutral-700 group-hover:bg-teal-500 transition-colors" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} OpportuniQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              v0.1.0
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Beta
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
