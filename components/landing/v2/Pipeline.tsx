"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText, DrawSVGPlugin } from "@/lib/gsap";
import { IoKeypad, IoCamera, IoVideocam, IoMic } from "react-icons/io5";

const steps = [
  {
    number: "01",
    title: "Share your problem",
    description:
      "Type it out, snap a photo, record a video, or speak in your language \u2014 the AI understands all of it.",
    hasIcons: true,
  },
  {
    number: "02",
    title: "Get a diagnosis",
    description:
      "Identifies the issue, assesses severity, checks safety, recommends DIY or professional.",
    hasIcons: false,
  },
  {
    number: "03",
    title: "See real costs",
    description:
      "DIY vs professional breakdowns from HomeAdvisor and Angi. Real data for your region.",
    hasIcons: false,
  },
  {
    number: "04",
    title: "Find help",
    description:
      "If you need a pro, find rated contractors. If DIY, find the right parts, tools, and tutorials.",
    hasIcons: false,
  },
  {
    number: "05",
    title: "Take action",
    description:
      "Send a quote request through Gmail, schedule a reminder, or follow a step-by-step guide.",
    hasIcons: false,
  },
];

const inputIcons = [IoKeypad, IoCamera, IoVideocam, IoMic];

function StepContent({
  step,
  align,
}: {
  step: (typeof steps)[number];
  align: "left" | "right";
}) {
  return (
    <div className={align === "left" ? "text-right pr-6" : "pl-6"}>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {step.title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {step.description}
      </p>
      {step.hasIcons && (
        <div
          className={`flex gap-2 mt-3 ${
            align === "left" ? "justify-end" : "justify-start"
          }`}
        >
          {inputIcons.map((Icon, j) => (
            <div
              key={j}
              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"
            >
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pipeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Keep DrawSVGPlugin in scope so the import is not tree-shaken
  void DrawSVGPlugin;

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(split.words, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.05,
              duration: 0.6,
              ease: "spring",
            });
          },
          once: true,
        });
      }

      if (lineRef.current) {
        gsap.set(lineRef.current, { drawSVG: "0%" });
        ScrollTrigger.create({
          trigger: lineRef.current,
          start: "top 80%",
          end: "bottom 60%",
          scrub: 1,
          onUpdate: (self) => {
            gsap.set(lineRef.current, { drawSVG: `${self.progress * 100}%` });
          },
        });
      }

      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        // Odd index (0, 2, 4) are left-side steps; even index (1, 3) are right-side
        const isLeftSide = i % 2 === 0;
        gsap.set(step, { clipPath: "inset(0 0 100% 0)", x: isLeftSide ? -20 : 20 });
        ScrollTrigger.create({
          trigger: step,
          start: "top 85%",
          onEnter: () => {
            gsap.to(step, {
              clipPath: "inset(0 0 0% 0)",
              x: 0,
              duration: 0.7,
              delay: i * 0.08,
              ease: "spring",
            });
          },
          once: true,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            From question to answer in 90 seconds
          </h2>
        </div>

        <div className="relative">
          {/* Center line — desktop, SVG for DrawSVG */}
          <svg
            className="hidden md:block absolute left-1/2 top-0 -translate-x-px w-px overflow-visible"
            style={{ height: "100%" }}
          >
            <line
              ref={lineRef}
              x1="0"
              y1="0%"
              x2="0"
              y2="100%"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </svg>

          {/* Mobile line — left edge */}
          <div className="md:hidden absolute left-5 top-0 bottom-0">
            <div className="w-px h-full bg-gray-200" />
          </div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative"
                >
                  {/* Desktop: alternating left/right */}
                  <div className="hidden md:grid md:grid-cols-[1fr_40px_1fr] items-start">
                    {/* Column 1 — left side */}
                    <div>
                      {isLeft && <StepContent step={step} align="left" />}
                    </div>

                    {/* Column 2 — center node */}
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-mono font-bold z-10 relative shadow-sm">
                        {step.number}
                      </div>
                    </div>

                    {/* Column 3 — right side */}
                    <div>
                      {!isLeft && <StepContent step={step} align="right" />}
                    </div>
                  </div>

                  {/* Mobile: single column, line on left */}
                  <div className="md:hidden flex gap-5 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-mono font-bold z-10 relative shadow-sm">
                      {step.number}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                      {step.hasIcons && (
                        <div className="flex gap-2 mt-3">
                          {inputIcons.map((Icon, j) => (
                            <div
                              key={j}
                              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
