"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  IoGitBranch,
  IoShield,
  IoTime,
  IoPeople,
  IoBook,
  IoWallet,
} from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: IoGitBranch,
    title: "Decision Frames, Not Recommendations",
    description:
      "We don't tell you what to do. We show you DIY vs. hire vs. defer, with clear tradeoffs for each path. You make the call.",
  },
  {
    icon: IoShield,
    title: "Safety & Risk Analysis",
    description:
      "What PPE do you need? Can you make this worse? When should you stop and call a pro? We surface what you might overlook.",
  },
  {
    icon: IoTime,
    title: "Opportunity Cost Awareness",
    description:
      "If your time is worth $50/hour and a repair takes 4 hours, the 'savings' might not be savings. We help you see the real math.",
  },
  {
    icon: IoWallet,
    title: "Budget Tracking",
    description:
      "Personal or shared. Track what you spend on repairs, contractors, and projects. See patterns. Make better future decisions.",
  },
  {
    icon: IoPeople,
    title: "Solo or Shared",
    description:
      "Use it alone or collaborate with family, roommates, or partners. Shared budgets, shared decisions, shared accountability.",
  },
  {
    icon: IoBook,
    title: "Permanent Decision Ledger",
    description:
      "Every decision is logged: what you chose, why, and what happened. Revisit past choices. Learn from outcomes. Build judgment.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);


  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".features-heading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".features-subheading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out",
      });

      const cards = sectionRef.current!.querySelectorAll(".feature-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 to-black" />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="features-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4">
            What Makes This Different
          </h2>
          <p className="features-subheading text-lg text-neutral-400 max-w-2xl mx-auto">
            Decision intelligence, not task tracking. We help you think through choices,
            not manage projects.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-neutral-300" />
              </div>

              <h3 className="text-lg font-medium text-white mb-2">
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
