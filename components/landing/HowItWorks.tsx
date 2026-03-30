"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    step: "01",
    title: "Capture",
    description: "Photo, video, or voice note.",
    color: "#00F0FF",
  },
  {
    step: "02",
    title: "Frame",
    description: "DIY, outsource, or defer.",
    color: "#00FF88",
  },
  {
    step: "03",
    title: "Decide",
    description: "Logged to your Decision Hub.",
    color: "#FF8800",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);


  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hiw-heading", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      const stepCards = sectionRef.current!.querySelectorAll(".step-card");
      gsap.from(stepCards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.6,
        ease: "power3.out",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-black"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h2 className="hiw-heading text-2xl sm:text-3xl font-semibold text-white text-center mb-12">
          Three Steps
        </h2>
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#00F0FF] via-[#00FF88] to-[#FF8800]" />
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="step-card relative flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 bg-black relative z-10"
                  style={{
                    borderColor: step.color,
                    boxShadow: `0 0 20px ${step.color}40`
                  }}
                >
                  <span
                    className="text-lg font-bold font-mono"
                    style={{ color: step.color }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3
                  className="text-lg font-medium mb-1"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
