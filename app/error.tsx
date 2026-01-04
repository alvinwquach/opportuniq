"use client";

import { useEffect } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Holographic error icon */}
        <div className="mx-auto w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
            <IoAlertCircle className="h-12 w-12 text-red-400" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400/5 to-transparent" />
          </div>
        </div>

        {/* Main error card */}
        <div className="relative p-8 md:p-12 rounded-3xl border-2 border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-500/20 mb-6">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyan-500/5 rounded-3xl" />

          <div className="relative">
            {/* Error message */}
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Something went wrong
            </h2>
            <p className="text-lg text-cyan-100/70 mb-2">
              We encountered an unexpected error. Please try again.
            </p>
            {error.digest && (
              <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-inner shadow-red-500/10">
                <p className="text-sm text-red-300 font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={reset}
            size="lg"
            className="gap-2 h-12 px-6 font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all hover:scale-105 rounded-xl"
          >
            <IoRefresh className="h-4 w-4" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 h-12 px-6 border-cyan-500/30 bg-slate-900/50 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 hover:border-cyan-500/50 backdrop-blur-sm transition-all rounded-xl"
          >
            <a href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </a>
          </Button>
        </div>

        {/* Support hint */}
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mb-4" />
          <p className="text-sm text-cyan-100/60">
            If this error persists, please{" "}
            <a
              href="mailto:support@opportuniq.com"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
