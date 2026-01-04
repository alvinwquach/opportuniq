"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function OpportunityCost() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".opp-content", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".opp-example", {
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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="opp-example order-2 md:order-1">
            <div
              className="p-5 rounded-xl bg-black/60 border"
              style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Contractor quote</span>
                  <span className="text-white">$150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">DIY time</span>
                  <span className="text-white">6h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Your hourly value</span>
                  <span className="text-white">$40/hr</span>
                </div>
                <div
                  className="border-t pt-3"
                  style={{ borderColor: 'rgba(0, 240, 255, 0.2)' }}
                >
                  <div className="flex justify-between">
                    <span className="text-neutral-400">True cost of DIY</span>
                    <span className="font-medium" style={{ color: '#FF8800' }}>$240</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opp-content order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Money and Time
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed">
              Saving $150 by doing it yourself isn't always a win. If it takes 6 hours
              and your time is worth $40/hour, you spent $240 to save $150.
            </p>
            <p className="text-sm text-neutral-600 mt-4">
              You set your time value once. Opportuniq calculates the rest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
