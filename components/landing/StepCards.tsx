"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoCamera, IoMic, IoSparkles, IoGlobe, IoPhonePortrait, IoFlash } from "react-icons/io5";
import { IconType } from "react-icons";

gsap.registerPlugin(ScrollTrigger);


interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: IconType;
  color: string;
  examples: string[];
  inputType: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Show",
    subtitle: "Capture the project or problem",
    description: "Take a photo or video of what you're working on. A ceiling crack, a build project, a car dashboard warning, or that mystery issue.",
    icon: IoCamera,
    color: "#00F0FF",
    examples: ["Ceiling crack photo", "Shelf build project", "Garage door video", "Sneaker restoration"],
    inputType: "Photo • Video • Screenshot",
  },
  {
    number: "02",
    title: "Say",
    subtitle: "Add context (optional)",
    description: "Describe what's happening in any language. Voice notes work too—just talk naturally about the situation.",
    icon: IoMic,
    color: "#00FF88",
    examples: ["\"Started last week\"", "\"First time building\"", "\"Makes noise when...\"", "\"Want to restore...\""],
    inputType: "Voice • Text • Any language",
  },
  {
    number: "03",
    title: "Send",
    subtitle: "Get your analysis",
    description: "Receive a clear recommendation: DIY or hire out. With cost estimates, time estimates, risk levels, and next steps to consider.",
    icon: IoSparkles,
    color: "#FF8800",
    examples: ["DIY: 25 min, $15", "Hire: $200, same day", "Risk: Low, no PPE", "Potential savings: $185"],
    inputType: "Instant analysis",
  },
];

export function StepCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);


  useEffect(() => {
    if (!containerRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".step-card");

    // Initial state
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

    // Scroll trigger for each card
    cards.forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "top 50%",
          scrub: false,
          once: true,
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: i * 0.15,
        ease: "power3.out",
      });
    });

    // Connection lines animation
    const lines = containerRef.current.querySelectorAll(".connection-line");
    lines.forEach((line, i) => {
      gsap.fromTo(line,
        { scaleX: 0 },
        {
          scrollTrigger: {
            trigger: line,
            start: "top 70%",
            once: true,
          },
          scaleX: 1,
          duration: 0.8,
          delay: i * 0.2 + 0.3,
          ease: "power2.out",
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);


  return (
    <section ref={containerRef} className="relative py-20 lg:py-28 bg-black overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(0,240,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 mb-4">
            <span className="text-xs font-medium text-[#00FF88]">Simple as 1-2-3</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Show. Say. <span className="text-[#00F0FF]">Solved.</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            No searching forums. No calling five contractors. Just answers.
          </p>
        </div>
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          <div className="hidden md:block absolute top-[60px] left-[33%] right-[67%] h-0.5">
            <div className="connection-line h-full bg-gradient-to-r from-[#00F0FF] to-[#00FF88] origin-left" />
          </div>
          <div className="hidden md:block absolute top-[60px] left-[67%] right-[33%] h-0.5">
            <div className="connection-line h-full bg-gradient-to-r from-[#00FF88] to-[#FF8800] origin-left" />
          </div>
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`step-card relative group`}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                className={`relative bg-neutral-950/80 rounded-2xl border p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 ${
                  hoveredStep === i
                    ? "border-opacity-50 scale-[1.02]"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
                style={{
                  borderColor: hoveredStep === i ? step.color : undefined,
                  boxShadow: hoveredStep === i ? `0 0 40px ${step.color}20` : undefined,
                }}
              >
                <div
                  className="absolute -top-4 left-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: step.color,
                    color: "#000",
                  }}
                >
                  {step.number}
                </div>
                <div className="mb-4 mt-2">
                  <step.icon className="w-10 h-10" style={{ color: step.color }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-neutral-400 mb-4">{step.subtitle}</p>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  {step.description}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs mb-4"
                  style={{
                    backgroundColor: `${step.color}15`,
                    color: step.color,
                  }}
                >
                  {step.inputType}
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Examples</div>
                  <div className="flex flex-wrap gap-2">
                    {step.examples.map((example, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-6 right-6 h-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: hoveredStep === i ? step.color : "transparent",
                    opacity: hoveredStep === i ? 1 : 0,
                  }}
                />
              </div>
              {i < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b" style={{
                    backgroundImage: `linear-gradient(to bottom, ${STEPS[i].color}, ${STEPS[i + 1].color})`
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-neutral-500 text-sm mb-4">
            Works with photos, videos, voice notes, and screenshots
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1.5">
              <IoGlobe className="w-3.5 h-3.5" /> 100+ Languages
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1.5">
              <IoMic className="w-3.5 h-3.5" /> Voice Input
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1.5">
              <IoPhonePortrait className="w-3.5 h-3.5" /> Mobile Friendly
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1.5">
              <IoFlash className="w-3.5 h-3.5" /> Instant Results
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
