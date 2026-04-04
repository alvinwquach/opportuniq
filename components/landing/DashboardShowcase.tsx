"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrowserChrome } from "./dashboard-preview/BrowserChrome";
import { DiagnoseView } from "./dashboard-preview/views/DiagnoseView";
import { DashboardView } from "./dashboard-preview/views/DashboardView";
import type { ViewType } from "./dashboard-preview/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type LocalView = "diagnose" | "dashboard";

export function DashboardShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<LocalView>("diagnose");

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );

      // Browser frame reveal
      gsap.fromTo(
        browserRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: browserRef.current,
            start: "top 70%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-slate-950 px-6 py-24"
    >
      <div className="max-w-7xl mx-auto w-full">
        <h2
          ref={headingRef}
          className="text-5xl md:text-6xl font-bold text-white text-center mb-12"
        >
          Everything in one place
        </h2>

        <p className="text-xl text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Track issues. Compare costs. Schedule contractors. Learn as you go.
        </p>

        {/* View Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveView("diagnose")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === "diagnose"
                ? "bg-white text-slate-950"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Diagnosis
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === "dashboard"
                ? "bg-white text-slate-950"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* Browser Frame with Dashboard */}
        <div ref={browserRef} className="w-full">
          <BrowserChrome activeView={activeView as ViewType}>
            <div className="h-[600px] overflow-hidden">
              {activeView === "diagnose" ? (
                <DiagnoseView />
              ) : (
                <DashboardView />
              )}
            </div>
          </BrowserChrome>
        </div>
      </div>
    </section>
  );
}
