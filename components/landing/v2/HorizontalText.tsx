"use client";

import { useEffect, useRef } from "react";
import {
  IoMicOutline,
  IoShieldCheckmarkOutline,
  IoConstructOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoRocketOutline,
} from "react-icons/io5";

const steps = [
  {
    number: "01",
    icon: IoMicOutline,
    headline: "Describe it.",
    body: "Type, speak, snap a photo, or record a video. Any language. Any device.",
  },
  {
    number: "02",
    icon: IoShieldCheckmarkOutline,
    headline: "Is it safe?",
    body: "Immediate safety risks flagged first — electrical hazards, gas leaks, structural concerns, and what PPE you need before touching anything.",
  },
  {
    number: "03",
    icon: IoConstructOutline,
    headline: "Can I do it myself?",
    body: "Honest assessment of skill level, tools required, and time. Step-by-step DIY guides if you can. A clear reason why not if you shouldn't.",
  },
  {
    number: "04",
    icon: IoTimeOutline,
    headline: "Is it urgent?",
    body: "Know whether to act today or if it can wait — and exactly what gets worse the longer you leave it.",
  },
  {
    number: "05",
    icon: IoCalendarOutline,
    headline: "Can I defer?",
    body: "If you can wait, here's what to watch for, how long is safe, and the warning signs that mean stop waiting.",
  },
  {
    number: "06",
    icon: IoCashOutline,
    headline: "Know the cost.",
    body: "Real DIY vs. professional pricing from HomeAdvisor and Angi — specific to your region.",
  },
  {
    number: "07",
    icon: IoRocketOutline,
    headline: "Take action.",
    body: "Find rated contractors, get step-by-step guides, check parts availability, or schedule a reminder.",
  },
];

export function HorizontalText() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    const onScroll = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrolled = window.scrollY - sectionTop;
      const scrollDistance = track.scrollWidth - window.innerWidth;
      const clamped = Math.max(0, Math.min(scrolled, scrollDistance));
      track.style.transform = `translateX(${-clamped}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const panelWidth = 45; // vw per step panel
  const totalScrollVw = steps.length * panelWidth;

  return (
    // Outer div is tall enough to provide the scroll distance
    <div
      ref={sectionRef}
      style={{ height: `calc(100vh + ${totalScrollVw}vw)` }}
    >
      {/* Sticky viewport — stays in view while outer scrolls */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen bg-gray-900 overflow-hidden"
      >
        {/* Fixed label */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            How it works
          </p>
        </div>

        {/* Track — translated by scroll handler */}
        <div
          ref={trackRef}
          className="absolute top-0 left-0 h-full flex items-center will-change-transform"
          style={{ width: `calc(100vw + ${totalScrollVw}vw)` }}
        >
          {/* Intro panel */}
          <div className="flex-shrink-0 w-screen h-full flex items-center px-16 sm:px-24">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
                Seven steps
              </p>
              <h2 className="text-5xl sm:text-7xl font-bold text-white leading-none tracking-tight">
                From question<br />to fixed.
              </h2>
            </div>
          </div>

          {/* Step panels */}
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex-shrink-0 h-full flex items-center px-10 sm:px-14 border-l border-gray-800"
                style={{ width: `${panelWidth}vw` }}
              >
                <div>
                  <Icon className="w-6 h-6 text-blue-400 mb-5" />
                  <span className="text-xs font-mono font-bold text-gray-600 mb-4 block">
                    {step.number}
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
                    {step.headline}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 max-w-xs leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Exit panel */}
          <div className="flex-shrink-0 w-screen h-full flex items-center justify-center px-16">
            <p className="text-2xl sm:text-3xl font-semibold text-gray-400 text-center max-w-sm">
              No experience required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
