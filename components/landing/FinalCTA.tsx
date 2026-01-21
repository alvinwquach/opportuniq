"use client";

import { IoArrowForward } from "react-icons/io5";
import { WaitlistModal } from "./WaitlistModal";

export function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-teal-700">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to save time?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">
            Join the waitlist and be the first to try OpportuniQ.
          </p>
          <div suppressHydrationWarning>
            <WaitlistModal>
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-teal-700 font-semibold rounded-lg transition-colors duration-200">
                Join the Waitlist
                <IoArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </WaitlistModal>
          </div>
          <p className="mt-6 text-sm text-teal-50">
            No spam. We&apos;ll email you when it&apos;s ready.
          </p>
        </div>
      </div>
    </section>
  );
}
