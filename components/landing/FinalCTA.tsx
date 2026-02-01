"use client";

import { IoArrowForward } from "react-icons/io5";
import { WaitlistModal } from "./WaitlistModal";

export function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-neutral-900 to-neutral-950">
      {/* Teal glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 max-w-3xl relative">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to save time?
          </h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-md mx-auto">
            Join the waitlist and be the first to try OpportuniQ.
          </p>
          <div suppressHydrationWarning>
            <WaitlistModal>
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg shadow-teal-600/20">
                Join the Waitlist
                <IoArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </WaitlistModal>
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            No spam. We&apos;ll email you when it&apos;s ready.
          </p>
        </div>
      </div>
    </section>
  );
}
