"use client";

import { IoArrowForward } from "react-icons/io5";
import { WaitlistModal } from "./WaitlistModal";

export function FinalCTA() {
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 50%, #CCFBF1 100%)",
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-medium mb-8 shadow-lg shadow-teal-500/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Early Access Available
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 tracking-tight leading-tight">
            Stop Researching.
            <br />
            <span className="text-teal-600">Start Deciding.</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-neutral-600 mb-10 max-w-xl mx-auto leading-relaxed">
            Get the framework to think through real-world decisions—analyze risk, understand safety, and make informed choices.
          </p>

          {/* CTA Button */}
          <div suppressHydrationWarning>
            <WaitlistModal>
              <button className="group inline-flex items-center gap-3 px-10 py-5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-teal-500/30 hover:shadow-teal-400/40 hover:scale-[1.02]">
                Join the Waitlist
                <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </WaitlistModal>
          </div>

          {/* Trust Text */}
          <p className="mt-8 text-sm text-neutral-500">
            No spam. We&apos;ll email you when it&apos;s ready.
          </p>

          {/* Stats Row */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-neutral-600"><strong className="text-neutral-900">2,400+</strong> on waitlist</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-neutral-600"><strong className="text-neutral-900">15+</strong> risk categories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-neutral-600"><strong className="text-neutral-900">Beta</strong> launching soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
