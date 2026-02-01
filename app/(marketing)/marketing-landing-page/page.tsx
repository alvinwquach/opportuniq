"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Link from "next/link";
import {
  IoArrowForward,
  IoCheckmark,
  IoCamera,
  IoAnalytics,
  IoPeople,
  IoWallet,
  IoBook,
  IoShield,
  IoChevronDown,
  IoFlash,
  IoCart,
  IoCalendar,
  IoNotifications,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoWarning,
  IoHammer,
  IoBulb,
  IoTime,
  IoLocationSharp,
  IoStar,
  IoPlayCircle,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Logo concepts for opportuniq
// Pick one by changing the logoStyle value: "scales" | "compass" | "aperture" | "nexus" | "prism"
const logoStyle: "scales" | "compass" | "aperture" | "nexus" | "prism" = "nexus";

function Logo({ className = "" }: { className?: string }) {
  // SCALES - Balance/decision making (weighing DIY vs hire)
  if (logoStyle === "scales") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        {/* Center pillar */}
        <rect x="15" y="8" width="2" height="18" fill="currentColor" />
        {/* Balance beam */}
        <rect x="6" y="10" width="20" height="2" rx="1" fill="currentColor" />
        {/* Left pan - lower (heavier = more value) */}
        <circle cx="8" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="8" y1="12" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" />
        {/* Right pan - higher */}
        <circle cx="24" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="24" y1="12" x2="24" y2="11" stroke="currentColor" strokeWidth="1.5" />
        {/* Base */}
        <rect x="12" y="26" width="8" height="2" rx="1" fill="currentColor" />
      </svg>
    );
  }

  // COMPASS - Navigation/direction for decisions
  if (logoStyle === "compass") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        {/* Outer circle */}
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        {/* Inner circle */}
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        {/* Compass needle - diamond shape pointing up-right (opportunity direction) */}
        <path d="M16 6l2 8-2 2-2-2 2-8z" fill="currentColor" />
        <path d="M16 26l-2-8 2-2 2 2-2 8z" fill="currentColor" opacity="0.3" />
        {/* Cardinal dots */}
        <circle cx="16" cy="4" r="1" fill="currentColor" />
        <circle cx="28" cy="16" r="1" fill="currentColor" />
      </svg>
    );
  }

  // APERTURE - Multiple segments coming together (like camera aperture)
  // Represents all the different features converging
  if (logoStyle === "aperture") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <g stroke="currentColor" strokeWidth="1.5">
          {/* Six blades forming aperture */}
          <path d="M16 4 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
          <path d="M26.4 10 L20 14 L18 10 Z" fill="currentColor" opacity="0.75" />
          <path d="M26.4 22 L18 18 L20 14 Z" fill="currentColor" opacity="0.6" />
          <path d="M16 28 L12 18 L16 16 Z" fill="currentColor" opacity="0.45" />
          <path d="M5.6 22 L12 18 L14 22 Z" fill="currentColor" opacity="0.3" />
          <path d="M5.6 10 L14 14 L12 18 Z" fill="currentColor" opacity="0.15" />
        </g>
      </svg>
    );
  }

  // NEXUS - Connected nodes (household, decisions, features all connected)
  if (logoStyle === "nexus") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        {/* Central hub */}
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        {/* Outer nodes */}
        <circle cx="16" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="25.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="25.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="27" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
        {/* Connections */}
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.4">
          <line x1="16" y1="12" x2="16" y2="7.5" />
          <line x1="19.5" y1="14" x2="23" y2="12" />
          <line x1="19.5" y1="18" x2="23" y2="20" />
          <line x1="16" y1="20" x2="16" y2="24.5" />
          <line x1="12.5" y1="18" x2="9" y2="20" />
          <line x1="12.5" y1="14" x2="9" y2="12" />
        </g>
      </svg>
    );
  }

  // PRISM - Light splitting into spectrum (one input, multiple insights)
  if (logoStyle === "prism") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        {/* Triangle prism */}
        <path
          d="M16 4L28 26H4L16 4z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* Light ray entering */}
        <line x1="4" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
        {/* Dispersed rays exiting */}
        <line x1="20" y1="14" x2="28" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
        <line x1="21" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <line x1="20" y1="18" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    );
  }

  // Fallback - simple O
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export default function MarketingLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [cursorVariant, setCursorVariant] = useState<"default" | "hover" | "action">("default");

  // Smooth cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, rafId: number;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      gsap.set(cursor, { x: cursorX, y: cursorY });
      rafId = requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", moveCursor);
    rafId = requestAnimationFrame(animateCursor);
    return () => { window.removeEventListener("mousemove", moveCursor); cancelAnimationFrame(rafId); };
  }, []);

  const handleCursorEnter = useCallback((variant: "hover" | "action") => {
    setCursorVariant(variant);
    gsap.to(cursorRef.current, { scale: variant === "action" ? 4 : 2.5, duration: 0.4, ease: "power3.out" });
    gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
  }, []);

  const handleCursorLeave = useCallback(() => {
    setCursorVariant("default");
    gsap.to(cursorRef.current, { scale: 1, duration: 0.4, ease: "power3.out" });
    gsap.to(cursorDotRef.current, { scale: 1, duration: 0.3 });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero
      const heroLines = heroRef.current?.querySelectorAll(".hero-line");
      if (heroLines?.length) {
        gsap.fromTo(heroLines, { yPercent: 100 }, { yPercent: 0, stagger: 0.1, duration: 1.2, ease: "power4.out", delay: 0.3 });
      }
      gsap.fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" });
      gsap.fromTo(".hero-cta", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.1, ease: "power3.out" });
      gsap.fromTo(".nav-item", { opacity: 0, y: -10 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, delay: 1.3, ease: "power2.out" });

      // Scroll-triggered animations
      const animateOnScroll = (selector: string, from: gsap.TweenVars, to: gsap.TweenVars, trigger?: string) => {
        const els = document.querySelectorAll(selector);
        if (els.length) {
          gsap.fromTo(els, from, { ...to, scrollTrigger: { trigger: trigger || selector, start: "top 80%" } });
        }
      };

      // Problem cards
      animateOnScroll(".problem-card", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7, ease: "power3.out" }, ".problem-section");

      // Diagnosis flow
      gsap.fromTo(".diagnosis-step", { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: 0.15, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: ".diagnosis-section", start: "top 70%" } });

      // Feature grid
      animateOnScroll(".feature-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power3.out" }, ".features-section");

      // Comparison bars
      gsap.fromTo(".comparison-bar", { scaleX: 0 }, { scaleX: 1, stagger: 0.1, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".comparison-section", start: "top 70%" } });

      // Safety items
      animateOnScroll(".safety-item", { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, ".safety-section");

      // Guide sources
      animateOnScroll(".guide-source", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.5, ease: "back.out(1.5)" }, ".guides-section");

      // Collaboration avatars
      gsap.fromTo(".collab-avatar", { opacity: 0, scale: 0, rotate: -20 }, { opacity: 1, scale: 1, rotate: 0, stagger: 0.1, duration: 0.5, ease: "back.out(2)" , scrollTrigger: { trigger: ".collab-section", start: "top 70%" } });

      // Stats count up
      document.querySelectorAll(".count-up").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-value") || "0");
        const isDecimal = el.getAttribute("data-decimal") === "true";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => { el.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val).toLocaleString(); }
        });
      });

      // Parallax elements
      document.querySelectorAll(".parallax").forEach((el) => {
        gsap.to(el, { yPercent: -15, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
      });

      // Line draws
      document.querySelectorAll(".line-draw").forEach((el) => {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 80%" } });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => gsap.to(window, { duration: 1, scrollTo: { y: `#${id}`, offsetY: 0 }, ease: "power3.inOut" });

  return (
    <div ref={containerRef} className="bg-[#fafafa] text-[#111] selection:bg-[#111] selection:text-white overflow-x-hidden">
      {/* Cursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 border border-[#111]/20 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block mix-blend-difference" style={{ backgroundColor: cursorVariant !== "default" ? "white" : "transparent" }} />
      <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#111] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafafa]/80 backdrop-blur-sm border-b border-[#111]/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="nav-item flex items-center gap-2.5 text-[#111]">
            <Logo className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-tight">opportuniq</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-[#111]/50">
            <button onClick={() => scrollTo("problem")} className="nav-item hover:text-[#111] transition-colors">Problem</button>
            <button onClick={() => scrollTo("diagnosis")} className="nav-item hover:text-[#111] transition-colors">Diagnosis</button>
            <button onClick={() => scrollTo("features")} className="nav-item hover:text-[#111] transition-colors">Features</button>
            <button onClick={() => scrollTo("results")} className="nav-item hover:text-[#111] transition-colors">Results</button>
            <Link href="/waitlist" className="nav-item bg-[#111] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#333] transition-colors" onMouseEnter={() => handleCursorEnter("action")} onMouseLeave={handleCursorLeave}>
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex items-center px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="max-w-3xl">
            <div className="overflow-hidden mb-1">
              <h1 className="hero-line text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Your household, optimized.
              </h1>
            </div>
            <div className="overflow-hidden mb-6">
              <p className="hero-line text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111]/20">
                Every decision, calculated.
              </p>
            </div>
            <p className="hero-subtitle text-lg text-[#111]/50 max-w-lg mb-8 leading-relaxed">
              From repairs to maintenance to big purchases—AI-powered diagnostics, smart DIY-vs-hire decisions, and complete household management in one place.
            </p>
            <div className="hero-cta flex flex-wrap items-center gap-3">
              <Link href="/waitlist" className="group inline-flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 text-sm font-medium rounded-full hover:bg-[#333] transition-colors" onMouseEnter={() => handleCursorEnter("action")} onMouseLeave={handleCursorLeave}>
                Get early access <IoArrowForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/marketing-copy" className="inline-flex items-center gap-2 text-sm text-[#111]/50 hover:text-[#111] transition-colors" onMouseEnter={() => handleCursorEnter("hover")} onMouseLeave={handleCursorLeave}>
                <IoPlayCircle className="w-5 h-5" /> View interactive demo
              </Link>
            </div>
          </div>
          <button onClick={() => scrollTo("problem")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#111]/20 hover:text-[#111]/40 transition-colors">
            <IoChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="problem-section py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-[#111]/30 uppercase tracking-[0.2em] mb-2">The Problem</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-12 max-w-xl">
            Running a household is harder than it should be
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: IoWarning, title: "Endless Guesswork", desc: "Is the repair urgent? Should you DIY or hire? How much should it cost?" },
              { icon: IoWallet, title: "Money Slipping Away", desc: "Overpaying contractors, buying wrong parts, missing deals on big purchases." },
              { icon: IoTime, title: "Time Drain", desc: "Researching, comparing, coordinating—household management is a part-time job." },
              { icon: IoPeople, title: "No Coordination", desc: "Family members duplicating efforts, decisions scattered across texts and notes." },
            ].map((item, i) => (
              <div key={i} className="problem-card p-6 bg-[#fafafa] border border-[#111]/5 rounded-lg">
                <item.icon className="w-6 h-6 text-[#111]/30 mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#111]/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnosis Section */}
      <section id="diagnosis" className="diagnosis-section py-20 bg-[#111] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">AI-Powered Analysis</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-4 max-w-xl">
            From photo to action plan in seconds
          </h2>
          <p className="text-white/40 mb-12 max-w-lg">Upload a photo of any household issue—repairs, appliances, potential purchases. Get instant diagnosis, cost analysis, and recommended next steps.</p>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { step: "01", title: "Snap a photo", desc: "Or describe the issue in text", icon: IoCamera },
                { step: "02", title: "AI analyzes", desc: "92% accuracy across 500+ issue types", icon: IoBulb },
                { step: "03", title: "Get diagnosis", desc: "Problem identified with confidence score", icon: IoCheckmarkCircle },
                { step: "04", title: "See options", desc: "DIY instructions or pro recommendations", icon: IoHammer },
              ].map((item, i) => (
                <div key={i} className="diagnosis-step flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-white/30 font-mono">{item.step}</span>
                      <h3 className="font-medium">{item.title}</h3>
                    </div>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnosis Preview Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <IoWarning className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium">Leaky Kitchen Faucet</h4>
                  <p className="text-sm text-white/40">Diagnosed just now</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Diagnosis</span>
                  <span>Worn O-ring or cartridge</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Confidence</span>
                  <span className="text-emerald-400">92%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Difficulty</span>
                  <span>Easy · 30-45 min</span>
                </div>
              </div>
              <div className="h-px bg-white/10 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-1">DIY Cost</p>
                  <p className="text-xl font-semibold">$33</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Pro Cost</p>
                  <p className="text-xl font-semibold text-white/50">$185</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Recommended: DIY · Save $152</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="comparison-section py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-[#111]/30 uppercase tracking-[0.2em] mb-2">Opportunity Cost Engine</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-4 max-w-xl">
            Every decision, optimized for your life
          </h2>
          <p className="text-[#111]/50 mb-12 max-w-lg">We factor in your hourly rate, skill level, available time, and risk tolerance. Know the true cost of every choice—including your time.</p>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {[
                { label: "Faucet repair", diy: 33, pro: 185, rec: "diy" },
                { label: "AC maintenance", diy: 25, pro: 150, rec: "diy" },
                { label: "Electrical panel", diy: 0, pro: 450, rec: "pro" },
                { label: "Water heater flush", diy: 0, pro: 225, rec: "diy" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className={item.rec === "diy" ? "text-emerald-600" : "text-blue-600"}>
                      {item.rec === "diy" ? `DIY saves $${item.pro - item.diy}` : "Hire recommended"}
                    </span>
                  </div>
                  <div className="flex gap-2 h-6">
                    <div className="comparison-bar origin-left h-full bg-emerald-500 rounded" style={{ width: `${(item.diy / 500) * 100}%`, minWidth: item.diy > 0 ? "20px" : "0" }} />
                    <div className="comparison-bar origin-left h-full bg-[#111]/20 rounded" style={{ width: `${(item.pro / 500) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#111]/40">
                    <span>DIY: ${item.diy}</span>
                    <span>Pro: ${item.pro}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#fafafa] border border-[#111]/5 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Your time value matters</h3>
              <p className="text-sm text-[#111]/50 mb-6">We factor in your hourly rate to calculate true savings. A $150 repair that takes 3 hours might not be worth it if you earn $60/hour.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#111]/5">
                  <span className="text-sm">Your hourly rate</span>
                  <span className="font-semibold">$47/hr</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#111]/5">
                  <span className="text-sm">Skill level</span>
                  <span className="font-semibold">Intermediate</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#111]/5">
                  <span className="text-sm">Risk tolerance</span>
                  <span className="font-semibold">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section py-20 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-[#111]/30 uppercase tracking-[0.2em] mb-2">Complete Platform</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-12 max-w-xl">
            One app for your entire household
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: IoCamera, title: "AI Diagnostics", desc: "Photo analysis for any issue" },
              { icon: IoAnalytics, title: "Decision Engine", desc: "Opportunity cost calculations" },
              { icon: IoPeople, title: "Household Groups", desc: "Collaborate with family & roommates" },
              { icon: IoWallet, title: "Budget & Expenses", desc: "Track spending across categories" },
              { icon: IoBook, title: "Curated Guides", desc: "Step-by-step from trusted sources" },
              { icon: IoShield, title: "Safety & Risk", desc: "PPE, hazards, and alerts" },
              { icon: IoCart, title: "Shopping Lists", desc: "Parts, prices, store locations" },
              { icon: IoCalendar, title: "Calendar", desc: "DIY time & contractor visits" },
              { icon: IoNotifications, title: "Reminders", desc: "Maintenance & follow-ups" },
              { icon: IoTrendingUp, title: "Insights", desc: "Patterns, success rates, trends" },
              { icon: IoLocationSharp, title: "Pro Matching", desc: "Vetted local contractors" },
              { icon: IoStar, title: "Outcome Tracking", desc: "Learn from every decision" },
            ].map((item, i) => (
              <div key={i} className="feature-card flex items-start gap-3 p-4 bg-white border border-[#111]/5 rounded-lg hover:border-[#111]/20 transition-colors" onMouseEnter={() => handleCursorEnter("hover")} onMouseLeave={handleCursorLeave}>
                <div className="w-9 h-9 rounded-lg bg-[#111]/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#111]/50" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-0.5">{item.title}</h3>
                  <p className="text-xs text-[#111]/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="safety-section py-20 bg-[#111] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Safety First</p>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-4">
                Know when to call a pro
              </h2>
              <p className="text-white/40 mb-8">Not every repair should be DIY. We tell you exactly when professional help is needed and what safety equipment is required.</p>

              <div className="space-y-3">
                {[
                  { label: "PPE requirements for every job", color: "emerald" },
                  { label: "Hazard warnings and precautions", color: "amber" },
                  { label: "Clear 'do not proceed' guidelines", color: "red" },
                  { label: "Emergency contact integration", color: "blue" },
                ].map((item, i) => (
                  <div key={i} className={`safety-item flex items-center gap-3 p-3 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                    <IoCheckmark className={`w-4 h-4 text-${item.color}-400`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <IoWarning className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-red-400">Safety Alert</h4>
                  <p className="text-sm text-white/40">Electrical work detected</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-[#111] rounded-lg border border-red-500/20">
                  <p className="text-red-400 font-medium mb-1">⚠️ Do not proceed without:</p>
                  <ul className="text-white/50 space-y-1 ml-4">
                    <li>• Turn off circuit breaker</li>
                    <li>• Voltage tester to confirm power off</li>
                    <li>• Insulated gloves</li>
                  </ul>
                </div>
                <div className="p-3 bg-[#111] rounded-lg">
                  <p className="text-white/50">This repair involves electrical work. Consider hiring a licensed electrician for safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="guides-section py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-[#111]/30 uppercase tracking-[0.2em] mb-2">Expert Guides</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-4 max-w-xl">
            Learn from the best sources
          </h2>
          <p className="text-[#111]/50 mb-12 max-w-lg">Curated repair guides from trusted sources, plus AI-generated custom instructions for your specific issue.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "iFixit", color: "bg-blue-50 text-blue-600 border-blue-100" },
              { name: "YouTube", color: "bg-red-50 text-red-600 border-red-100" },
              { name: "This Old House", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { name: "Family Handyman", color: "bg-orange-50 text-orange-600 border-orange-100" },
              { name: "Bob Vila", color: "bg-amber-50 text-amber-600 border-amber-100" },
              { name: "AI Custom", color: "bg-purple-50 text-purple-600 border-purple-100" },
            ].map((source, i) => (
              <div key={i} className={`guide-source p-4 rounded-lg border text-center ${source.color}`}>
                <p className="text-sm font-medium">{source.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="collab-section py-20 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] text-[#111]/30 uppercase tracking-[0.2em] mb-2">Collaboration</p>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-4">
                Your home, your team
              </h2>
              <p className="text-[#111]/50 mb-6">Share issues and decisions with family, roommates, or property managers. Everyone stays informed and can contribute.</p>

              <div className="space-y-3">
                {[
                  "Create multiple household groups",
                  "Assign roles: Coordinator, Collaborator, Contributor",
                  "Track contributions and shared expenses",
                  "Real-time activity feed",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              {["👨", "👩", "👴", "👵"].map((avatar, i) => (
                <div key={i} className="collab-avatar w-16 h-16 rounded-full bg-white border-2 border-[#111]/10 flex items-center justify-center text-2xl shadow-sm">
                  {avatar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-[#111] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Real Results</p>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-12">
            Actual savings from one household
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { value: "2847", prefix: "$", label: "Saved in 6 months" },
              { value: "87", suffix: "%", label: "DIY success rate" },
              { value: "2.3", label: "Days avg resolution", decimal: true },
              { value: "12", label: "Projects completed" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold mb-1">
                  {stat.prefix}<span className="count-up" data-value={stat.value} data-decimal={stat.decimal ? "true" : "false"}>0</span>{stat.suffix}
                </div>
                <p className="text-sm text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="line-draw h-px bg-white/10 mb-12 origin-left" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { task: "Leaky faucet repair", saved: "$151", time: "45 min" },
              { task: "AC filter replacement", saved: "$85", time: "15 min" },
              { task: "Water heater flush", saved: "$225", time: "1 hr" },
              { task: "Garage door maintenance", saved: "$95", time: "30 min" },
              { task: "Dishwasher drain fix", saved: "$187", time: "45 min" },
              { task: "Toilet running fix", saved: "$120", time: "20 min" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{item.task}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-400">{item.saved}</p>
                  <p className="text-xs text-white/30">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Your household, finally optimized.
          </h2>
          <p className="text-[#111]/50 max-w-md mx-auto mb-8">
            Join thousands of homeowners making smarter decisions every day. Early access is free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/waitlist" className="group inline-flex items-center gap-2 bg-[#111] text-white px-6 py-3 rounded-full font-medium hover:bg-[#333] transition-colors" onMouseEnter={() => handleCursorEnter("action")} onMouseLeave={handleCursorLeave}>
              Get early access <IoArrowForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/marketing-copy" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#111]/20 text-[#111] hover:bg-[#111]/5 transition-colors" onMouseEnter={() => handleCursorEnter("hover")} onMouseLeave={handleCursorLeave}>
              <IoPlayCircle className="w-5 h-5" /> Try the demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#fafafa] border-t border-[#111]/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[#111]/40">
          <div className="flex items-center gap-2">
            <Logo className="w-4 h-4" />
            <span>opportuniq</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-[#111]/60 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-[#111]/60 transition-colors">Terms</Link>
            <span>2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
