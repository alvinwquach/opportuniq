"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoShield, IoPeople, IoTime, IoCheckmarkCircle } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TRUST_POINTS = [
  {
    icon: IoShield,
    title: "Safety First",
    description: "Every project shows risk level, required PPE, and when to call a pro instead.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: IoPeople,
    title: "Solo or Shared",
    description: "Use it alone or invite household members. Everyone stays on the same page.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: IoTime,
    title: "Real Time Estimates",
    description: "Accurate time estimates based on your skill level, not expert benchmarks.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: IoCheckmarkCircle,
    title: "No Hidden Costs",
    description: "See material costs, tool requirements, and potential complications upfront.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

export function TrustCluster() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!itemsRef.current || !mounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const items = itemsRef.current.querySelectorAll('.trust-item');

    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-black"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
            Built for Real Life
          </h2>
          <p className="text-neutral-400 text-base max-w-md mx-auto">
            Not just another app. A decision partner that respects your time, safety, and budget.
          </p>
        </div>
        <div ref={itemsRef} className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.title}
              className="trust-item group p-5 sm:p-6 rounded-xl bg-neutral-950/50 border border-neutral-800/50
                         hover:border-neutral-700/50 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${point.bgColor} flex items-center justify-center shrink-0`}>
                  <point.icon className={`w-5 h-5 ${point.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">{point.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{point.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-neutral-500 text-sm">
            Join <span className="text-white font-medium">2,400+</span> homeowners making smarter decisions
          </p>
        </div>
      </div>
    </section>
  );
}
