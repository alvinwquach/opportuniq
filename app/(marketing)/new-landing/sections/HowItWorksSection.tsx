"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, typewriter } from "@/lib/gsap";
import { IoCamera, IoChatbubbles, IoCheckmarkDone } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: IoCamera,
    title: "Snap a Photo",
    description:
      "See a problem? Take a quick photo. Our AI analyzes the image and identifies the issue in seconds.",
    typewriterText: "Analyzing image... Detected: Water heater leak at base connection",
  },
  {
    number: "02",
    icon: IoChatbubbles,
    title: "Get Your Diagnosis",
    description:
      "Receive a detailed breakdown: what's wrong, how urgent it is, and what your options are.",
    typewriterText: "Severity: Medium | DIY Feasible: Yes | Est. Cost: $45-85",
  },
  {
    number: "03",
    icon: IoCheckmarkDone,
    title: "Make the Right Call",
    description:
      "See personalized DIY vs hire recommendations based on your skills, time value, and risk tolerance.",
    typewriterText: "Recommendation: DIY | Potential Savings: $180 | Time: 45 min",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const typewriterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Steps with stagger
      const stepElements = stepsRef.current?.querySelectorAll(".step-card");
      stepElements?.forEach((step, i) => {
        // Card entrance
        gsap.from(step, {
          opacity: 0,
          x: i % 2 === 0 ? -50 : 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
          },
        });

        // Typewriter effect for each step
        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          onEnter: () => {
            const ref = typewriterRefs.current[i];
            if (ref) {
              typewriter(ref, steps[i].typewriterText, {
                duration: 1.5,
                delay: 0.3,
                cursor: true,
              });
            }
          },
          once: true,
        });
      });

      // Connecting line animation
      gsap.from(".connecting-line", {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 60%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-20">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Three steps to smarter repairs
          </h2>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            No more guessing. No more overpaying. Just clear answers.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* Connecting line */}
          <div className="connecting-line absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent hidden sm:block" />

          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`step-card relative flex flex-col lg:flex-row items-start gap-8 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Number bubble */}
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-16 h-16 rounded-full bg-[#0a0a0a] border-2 border-emerald-500/50 flex items-center justify-center z-10">
                  <span className="text-xl font-bold text-emerald-400">
                    {step.number}
                  </span>
                </div>

                {/* Content card */}
                <div
                  className={`ml-24 lg:ml-0 lg:w-[calc(50%-4rem)] p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 ${
                    i % 2 === 1 ? "lg:mr-auto" : "lg:ml-auto"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-neutral-400 mb-4">{step.description}</p>

                  {/* Typewriter terminal */}
                  <div className="p-3 rounded-lg bg-[#0f0f0f] border border-white/5 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span
                      ref={(el) => {
                        typewriterRefs.current[i] = el;
                      }}
                      className="text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
