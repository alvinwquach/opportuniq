"use client";

import Link from "next/link";
import { OpportunIQLogo } from "./OpportunIQLogo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-50 border-t border-gray-100">
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Top row: Brand */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <OpportunIQLogo className="h-7 w-7 text-blue-600 transition-all duration-300 group-hover:text-blue-500" />
              <span className="font-bold text-base text-gray-900 transition-colors group-hover:text-blue-600">
                OpportunIQ
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Make smarter decisions about repairs and maintenance.
            </p>
          </div>
        </div>

        {/* Bottom row: Copyright + Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} OpportunIQ. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/help-center"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
