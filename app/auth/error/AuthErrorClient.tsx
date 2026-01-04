"use client";

import { Button } from "@/components/ui/button";
import { IoAlertCircle, IoHome, IoReload } from "react-icons/io5";
import Link from "next/link";

interface AuthErrorClientProps {
  error?: string | null;
  errorDescription?: string | null;
}

export function AuthErrorClient({ error, errorDescription }: AuthErrorClientProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Holographic error icon */}
        <div className="mx-auto w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
            <IoAlertCircle className="h-12 w-12 text-red-400" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400/5 to-transparent" />
          </div>
        </div>

        {/* Main error card */}
        <div className="relative p-6 rounded-2xl border-2 border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-500/20 mb-6">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyan-500/5 rounded-2xl" />

          <div className="relative">
            <h1 className="font-display text-3xl font-bold mb-4 text-cyan-100">
              Authentication Error
            </h1>
            <p className="text-cyan-400/70 mb-4 font-mono">
              We couldn&apos;t sign you in. Please try again.
            </p>

            {error && (
              <div className="my-6 p-4 rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 text-sm text-left shadow-inner shadow-red-500/10">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-400/5 to-transparent" />
                <p className="font-semibold mb-1 text-red-300 font-mono">Error: {error}</p>
                {errorDescription && (
                  <p className="text-red-400/70 font-mono text-xs">{errorDescription}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <Link href="/auth/login" className="block">
            <Button
              className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 border border-cyan-400/50 transition-all hover:scale-105"
            >
              <IoReload className="h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full gap-2 border-cyan-500/30 bg-slate-900/50 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 hover:border-cyan-500/50 backdrop-blur-sm transition-all"
            >
              <IoHome className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mb-4" />
          <p className="text-xs text-cyan-400/60 font-mono">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
