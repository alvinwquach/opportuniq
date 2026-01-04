"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  {
    value: "73%",
    label: "of home repairs",
    description: "could be DIY with proper guidance",
  },
  {
    value: "4.2hrs",
    label: "average research time",
    description: "before making a repair decision",
  },
  {
    value: "$340",
    label: "average cost",
    description: "of a wrong decision or failed DIY",
  },
  {
    value: "1 in 4",
    label: "DIY projects",
    description: "get abandoned mid-way through",
  },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll(".stat-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 bg-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950/20 to-black" />
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card p-5 rounded-xl bg-neutral-900/30 border border-neutral-800/50 text-center"
            >
              <div className="text-2xl sm:text-3xl font-semibold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-300 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-neutral-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Based on industry research and user surveys. Individual results vary.
        </p>
      </div>
    </section>
  );
}
