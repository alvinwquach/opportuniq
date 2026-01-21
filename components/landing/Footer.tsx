"use client";

import Link from "next/link";
import { OpportunIQLogo } from "./OpportunIQLogo";

const footerSections = [
  {
    title: "Features",
    links: [
      { label: "Safety & Risk", href: "/product/safety-risk" },
      { label: "Opportunity Cost", href: "/product/opportunity-cost" },
      { label: "Decision Ledger", href: "/product/decision-ledger" },
      { label: "Collaboration", href: "/product/collaboration" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Case Studies", href: "/case-studies" },
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
    <footer className="relative overflow-hidden bg-neutral-50 border-t border-neutral-200">
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 pb-12 border-b border-neutral-200">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group mb-6">
              <OpportunIQLogo className="h-10 w-10 text-teal-700 transition-all duration-300 group-hover:text-teal-600" />
              <span className="font-bold text-xl text-neutral-900 group-hover:text-teal-700 transition-colors">
                OpportunIQ
              </span>
            </Link>
            <p className="text-neutral-600 text-sm mb-6 max-w-sm leading-relaxed">
              Your research assistant for home repairs. Find parts, compare prices, and locate pros near you.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-4">
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
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-neutral-300 group-hover:bg-teal-500 transition-colors" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-neutral-300 group-hover:bg-teal-500 transition-colors" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} OpportunIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
