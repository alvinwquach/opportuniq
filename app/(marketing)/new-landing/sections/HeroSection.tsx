"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  animateCounter,
  scrambleText,
} from "@/lib/gsap";
import { IoCamera, IoPlayCircle } from "react-icons/io5";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const savingsRef = useRef<HTMLSpanElement>(null);
  const totalSavedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Staggered entrance animation
      tl.from(headlineRef.current, {
        opacity: 0,
        y: 60,
        duration: 1,
      })
        .from(
          subheadRef.current,
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ctaRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          statsRef.current?.children || [],
          {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          mockupRef.current,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
            duration: 1,
          },
          "-=0.8"
        );

      // Counter animation for savings stat
      if (savingsRef.current) {
        tl.add(() => {
          animateCounter(savingsRef.current!, 2847, {
            duration: 1.5,
            prefix: "$",
            suffix: "/year",
          });
        }, "-=1.2");
      }

      // Scramble text for total saved
      if (totalSavedRef.current) {
        tl.add(() => {
          scrambleText(totalSavedRef.current!, "$6.8M+", {
            duration: 1.2,
            chars: "$0123456789M+.",
          });
        }, "-=1");
      }

      // Parallax on scroll
      gsap.to(mockupRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-neutral-300">
            Trusted by 2,400+ homeowners
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
        >
          Stop Losing Money
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            On Home Repairs
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI analyzes your repair, finds the best parts and pros, and tells you
          exactly when to DIY or hire. The average homeowner saves{" "}
          <span ref={savingsRef} className="text-emerald-400 font-semibold">$0/year</span>.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button className="group flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:scale-[1.02]">
            <IoCamera className="w-5 h-5" />
            <span>Try It Free</span>
            <span className="text-emerald-900/60 text-sm ml-1">
              No card required
            </span>
          </button>
          <button className="flex items-center gap-2 px-6 py-4 text-neutral-300 hover:text-white transition-colors">
            <IoPlayCircle className="w-6 h-6" />
            <span>Watch Demo (2 min)</span>
          </button>
        </div>

        {/* Social proof stats */}
        <div
          ref={statsRef}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-[#0a0a0a] flex items-center justify-center text-xs"
                >
                  {["👨", "👩", "👴", "👵", "🧑"][i - 1]}
                </div>
              ))}
            </div>
            <span className="text-neutral-400">2,400+ users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <span className="text-neutral-400">4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span ref={totalSavedRef} className="text-emerald-400 font-bold">$0</span>
            <span className="text-neutral-400">saved by users</span>
          </div>
        </div>
      </div>

      {/* Product mockup */}
      <div
        ref={mockupRef}
        className="relative z-10 mt-16 w-full max-w-5xl mx-auto"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl shadow-black/50">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0f0f0f] text-xs text-neutral-500">
                <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                <span>www.opportuniq.app</span>
              </div>
            </div>
          </div>
          {/* Dashboard preview placeholder */}
          <div className="aspect-[16/9] bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
            <div className="text-center">
              <OpportunIQLogo className="w-16 h-16 text-emerald-400/20 mx-auto mb-4" />
              <p className="text-neutral-600 text-sm">
                Interactive Dashboard Preview
              </p>
            </div>
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10 opacity-50" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-neutral-700 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-neutral-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
