"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  ScrambleTextPlugin,
  SplitText,
} from "@/lib/gsap";
import { IoCamera, IoArrowForward } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline character animation
      if (headlineRef.current) {
        const split = new SplitText(headlineRef.current, { type: "chars" });
        gsap.from(split.chars, {
          opacity: 0,
          y: 50,
          rotateX: -90,
          stagger: 0.02,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 80%",
          },
        });
      }

      // Scramble effect for accent text
      ScrollTrigger.create({
        trigger: accentRef.current,
        start: "top 80%",
        onEnter: () => {
          if (accentRef.current) {
            gsap.to(accentRef.current, {
              scrambleText: { text: "today", chars: "abcdefghijklmnopqrstuvwxyz" },
              duration: 1,
            });
          }
        },
        once: true,
      });

      // Subhead fade
      gsap.from(subheadRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.3,
        scrollTrigger: {
          trigger: subheadRef.current,
          start: "top 85%",
        },
      });

      // CTA buttons
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.5,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 90%",
        },
      });

      // Stats row
      gsap.from(statsRef.current?.children || [], {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.7,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 90%",
        },
      });

      // Pulsing glow effect
      gsap.to(".cta-glow", {
        scale: 1.1,
        opacity: 0.8,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 sm:py-40 px-4 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-950/30 via-transparent to-transparent" />
      <div className="cta-glow absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main headline */}
        <h2
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
        >
          Start saving
        </h2>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
          <span
            ref={accentRef}
            className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"
          >
            today
          </span>
        </h2>

        {/* Subhead */}
        <p
          ref={subheadRef}
          className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Your next home repair is coming. When it does, you&apos;ll know
          exactly what to do, what it should cost, and whether to DIY or hire.
          <span className="text-white font-medium">
            {" "}
            Join 2,400+ homeowners who stopped guessing.
          </span>
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-[1.02]">
            <IoCamera className="w-5 h-5" />
            <span>Try Your First Diagnosis Free</span>
            <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-neutral-300 hover:text-white transition-colors">
            <span>See pricing</span>
          </button>
        </div>

        {/* Trust stats */}
        <div
          ref={statsRef}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">$6.8M+</span>
            <span className="text-neutral-500">saved by users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">2,400+</span>
            <span className="text-neutral-500">active homeowners</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">4.9★</span>
            <span className="text-neutral-500">average rating</span>
          </div>
        </div>

        {/* No credit card badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400">
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>No credit card required</span>
          <span className="text-neutral-600">•</span>
          <span>Setup in 30 seconds</span>
        </div>
      </div>
    </section>
  );
}
