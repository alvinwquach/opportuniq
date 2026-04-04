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
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <IoAlertCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Error message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        {error.digest && (
          <div className="mb-6 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <IoRefresh className="h-4 w-4" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            <Link href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Support hint */}
        <p className="mt-8 text-sm text-gray-500">
          If this error persists, please{" "}
          <a
            href="mailto:support@opportuniq.app"
            className="text-blue-600 hover:underline"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
