"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText, CustomEase, ScrambleTextPlugin } from "@/lib/gsap";
import Link from "next/link";
import { ChatDemo } from "./ChatDemo";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cycleRef = useRef<HTMLSpanElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const chatColRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    gsap.registerPlugin(ScrambleTextPlugin);

    const cycleWords = ["breaks.", "leaks.", "fails.", "sparks.", "floods."];
    let cycleIndex = 0;

    const ctx = gsap.context(() => {
      const ease = CustomEase.get("spring") ? "spring" : "power3.out";
      const tl = gsap.timeline({ delay: 0.1 });

      // Tagline
      if (taglineRef.current) {
        gsap.set(taglineRef.current, { clipPath: "inset(0 0 100% 0)" });
        tl.to(taglineRef.current, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease });
      }

      // Headline — SplitText chars animate up with stagger (animate-text style)
      if (headlineRef.current) {
        const split = new SplitText(headlineRef.current, { type: "words,chars" });
        gsap.set(split.chars, { yPercent: 110, display: "inline-block" });
        // Wrap each word in overflow:hidden so chars clip naturally
        split.words.forEach((w) => { (w as HTMLElement).style.overflow = "hidden"; (w as HTMLElement).style.display = "inline-block"; });
        tl.to(split.chars, { yPercent: 0, stagger: 0.025, duration: 0.7, ease }, "-=0.3");
      }

      // Subheadline — words clip up
      if (subheadlineRef.current) {
        gsap.set(subheadlineRef.current, { visibility: "visible" });
        const split = new SplitText(subheadlineRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });
        tl.to(split.words, { clipPath: "inset(0 0 0% 0)", stagger: 0.025, duration: 0.5, ease }, "-=0.4");
      }

      // CTA
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { clipPath: "inset(0 0 100% 0)" });
        tl.to(ctaRef.current, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease }, "-=0.2");
      }

      // Trust bar
      if (trustRef.current) {
        gsap.set(trustRef.current, { clipPath: "inset(0 0 100% 0)" });
        tl.to(trustRef.current, { clipPath: "inset(0 0 0% 0)", duration: 0.5, ease }, "-=0.3");
      }

      // Chat column — slides in from right
      if (chatColRef.current) {
        gsap.set(chatColRef.current, { x: 50, opacity: 0 });
        tl.to(chatColRef.current, { x: 0, opacity: 1, duration: 0.9, ease }, 0.4);
      }

      // Scramble cycling — starts after entrance animation completes
      tl.eventCallback("onComplete", () => {
        if (!cycleRef.current) return;
        intervalRef.current = setInterval(() => {
          cycleIndex = (cycleIndex + 1) % cycleWords.length;
          if (cycleRef.current) {
            gsap.to(cycleRef.current, {
              scrambleText: {
                text: cycleWords[cycleIndex],
                chars: "upperCase",
                speed: 0.4,
                revealDelay: 0.3,
              },
              duration: 1,
              ease: "none",
            });
          }
        }, 2500);
      });

    }, sectionRef);

    return () => {
      ctx.revert();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16"
    >

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          {/* Left column */}
          <div className="space-y-8 text-left">
            <span
              ref={taglineRef}
              className="inline-block text-sm font-medium text-blue-600 tracking-wider uppercase"
              style={{ clipPath: "inset(0 0 100% 0)" }}
            >
              AI-powered home &amp; auto assistant
            </span>

            <h1
              ref={headlineRef}
              className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get answers the moment
              <br />
              something <span ref={cycleRef}>breaks.</span>
            </h1>

            <p
              ref={subheadlineRef}
              className="text-xl text-gray-500 max-w-xl leading-relaxed invisible"
            >
              Is it urgent? Safe to handle? What will it cost? Describe the
              problem in any language — the AI diagnoses it, catches hazards
              you didn&apos;t know to ask about, and finds help if you need it.
              No experience required.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4"
              style={{ clipPath: "inset(0 0 100% 0)" }}
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Start for free
              </Link>
              <a
                href="#what-you-can-do"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                See how it works
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>

            <div ref={trustRef} className="flex items-center gap-4 text-sm text-gray-400" style={{ clipPath: "inset(0 0 100% 0)" }}>
              <span>Free to start</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>No credit card</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>40+ languages</span>
            </div>
          </div>

          {/* Right column — ChatDemo */}
          <div ref={chatColRef} style={{ opacity: 0 }}>
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
