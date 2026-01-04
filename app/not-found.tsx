import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoHome, IoSearch, IoAlertCircle } from "react-icons/io5";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-20 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Holographic 404 card */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative inline-block p-8 rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-500/20">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <h1 className="font-display text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-300 mb-0 font-mono">404</h1>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 rounded-2xl" />
          </div>
        </div>

        {/* Icon with holographic effect */}
        <div className="mx-auto w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <IoAlertCircle className="h-12 w-12 text-cyan-400" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/5 to-transparent" />
          </div>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-cyan-100">
          Page not found
        </h2>
        <p className="text-lg text-cyan-400/70 mb-10 max-w-md mx-auto font-mono">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 border border-cyan-400/50 transition-all hover:scale-105"
            >
              <IoHome className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/#faq">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-cyan-500/30 bg-slate-900/50 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 hover:border-cyan-500/50 backdrop-blur-sm transition-all"
            >
              <IoSearch className="h-4 w-4" />
              View FAQ
            </Button>
          </Link>
        </div>

        {/* Bottom decorative line */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>
    </div>
  );
}
