"use client";

import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative py-32 sm:py-40 overflow-hidden bg-gray-900">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          Stop guessing. Start fixing.
        </h2>

        <div className="space-y-8">
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Is it safe? Can I do it myself? Is it urgent? Can I defer — and if so, what do I watch for? What PPE do I need? What should it cost?
          </p>

          <div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl"
            >
              Start Diagnosing — Free
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Free to start · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
