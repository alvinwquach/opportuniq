"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        {/* Error illustration */}
        <div className="mx-auto max-w-xs mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="w-full h-auto"
          >
            {/* Alert triangle */}
            <path
              d="M 100 30 L 170 160 L 30 160 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-destructive"
            />

            {/* Exclamation mark */}
            <line x1="100" y1="80" x2="100" y2="120" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-destructive" />
            <circle cx="100" cy="140" r="4" className="fill-destructive" />
          </svg>
        </div>

        {/* Error message */}
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Something went wrong
        </h2>
        <p className="text-lg text-muted-foreground mb-2">
          We encountered an unexpected error. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href="/">
              <Home className="h-4 w-4" />
              Back to home
            </a>
          </Button>
        </div>

        {/* Support hint */}
        <p className="text-sm text-muted-foreground mb-16">
          If this error persists, please{" "}
          <a href="mailto:support@opportuniq.com" className="text-primary hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
