"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoAlertCircle, IoHome, IoRefresh } from "react-icons/io5";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-6">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <IoAlertCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Error message */}
        <h2 className="text-2xl font-semibold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-[#888888] mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        {error.digest && (
          <div className="mb-6 p-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
            <p className="text-xs text-[#888888] font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-[#5eead4] hover:bg-[#5eead4]/90 text-black font-medium"
          >
            <IoRefresh className="h-4 w-4" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-[#2a2a2a] bg-transparent hover:bg-[#1a1a1a] text-white"
          >
            <Link href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Support hint */}
        <p className="mt-8 text-sm text-[#888888]">
          If this error persists, please{" "}
          <a
            href="mailto:support@opportuniq.app"
            className="text-[#5eead4] hover:underline"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
