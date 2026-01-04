"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function DecisionLedger() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".ledger-content", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".ledger-example", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-black"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="ledger-content grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              The Decision Hub
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed">
              Every decision logged. Search past issues. Spot patterns.
            </p>
          </div>
          <div className="ledger-example">
            <div
              className="p-5 rounded-xl bg-black/60 border"
              style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white font-medium">Dishwasher not draining</span>
                <span
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ backgroundColor: 'rgba(0, 255, 136, 0.15)', color: '#00FF88' }}
                >
                  Resolved
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Decision</span>
                  <span className="text-neutral-300">DIY drain clean</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Time spent</span>
                  <span className="text-neutral-300">25 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cost</span>
                  <span style={{ color: '#00FF88' }}>$0</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-neutral-600 mt-4">
              Next time it happens, you'll know exactly what you did.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
