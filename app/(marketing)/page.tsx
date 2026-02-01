"use client";

import { useEffect, useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  scrambleText,
  typewriter,
} from "@/lib/gsap";
import Link from "next/link";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  IoArrowForward,
  IoCheckmark,
  IoCamera,
  IoAnalytics,
  IoPeople,
  IoWallet,
  IoBook,
  IoShield,
  IoChevronBack,
  IoChevronForward,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoWarning,
  IoHammer,
  IoTime,
  IoPlayCircle,
  IoStatsChart,
  IoArrowDown,
  IoSearch,
  IoOptions,
  IoDocumentText,
  IoFlash,
  IoLayers,
  IoNotifications,
  IoCalendar,
  IoCash,
  IoList,
  IoMail,
  IoConstruct,
  IoCart,
  IoVideocam,
  IoFlag,
  IoSpeedometer,
  IoChevronDown,
  IoCalculator,
  IoHelpCircle,
  IoGrid,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

// Data sources with SVG logos
const dataSources = [
  { name: "Reddit", category: "Community", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/></svg> },
  { name: "YouTube", category: "Videos", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: "iFixit", category: "Repairs", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0071CE"><circle cx="12" cy="12" r="10" stroke="#0071CE" strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke="#0071CE" strokeWidth="2" strokeLinecap="round"/></svg> },
  { name: "Family Handyman", category: "DIY", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#C41E3A"><path d="M10.5 2L3 9.5V22h18V9.5L13.5 2h-3zm1.5 2.5L18 10.5V20H6V10.5L12 4.5z"/></svg> },
  { name: "This Old House", category: "Expert", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E31837"><path d="M12 2L2 9v13h8v-6h4v6h8V9L12 2z"/></svg> },
  { name: "Bob Vila", category: "Home", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#2D5A27"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2z"/></svg> },
  { name: "Stack Exchange", category: "Q&A", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F48024"><path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 12.83l1.044-2.088 10.481 5.246-1.044 2.088-10.481-5.246z"/></svg> },
  { name: "Instructables", category: "Guides", logo: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FAB81E"><path d="M12.002 0a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78zM7.19 5.966a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78zm9.62 0a2.39 2.39 0 1 0 0 4.78 2.39 2.39 0 0 0 0-4.78z"/></svg> },
];

// Process steps
const processSteps = [
  {
    step: "01",
    title: "Describe your issue",
    description: "Type it out or snap a photo. We immediately start analyzing.",
    icon: IoCamera,
    details: ["Photo analysis", "Natural language understanding", "AI-assisted diagnosis"],
  },
  {
    step: "02",
    title: "Get an accurate diagnosis",
    description: "Receive a detailed diagnosis with confidence scores, potential causes, and severity assessment.",
    icon: IoSearch,
    details: ["Multi-cause detection", "Severity classification", "Confidence scoring"],
  },
  {
    step: "03",
    title: "Compare your options",
    description: "See side-by-side comparison of DIY vs hiring a professional with real costs for your area.",
    icon: IoOptions,
    details: ["Location-based pricing", "Time estimates", "Risk assessment"],
  },
  {
    step: "04",
    title: "Make an informed decision",
    description: "Choose the best path forward with data-backed confidence. Get safety tips and tool requirements.",
    icon: IoCheckmarkCircle,
    details: ["PPE recommendations", "Required tools list", "Safety hazard alerts"],
  },
  {
    step: "05",
    title: "Track and learn",
    description: "Log your decision, track outcomes, and build your repair knowledge over time.",
    icon: IoDocumentText,
    details: ["Decision ledger", "Outcome tracking", "Skill progression"],
  },
];

// Core Features (primary)
const coreFeatures = [
  { icon: IoCamera, title: "Photo Diagnosis", description: "Snap a photo for AI-assisted identification. We analyze images to suggest possible causes and next steps.", stat: "AI-powered", statLabel: "analysis" },
  { icon: IoAnalytics, title: "Smart Diagnostics", description: "Adaptive questioning to narrow down causes. Multi-cause detection with confidence scoring.", stat: "Multi-cause", statLabel: "detection" },
  { icon: IoOptions, title: "DIY vs Hire Analysis", description: "Side-by-side cost comparison with location-based pricing, time estimates, and risk assessment.", stat: "$2,400", statLabel: "avg savings" },
  { icon: IoShield, title: "Safety & Risk Assessment", description: "4-level severity classification with PPE recommendations and 'do not proceed' hazard alerts.", stat: "4-level", statLabel: "classification" },
  { icon: IoBook, title: "Curated DIY Guides", description: "Step-by-step instructions from iFixit, YouTube, This Old House, Family Handyman, and more.", stat: "9+", statLabel: "trusted sources" },
  { icon: IoConstruct, title: "Parts & Tools Finder", description: "Live inventory comparison across Home Depot, Lowe's, Amazon, and local stores with pricing.", stat: "4+", statLabel: "retailers" },
];

// Extended Features (secondary)
const extendedFeatures = [
  { icon: IoPeople, title: "Shared Groups", description: "Collaborate with family, roommates, or coworkers. 5 permission levels from Observer to Coordinator.", stat: "5", statLabel: "permission levels" },
  { icon: IoList, title: "Issue Tracking", description: "Full workflow from Open → Investigating → In Progress → Completed. Assign to members, set priorities.", stat: "4-stage", statLabel: "workflow" },
  { icon: IoWallet, title: "Financial Tracking", description: "Track income streams, recurring expenses, budget vs actual, and see DIY savings over time.", stat: "6", statLabel: "chart types" },
  { icon: IoCalendar, title: "Smart Calendar", description: "Schedule DIY projects, contractor visits, and maintenance reminders. Google Calendar integration.", stat: "5", statLabel: "event types" },
  { icon: IoCash, title: "Opportunity Cost Calculator", description: "Based on your hourly rate, see if DIY is worth your time. Get data-backed recommendations.", stat: "Auto", statLabel: "calculated" },
  { icon: IoMail, title: "Contractor Outreach", description: "Find pros on Yelp, Angi, Thumbtack, HomeAdvisor. Draft emails and request multi-quotes directly.", stat: "4", statLabel: "platforms" },
  { icon: IoCart, title: "Shopping Lists", description: "Auto-generated lists from diagnoses with price comparison. Share with household members.", stat: "Live", statLabel: "pricing" },
  { icon: IoVideocam, title: "Video Guides", description: "YouTube tutorials matched to your specific issue with timestamps and view counts.", stat: "Smart", statLabel: "matched" },
  { icon: IoFlag, title: "Outcome Tracking", description: "Log decisions and results. Build a household knowledge base and track skill progression.", stat: "∞", statLabel: "history" },
  { icon: IoSpeedometer, title: "DIY Comfort Level", description: "Set your preference from 'Always Hire' to 'Always DIY'. We tailor recommendations accordingly.", stat: "6", statLabel: "levels" },
  { icon: IoGrid, title: "Dashboard Overview", description: "At-a-glance view of active issues, budget status, upcoming tasks, and DIY savings.", stat: "12+", statLabel: "widgets" },
  { icon: IoTrendingUp, title: "Savings Analytics", description: "Track money saved by DIY, net worth over time, savings rate, and expense forecasts.", stat: "Real-time", statLabel: "analytics" },
];

// Problems
const problems = [
  { icon: IoTime, title: "Hours wasted researching", stat: "6+ hrs", description: "Average time spent googling before starting a project" },
  { icon: IoWarning, title: "Costly mistakes", stat: "$847", description: "Average cost of DIY projects gone wrong" },
  { icon: IoWallet, title: "Unclear pricing", stat: "3x", description: "Difference between lowest and highest contractor quotes" },
  { icon: IoHammer, title: "Wrong tools purchased", stat: "42%", description: "Of people buy tools they never use again" },
];

// FAQ items
const faqItems = [
  {
    question: "How accurate is the diagnosis?",
    answer: "We're in beta and improving every day. For complex or safety-critical problems, we recommend professional evaluation.",
  },
  {
    question: "How do DIY vs hire recommendations work?",
    answer: "We factor in repair complexity, your skill level, time value, required tools, and safety risks to calculate whether DIY or hiring makes more sense for your situation.",
  },
  {
    question: "What if I'm not handy at all?",
    answer: "Perfect! Even if you never DIY, OpportunIQ helps you avoid overpaying by showing fair price ranges and what questions to ask contractors.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption, never share data with contractors, and you can delete everything anytime.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const heroStatRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const savingsResultRef = useRef<HTMLSpanElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Savings calculator state
  const [repairs, setRepairs] = useState(4);
  const [avgCost, setAvgCost] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculate savings
  const overPaymentSaved = repairs * avgCost * 0.35;
  const timeSaved = repairs * 14 * hourlyRate;
  const wrongDecisions = repairs * 0.73 * 200;
  const totalSavings = Math.round(overPaymentSaved + timeSaved * 0.1 + wrongDecisions * 0.5);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, delay: 0.2 });
      gsap.from(".hero-title", { y: 40, opacity: 0, duration: 0.8, delay: 0.4 });
      gsap.from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8, delay: 0.6 });
      gsap.from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, delay: 0.8 });
      gsap.from(".hero-stats > div", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        delay: 1,
        // Hero stats are now static (Beta, Free, Home & auto) — no counter animation
        onComplete: () => {},
      });

      // Scroll-triggered animations
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 85%" },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });

      gsap.utils.toArray<HTMLElement>(".stagger-fade").forEach((container) => {
        const children = container.children;
        gsap.from(children, {
          scrollTrigger: { trigger: container, start: "top 80%" },
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "power3.out",
        });
      });

      // Feature cards animation
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: "top 85%" },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power3.out",
        });
      });

      // Marquee animation
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          duration: 25,
          ease: "none",
          repeat: -1,
        });
      }

      // Process steps animation
      processSteps.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `.process-step-${i}`,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });

      // FAQ items stagger
      gsap.utils.toArray<HTMLElement>(".faq-item").forEach((item, i) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: "top 90%" },
          y: 20,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power3.out",
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Feature carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="bg-[#09090b] text-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white/60 bg-white/[0.03] mb-6">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              Free to get started
            </div>

            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
              Fix anything smarter with{" "}
              <span className="text-teal-400">smart guidance</span>
            </h1>

            <p className="hero-subtitle text-sm sm:text-base text-white/70 max-w-xl mb-6 leading-relaxed">
              Home repairs, car issues, electronics, appliances—stop wasting hours researching. Get instant diagnoses, cost comparisons, and expert recommendations.
            </p>

            <div className="hero-cta flex flex-wrap items-center gap-3 mb-10">
              <Link href="/auth/login" className="group px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-black text-sm font-medium rounded-md flex items-center gap-2 transition-colors">
                Start Diagnosing Free
                <IoArrowForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#demo" className="px-4 py-2.5 border border-white/10 hover:border-white/20 rounded-md text-sm text-white/70 hover:text-white flex items-center gap-2 transition-colors">
                <IoPlayCircle className="w-4 h-4" />
                See demo
              </a>
            </div>

            <div className="hero-stats flex flex-wrap gap-6 sm:gap-10 pt-6 border-t border-white/[0.06]">
              {[
                { value: "Beta", label: "Now" },
                { value: "Free", label: "to start" },
                { value: "Home & auto", label: "Supported" },
              ].map((stat, i) => (
                <div key={i}>
                  <p
                    ref={(el) => { heroStatRefs.current[i] = el; }}
                    className="text-xl sm:text-2xl font-bold text-white"
                  >
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="fade-up text-[11px] uppercase tracking-[0.2em] text-teal-400 mb-2">The problem</p>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              Repairs and projects are harder than they should be
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              From fixing your car to troubleshooting electronics—we built OpportunIQ to help you make the right call.
            </p>
          </div>

          <div className="stagger-fade grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {problems.map((problem, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors">
                <problem.icon className="w-6 h-6 text-white/70 mb-3" />
                <p className="text-2xl font-bold text-red-400 mb-1">{problem.stat}</p>
                <h3 className="text-sm font-medium mb-1">{problem.title}</h3>
                <p className="text-xs text-white/60">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="fade-up text-[11px] uppercase tracking-[0.2em] text-teal-400 mb-2">How it works</p>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              From problem to solution in minutes
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              We guide you through every step, from identifying the issue to making the right decision.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Steps List */}
            <div className="space-y-4">
              {processSteps.map((step, i) => (
                <div
                  key={i}
                  className={`process-step-${i} p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    activeStep === i
                      ? "bg-teal-500/10 border-teal-500/30"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                  }`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeStep === i ? "bg-teal-500/20" : "bg-white/[0.05]"
                    }`}>
                      <step.icon className={`w-5 h-5 ${activeStep === i ? "text-teal-400" : "text-white/60"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium ${activeStep === i ? "text-teal-400" : "text-white/70"}`}>
                          STEP {step.step}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                      <p className="text-xs text-white/70 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Step Details */}
            <div className="lg:sticky lg:top-24">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    {(() => {
                      const Icon = processSteps[activeStep].icon;
                      return <Icon className="w-6 h-6 text-teal-400" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-400 font-medium">STEP {processSteps[activeStep].step}</p>
                    <h3 className="text-base font-semibold">{processSteps[activeStep].title}</h3>
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  {processSteps[activeStep].description}
                </p>

                <div className="space-y-3">
                  {processSteps[activeStep].details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <IoCheckmark className="w-3 h-3 text-teal-400" />
                      </div>
                      <span className="text-sm text-white/70">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Visual indicator */}
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <div className="flex gap-1">
                    {processSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= activeStep ? "bg-teal-400" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="fade-up text-[11px] uppercase tracking-[0.2em] text-teal-400 mb-2">Features</p>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              Everything you need to fix with confidence
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              From diagnosis to decision, we've got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {coreFeatures.map((feature, i) => (
              <div
                key={i}
                className="feature-card group p-6 rounded-xl bg-[#111113] border border-white/[0.08] hover:border-teal-500/30 hover:bg-[#131315] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">{feature.description}</p>
                <div className="pt-3 border-t border-white/[0.08]">
                  <span className="text-lg font-bold text-teal-400">{feature.stat}</span>
                  <span className="text-[10px] text-white/70 ml-2">{feature.statLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Link to full features page */}
          <div className="fade-up text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-sm text-white/70 hover:text-white transition-all group"
            >
              Explore all features
              <IoArrowForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge Sources */}
      <section id="sources" className="py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <div className="text-center">
            <p className="fade-up text-[11px] uppercase tracking-[0.2em] text-teal-400 mb-2">Knowledge sources</p>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              Powered by trusted communities
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              We use Firecrawl to index and curate the best DIY guides from across the web.
            </p>
          </div>
        </div>

        {/* Full-width marquee */}
        <div className="relative py-6">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#09090b] to-transparent z-10" />
          <div ref={marqueeRef} className="flex gap-4">
            {[...dataSources, ...dataSources, ...dataSources, ...dataSources].map((source, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                {source.logo}
                <span className="text-sm font-medium text-white/80">{source.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <div className="fade-up p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-start gap-3">
              <IoWarning className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/70 leading-relaxed">
                <span className="font-medium text-white/70">Disclaimer:</span> OpportunIQ is not affiliated with any of the websites shown above. All trademarks are property of their respective owners. We crawl publicly available content to provide curated recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <DashboardPreview variant="dark" />

      {/* Savings Calculator Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 text-[11px] text-teal-400 bg-teal-500/5 mb-4">
              <IoCalculator className="w-3.5 h-3.5" />
              Calculate Your Savings
            </div>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              See how much you could save
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              Adjust the sliders to match your situation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="fade-up p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-base font-semibold mb-6">Your Profile</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="savings-repairs" className="text-sm text-white/70">Repairs per year</label>
                    <span className="text-sm font-medium text-teal-400">{repairs}</span>
                  </div>
                  <input
                    id="savings-repairs"
                    type="range"
                    min="1"
                    max="12"
                    value={repairs}
                    onChange={(e) => setRepairs(parseInt(e.target.value))}
                    aria-label="Number of repairs per year"
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="savings-avg-cost" className="text-sm text-white/70">Average repair cost</label>
                    <span className="text-sm font-medium text-teal-400">${avgCost}</span>
                  </div>
                  <input
                    id="savings-avg-cost"
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={avgCost}
                    onChange={(e) => setAvgCost(parseInt(e.target.value))}
                    aria-label="Average repair cost in dollars"
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="savings-hourly-rate" className="text-sm text-white/70">Your hourly value</label>
                    <span className="text-sm font-medium text-teal-400">${hourlyRate}/hr</span>
                  </div>
                  <input
                    id="savings-hourly-rate"
                    type="range"
                    min="15"
                    max="150"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                    aria-label="Your hourly rate in dollars"
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="fade-up p-6 rounded-xl bg-teal-500/5 border border-teal-500/20">
              <h3 className="text-base font-semibold mb-6">Estimated Annual Savings</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <div>
                    <p className="text-sm text-white/80">Overpayment avoided</p>
                    <p className="text-[11px] text-white/60">35% avg markup eliminated</p>
                  </div>
                  <span className="text-base font-semibold text-teal-400">
                    ${Math.round(overPaymentSaved).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <div>
                    <p className="text-sm text-white/80">Time value saved</p>
                    <p className="text-[11px] text-white/60">{repairs * 14} hours of research</p>
                  </div>
                  <span className="text-base font-semibold text-teal-400">
                    ${Math.round(timeSaved * 0.1).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <div>
                    <p className="text-sm text-white/80">Better decisions</p>
                    <p className="text-[11px] text-white/60">Optimal DIY vs hire choices</p>
                  </div>
                  <span className="text-base font-semibold text-teal-400">
                    ${Math.round(wrongDecisions * 0.5).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <p className="text-[11px] text-teal-300 mb-1">Total Annual Savings</p>
                <p className="text-3xl font-bold">
                  <span ref={savingsResultRef}>${totalSavings.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white/70 bg-white/[0.02] mb-4">
              <IoHelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="faq-item rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.question}</span>
                  <IoChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-4 pb-4 text-sm text-white/70 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="fade-up text-[11px] uppercase tracking-[0.2em] text-teal-400 mb-2">Works for</p>
            <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
              Any repair, any project
            </h2>
            <p className="fade-up text-sm text-white/70 max-w-lg mx-auto">
              From leaky faucets to check engine lights—get guidance for whatever you're facing.
            </p>
          </div>

          <div className="stagger-fade grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                category: "Home",
                examples: ["Leaky faucet", "HVAC not cooling", "Electrical issues", "Appliance repairs"],
                icon: "🏠"
              },
              {
                category: "Auto",
                examples: ["Check engine light", "Brake problems", "Battery issues", "Strange noises"],
                icon: "🚗"
              },
              {
                category: "Electronics",
                examples: ["Phone won't charge", "Laptop overheating", "TV no picture", "Speaker buzz"],
                icon: "📱"
              },
              {
                category: "Outdoor",
                examples: ["Lawn mower won't start", "Sprinkler leak", "Fence repair", "Gutter cleaning"],
                icon: "🌳"
              },
            ].map((useCase, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-teal-500/30 transition-colors">
                <div className="text-2xl mb-3">{useCase.icon}</div>
                <h3 className="text-sm font-semibold mb-3">{useCase.category}</h3>
                <ul className="space-y-1.5">
                  {useCase.examples.map((example, j) => (
                    <li key={j} className="text-xs text-white/70 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-teal-400/50" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <OpportunIQLogo className="fade-up w-10 h-10 text-teal-400 mx-auto mb-6" />
          <h2 className="fade-up text-2xl sm:text-3xl font-bold mb-3">
            Ready to fix smarter?
          </h2>
          <p className="fade-up text-sm text-white/70 mb-6 max-w-md mx-auto">
            Stop guessing, start fixing. Get AI-powered guidance for any repair or project.
          </p>
          <div className="fade-up flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className="group px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-black text-sm font-medium rounded-md flex items-center gap-2 transition-colors">
              Get Started Free
              <IoArrowForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="fade-up mt-4 text-[11px] text-white/70">
            No credit card required
          </p>
        </div>
      </section>

    </div>
  );
}
