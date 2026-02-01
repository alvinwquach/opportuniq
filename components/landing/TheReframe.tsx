"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

const OLD_WAY = [
  { text: "Google for 2 hours", delay: 0 },
  { text: "Ask Reddit", delay: 0.8 },
  { text: "Watch 5 YouTube videos", delay: 1.4 },
  { text: "Call 3 contractors", delay: 2.0 },
  { text: "Wait for quotes", delay: 2.6 },
  { text: "Still guess", delay: 3.2 },
];

const NEW_WAY = [
  "Describe the issue",
  "See the tradeoffs",
  "Know the math",
  "Decide in minutes",
];

export function TheReframe() {
  const sectionRef = useRef<HTMLElement>(null);
  const oldWayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>(Array(OLD_WAY.length).fill(""));
  const [showNewWay, setShowNewWay] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Main pinned scroll animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          const progress = self.progress;

          // Phase 1 (0-0.4): Type out old way lines
          if (progress < 0.4) {
            const typeProgress = progress / 0.4;
            const totalDuration = 3.8; // Total "time" for all lines

            OLD_WAY.forEach((line, i) => {
              const lineStart = line.delay / totalDuration;
              const lineEnd = (line.delay + 0.6) / totalDuration;

              if (typeProgress >= lineStart) {
                const lineProgress = Math.min((typeProgress - lineStart) / (lineEnd - lineStart), 1);
                const charsToShow = Math.floor(lineProgress * line.text.length);
                setTypedLines(prev => {
                  const newLines = [...prev];
                  newLines[i] = line.text.slice(0, charsToShow) + (lineProgress < 1 ? "▌" : "");
                  return newLines;
                });
              }
            });
          }

          // Phase 2 (0.4-0.5): Pause, show cursor blinking on "Still guess"
          if (progress >= 0.4 && progress < 0.5) {
            setTypedLines(prev => {
              const newLines = [...prev];
              newLines[5] = "Still guess" + (Math.floor(Date.now() / 500) % 2 === 0 ? "▌" : "");
              return newLines;
            });
          }

          // Phase 3 (0.5-0.6): Show new way
          if (progress >= 0.5) {
            setShowNewWay(true);
            setTypedLines(OLD_WAY.map(l => l.text));
          }

          // Phase 4 (0.6-0.9): Wipe transition
          if (progress >= 0.6 && progress < 0.9) {
            const wipe = (progress - 0.6) / 0.3;
            setWipeProgress(wipe);
          } else if (progress >= 0.9) {
            setWipeProgress(1);
          }
        },
      });

      // Animate new way items when they appear
      gsap.from(".new-way-item", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 0.3,
        },
        opacity: 0,
        x: 20,
        stagger: 0.05,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) {
    return <section className="relative min-h-screen bg-neutral-950" />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-neutral-950 overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-[0.3em] mb-4">
              The Shift
            </h2>
          </div>

          {/* Split comparison */}
          <div className="relative grid md:grid-cols-2 gap-8 md:gap-0">
            {/* Vertical divider with wipe */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px">
              <div className="absolute inset-0 bg-neutral-800" />
              <div
                className="absolute top-0 left-0 w-full bg-blue-500"
                style={{
                  height: `${wipeProgress * 100}%`,
                  boxShadow: wipeProgress > 0 ? "0 0 20px rgba(59, 130, 246, 0.5)" : "none",
                }}
              />
            </div>

            {/* Old Way */}
            <div
              className="pr-8 md:pr-16 transition-opacity duration-500"
              style={{ opacity: wipeProgress < 1 ? 1 - wipeProgress * 0.7 : 0.3 }}
            >
              <div className="mb-8">
                <span className="text-xs font-mono text-neutral-600 uppercase tracking-[0.2em]">
                  The Old Way
                </span>
              </div>

              <div className="space-y-4 font-mono">
                {OLD_WAY.map((line, i) => (
                  <div
                    key={i}
                    ref={el => { oldWayRefs.current[i] = el; }}
                    className={`text-lg sm:text-xl transition-colors duration-300 ${
                      i === OLD_WAY.length - 1
                        ? "text-red-500/80"
                        : "text-neutral-500"
                    }`}
                    style={{
                      opacity: typedLines[i] ? 1 : 0.3,
                    }}
                  >
                    <span className="text-neutral-700 mr-3">{String(i + 1).padStart(2, "0")}</span>
                    {typedLines[i] || line.text}
                  </div>
                ))}
              </div>

              {/* Time wasted indicator */}
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-600 uppercase tracking-wider">
                    Time spent
                  </span>
                  <span className="font-mono text-amber-500 text-sm">
                    ~4 hours
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-mono text-neutral-600 uppercase tracking-wider">
                    Confidence
                  </span>
                  <span className="font-mono text-red-500 text-sm">
                    Low
                  </span>
                </div>
              </div>
            </div>

            {/* New Way */}
            <div
              className="pl-8 md:pl-16 transition-all duration-500"
              style={{
                opacity: showNewWay ? 1 : 0,
                transform: showNewWay ? "translateX(0)" : "translateX(20px)",
              }}
            >
              <div className="mb-8">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.2em]">
                  The New Way
                </span>
              </div>

              <div className="space-y-4">
                {NEW_WAY.map((line, i) => (
                  <div
                    key={i}
                    className="new-way-item text-lg sm:text-xl text-white font-medium flex items-center gap-4"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {line}
                  </div>
                ))}
              </div>

              {/* Time saved indicator */}
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-600 uppercase tracking-wider">
                    Time spent
                  </span>
                  <span className="font-mono text-emerald-400 text-sm">
                    ~5 minutes
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-mono text-neutral-600 uppercase tracking-wider">
                    Confidence
                  </span>
                  <span className="font-mono text-emerald-400 text-sm">
                    94% accurate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom transition text */}
          <div
            className="text-center mt-20 transition-all duration-700"
            style={{
              opacity: wipeProgress > 0.8 ? 1 : 0,
              transform: wipeProgress > 0.8 ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p className="text-neutral-400 text-lg">
              Same decision. Different process.{" "}
              <span className="text-white font-medium">Different outcome.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
