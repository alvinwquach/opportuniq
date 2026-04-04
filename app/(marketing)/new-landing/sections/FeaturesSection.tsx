"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import {
  IoCamera,
  IoPricetag,
  IoTime,
  IoConstruct,
  IoAnalytics,
  IoNotifications,
  IoPeople,
  IoShield,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: IoCamera,
    title: "AI Photo Diagnosis",
    description:
      "Snap a photo of any home issue. Our AI identifies the problem, explains what's happening, and assesses severity.",
    color: "emerald",
  },
  {
    icon: IoPricetag,
    title: "Fair Price Intelligence",
    description:
      "See what repairs should actually cost in your area. Compare quotes and never overpay for parts or labor.",
    color: "teal",
  },
  {
    icon: IoTime,
    title: "Time Value Calculator",
    description:
      "Know your hourly worth. We factor in your time value to give honest DIY vs. hire recommendations.",
    color: "emerald",
  },
  {
    icon: IoConstruct,
    title: "DIY Guides & Tutorials",
    description:
      "Step-by-step guides tailored to your skill level. Track progress and get help when you're stuck.",
    color: "teal",
  },
  {
    icon: IoAnalytics,
    title: "Savings Dashboard",
    description:
      "Track every dollar saved. See your ROI, compare past decisions, and optimize future repairs.",
    color: "emerald",
  },
  {
    icon: IoNotifications,
    title: "Smart Reminders",
    description:
      "Preventive maintenance alerts before small issues become expensive emergencies.",
    color: "teal",
  },
  {
    icon: IoPeople,
    title: "Household Groups",
    description:
      "Share repair history, coordinate tasks, and collaborate with family or roommates.",
    color: "emerald",
  },
  {
    icon: IoShield,
    title: "Risk Assessment",
    description:
      "Understand what could go wrong with each approach. Make informed decisions with full context.",
    color: "teal",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Word-by-word reveal for heading
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "words" });
        gsap.from(split.words, {
          opacity: 0,
          y: 20,
          rotateX: -90,
          stagger: 0.05,
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
          },
        });
      }

      // Cards grid animation
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      cards?.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 60,
          scale: 0.9,
          duration: 0.6,
          delay: i * 0.08,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
        });

        // Hover effect setup
        const icon = card.querySelector(".feature-icon");
        card.addEventListener("mouseenter", () => {
          gsap.to(icon, { scale: 1.2, rotate: 5, duration: 0.3 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3 });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            Full Feature Set
          </span>
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Everything you need to master home repairs
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            A complete toolkit for smarter, more confident home maintenance
            decisions.
          </p>
        </div>

        {/* Features grid */}
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className={`feature-card group relative p-5 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 hover:border-${feature.color}-500/30 transition-all duration-300 cursor-pointer`}
            >
              {/* Hover glow */}
              <div
                className={`absolute inset-0 rounded-xl bg-${feature.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <div
                  className={`feature-icon w-10 h-10 rounded-lg bg-${feature.color}-500/10 flex items-center justify-center mb-4`}
                >
                  <feature.icon
                    className={`w-5 h-5 text-${feature.color}-400`}
                  />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
