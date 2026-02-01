"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  animateCounter,
  typewriter,
} from "@/lib/gsap";
import {
  IoWarning,
  IoTime,
  IoCash,
  IoHelpCircle,
  IoTrendingDown,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    icon: IoCash,
    stat: "$1,200",
    label: "Average overpayment per repair",
    description:
      "Without knowing fair prices, most homeowners pay 40-60% more than they should.",
  },
  {
    icon: IoTime,
    stat: "14 hrs",
    label: "Lost researching each issue",
    description:
      "YouTube videos, Reddit threads, contractor calls. Time you could spend with family.",
  },
  {
    icon: IoHelpCircle,
    stat: "73%",
    label: "Make the wrong DIY vs hire choice",
    description:
      "Either wasting money on pros for easy fixes, or botching repairs that need experts.",
  },
  {
    icon: IoTrendingDown,
    stat: "3.2x",
    label: "Cost of delayed repairs",
    description:
      "That small leak becomes water damage. The weird noise becomes a $4,000 HVAC replacement.",
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteTextRef = useRef<HTMLSpanElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const annualLossRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Animate the annual loss counter
      ScrollTrigger.create({
        trigger: annualLossRef.current,
        start: "top 85%",
        onEnter: () => {
          if (annualLossRef.current) {
            animateCounter(annualLossRef.current, 4800, {
              duration: 1.5,
              prefix: "$",
              suffix: "/year",
            });
          }
        },
        once: true,
      });

      // Cards stagger animation with counter animations
      gsap.from(cardsRef.current?.children || [], {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.7,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 75%",
          onEnter: () => {
            // Animate each stat with counter
            statRefs.current.forEach((ref, i) => {
              if (ref) {
                const values = [1200, 14, 73, 3.2];
                const prefixes = ["$", "", "", ""];
                const suffixes = ["", " hrs", "%", "x"];
                const decimals = [0, 0, 0, 1];
                setTimeout(() => {
                  animateCounter(ref, values[i], {
                    duration: 1.2,
                    prefix: prefixes[i],
                    suffix: suffixes[i],
                    decimals: decimals[i],
                  });
                }, i * 150);
              }
            });
          },
        },
      });

      // Quote animation with typewriter for the painful part
      gsap.from(quoteRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        scrollTrigger: {
          trigger: quoteRef.current,
          start: "top 80%",
          onEnter: () => {
            if (quoteTextRef.current) {
              setTimeout(() => {
                typewriter(
                  quoteTextRef.current!,
                  "I wasted $200 and 30 hours of my life.",
                  { duration: 1.5, cursor: false }
                );
              }, 800);
            }
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-[#0a0a0a]"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <IoWarning className="w-4 h-4" />
            <span>The Hidden Cost of Home Ownership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Home repairs are costing you
            <br />
            <span className="text-red-400">more than you think</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            The average American homeowner loses{" "}
            <span ref={annualLossRef} className="text-red-400 font-semibold">$0/year</span>{" "}
            to overpriced repairs, wrong decisions, and delayed maintenance. Here&apos;s why.
          </p>
        </div>

        {/* Pain point cards */}
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 hover:border-red-500/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <point.icon className="w-6 h-6 text-red-400" />
              </div>
              <div
                ref={(el) => { statRefs.current[i] = el; }}
                className="text-3xl font-bold text-white mb-1"
              >
                0
              </div>
              <div className="text-sm font-medium text-red-400 mb-3">
                {point.label}
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Emotional quote */}
        <div
          ref={quoteRef}
          className="relative max-w-3xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl text-neutral-700">
            &ldquo;
          </div>
          <p className="text-xl sm:text-2xl text-neutral-300 italic leading-relaxed mb-6">
            I spent 3 weekends trying to fix our dishwasher. Bought $200 in
            parts. Watched 15 YouTube videos. In the end, I had to call a pro
            anyway who fixed it in 20 minutes for $150.{" "}
            <span ref={quoteTextRef} className="text-red-400">

            </span>
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-lg">
              👨
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">
                Marcus T., Denver
              </div>
              <div className="text-xs text-neutral-500">
                Before discovering OpportunIQ
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
