"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  scrambleText,
  animateCounter,
} from "@/lib/gsap";
import {
  IoCheckmarkCircle,
  IoCamera,
  IoBulb,
  IoCalculator,
  IoShield,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: IoCamera,
    title: "Snap & Diagnose",
    description:
      "Take a photo. Our AI identifies the issue, explains what's wrong, and rates severity in seconds.",
  },
  {
    icon: IoBulb,
    title: "Smart Recommendation",
    description:
      "Get a personalized DIY vs. hire decision based on your skills, time value, and the repair complexity.",
  },
  {
    icon: IoCalculator,
    title: "Cost Transparency",
    description:
      "See fair price ranges, part costs, and labor estimates. Never overpay again.",
  },
  {
    icon: IoShield,
    title: "Risk Assessment",
    description:
      "Understand what could go wrong and whether it's worth the gamble for your specific situation.",
  },
];

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrambleRef = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scramble text effect for the headline accent
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: "top 80%",
        onEnter: () => {
          if (scrambleRef.current) {
            scrambleText(scrambleRef.current, "30 seconds", {
              duration: 1.2,
              chars: "0123456789",
            });
          }
        },
        once: true,
      });

      // Heading fade in
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Stats counter animation
      const statElements = statsRef.current?.querySelectorAll("[data-value]");
      statElements?.forEach((el) => {
        const value = parseFloat(el.getAttribute("data-value") || "0");
        const prefix = el.getAttribute("data-prefix") || "";
        const suffix = el.getAttribute("data-suffix") || "";
        const decimals = parseInt(el.getAttribute("data-decimals") || "0");

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: () => {
            animateCounter(el as HTMLElement, value, {
              duration: 2,
              prefix,
              suffix,
              decimals,
            });
          },
          once: true,
        });
      });

      // Cards stagger
      gsap.from(cardsRef.current?.children || [], {
        opacity: 0,
        y: 50,
        stagger: 0.12,
        duration: 0.6,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 75%",
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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <IoCheckmarkCircle className="w-4 h-4" />
            <span>The Solution</span>
          </div>
          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
          >
            From confusion to clarity in{" "}
            <span ref={scrambleRef} className="text-emerald-400">
              30 seconds
            </span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            OpportunIQ combines AI diagnostics with your personal context to
            give you the right answer, every time.
          </p>
        </div>

        {/* Stats row with counter animations */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div
              className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2"
              data-value="94"
              data-suffix="%"
            >
              0%
            </div>
            <div className="text-sm text-neutral-400">Diagnosis accuracy</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div
              className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2"
              data-value="2847"
              data-prefix="$"
            >
              $0
            </div>
            <div className="text-sm text-neutral-400">Avg saved per year</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div
              className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2"
              data-value="14"
            >
              0
            </div>
            <div className="text-sm text-neutral-400">Hours saved per issue</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div
              className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2"
              data-value="2400"
              data-suffix="+"
            >
              0
            </div>
            <div className="text-sm text-neutral-400">Happy homeowners</div>
          </div>
        </div>

        {/* Feature cards */}
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                <feature.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
