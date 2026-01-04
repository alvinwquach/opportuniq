"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoCamera, IoChatbox, IoCheckmarkCircle, IoTime, IoCash, IoShield } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


export function StaticDemoIllustration() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contentRef.current || !mounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stagger in the three steps
      gsap.from(".demo-step", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
      });

      // Fade in the result card
      gsap.from(".demo-result", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-black overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6 max-w-5xl relative">
        <div ref={contentRef}>
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight">
              See It in Action
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-lg mx-auto">
              From photo to decision in seconds. Here&apos;s how it works.
            </p>
          </div>

          {/* Three-step visual flow */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Step 1: Capture */}
            <div className="demo-step">
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <IoCamera className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Capture</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Snap a photo of the issue. Our AI identifies the problem instantly.
                </p>
                {/* Mini illustration */}
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
                  <div className="aspect-video bg-neutral-700/30 rounded flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-dashed border-neutral-600 rounded-lg flex items-center justify-center">
                      <IoCamera className="w-6 h-6 text-neutral-500" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 text-center">Ceiling crack detected</p>
                </div>
              </div>
            </div>

            {/* Step 2: Describe */}
            <div className="demo-step">
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <IoChatbox className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Describe</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Add context with voice or text. Works in 100+ languages.
                </p>
                {/* Mini illustration */}
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-neutral-400">Recording...</span>
                  </div>
                  <p className="text-xs text-neutral-300 italic">
                    &ldquo;Appeared after heavy rain last week...&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Decide */}
            <div className="demo-step">
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <IoCheckmarkCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Decide</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Get a clear recommendation with costs, time, and risks.
                </p>
                {/* Mini illustration */}
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">DIY Recommended</span>
                  </div>
                  <p className="text-xs text-neutral-400">Save ~$200 · 30 min · Low risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Result showcase - Static illustration of what you get */}
          <div className="demo-result">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl border border-neutral-800 p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Example Result
                </span>
              </div>

              {/* Mock result card */}
              <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/20 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">DIY Recommended</h4>
                    <p className="text-sm text-neutral-400">Hairline settling crack — cosmetic only</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-neutral-800/30">
                    <IoCash className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">~$200</p>
                    <p className="text-xs text-neutral-500">Savings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-neutral-800/30">
                    <IoTime className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">30 min</p>
                    <p className="text-xs text-neutral-500">Time</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-neutral-800/30">
                    <IoShield className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-white">Low</p>
                    <p className="text-xs text-neutral-500">Risk</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-neutral-400">
                    A pro would charge <span className="text-neutral-300 line-through">$150-$300</span>
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-neutral-600 text-center mt-6">
                Illustrative example. Actual recommendations are personalized to your situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
