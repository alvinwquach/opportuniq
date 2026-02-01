"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  IoHome,
  IoAnalytics,
  IoWallet,
  IoConstruct,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrendingUp,
} from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const tabs = ["Overview", "Issues", "Spending"];

const mockStats = [
  { label: "Total Saved", value: "$2,847", change: "+$340 this month" },
  { label: "DIY Repairs", value: "12", change: "3 in progress" },
  { label: "Pro Repairs", value: "4", change: "1 scheduled" },
  { label: "Active Issues", value: "2", change: "0 urgent" },
];

const mockIssues = [
  {
    title: "Leaky kitchen faucet",
    status: "In Progress",
    statusColor: "emerald",
    savings: "$120",
  },
  {
    title: "HVAC filter replacement",
    status: "Scheduled",
    statusColor: "amber",
    savings: "$40",
  },
  {
    title: "Garage door adjustment",
    status: "Completed",
    statusColor: "emerald",
    savings: "$180",
  },
];

export function DashboardPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Dashboard entrance with 3D effect
      gsap.from(dashboardRef.current, {
        opacity: 0,
        y: 100,
        rotateX: 15,
        scale: 0.9,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: dashboardRef.current,
          start: "top 80%",
        },
      });

      // Floating animation
      gsap.to(dashboardRef.current, {
        y: -10,
        duration: 3,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Stats cards stagger
      gsap.from(".stat-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        scrollTrigger: {
          trigger: dashboardRef.current,
          start: "top 60%",
        },
      });

      // Issue rows stagger
      gsap.from(".issue-row", {
        opacity: 0,
        x: -30,
        stagger: 0.15,
        duration: 0.5,
        delay: 0.5,
        scrollTrigger: {
          trigger: dashboardRef.current,
          start: "top 60%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            Your Command Center
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Everything in one{" "}
            <span className="text-emerald-400">beautiful dashboard</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Track issues, monitor savings, and manage your home maintenance
            like a pro.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div
          ref={dashboardRef}
          className="relative max-w-4xl mx-auto perspective-1000"
          style={{ perspective: "1000px" }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-3xl blur-2xl opacity-50" />

          {/* Dashboard container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0f0f0f] text-xs text-neutral-500">
                <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                <span>app.opportuniq.com/dashboard</span>
              </div>
              <div className="w-16" />
            </div>

            {/* Dashboard content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-14 bg-[#0f0f0f] border-r border-white/5 py-4 flex flex-col items-center gap-4">
                <OpportunIQLogo className="w-6 h-6 text-emerald-400 mb-4" />
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <IoHome className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-400 transition-colors">
                  <IoConstruct className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-400 transition-colors">
                  <IoAnalytics className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-400 transition-colors">
                  <IoWallet className="w-4 h-4" />
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 bg-[#0f0f0f]">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === i
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {mockStats.map((stat, i) => (
                    <div
                      key={i}
                      className="stat-card p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="text-xs text-neutral-500 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-emerald-400">
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Issues list */}
                <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <h3 className="text-sm font-medium text-white">
                      Recent Issues
                    </h3>
                  </div>
                  {mockIssues.map((issue, i) => (
                    <div
                      key={i}
                      className="issue-row flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-${issue.statusColor}-500/10 flex items-center justify-center`}
                        >
                          {issue.status === "Completed" ? (
                            <IoCheckmarkCircle
                              className={`w-4 h-4 text-${issue.statusColor}-400`}
                            />
                          ) : (
                            <IoAlertCircle
                              className={`w-4 h-4 text-${issue.statusColor}-400`}
                            />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-white">{issue.title}</div>
                          <div className="text-xs text-neutral-500">
                            {issue.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-emerald-400">
                        <IoTrendingUp className="w-4 h-4" />
                        {issue.savings}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
