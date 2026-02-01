"use client";

import Link from "next/link";
import { OpportunIQLogo } from "./OpportunIQLogo";
import {
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoGithub,
} from "react-icons/io5";

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com", icon: IoLogoTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: IoLogoLinkedin },
  { label: "GitHub", href: "https://github.com", icon: IoLogoGithub },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-neutral-950 border-t border-neutral-800">
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Top row: Brand + Social */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6">
          {/* Brand */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <OpportunIQLogo className="h-7 w-7 text-teal-500 transition-all duration-300 group-hover:text-teal-400" />
              <span className="font-bold text-base text-white transition-colors group-hover:text-teal-400">
                OpportunIQ
              </span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs">
              Make smarter decisions about repairs and maintenance.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row: Copyright + Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} OpportunIQ. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/help-center"
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
