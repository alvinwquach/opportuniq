"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import {
  Camera,
  Mic,
  Video,
  Bot,
  Users,
  Mail,
  Search,
  TrendingUp,
  Shield,
  Vote,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const workflows = [
  {
    id: "intake",
    label: "Capture",
    icon: Camera,
    title: "Show us what's wrong",
    description: "Snap a photo, record a video, or describe it in a voice note. Encrypted and secure — we only share media with contractors you approve.",
    demo: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Camera, label: "Photo", active: true },
            { icon: Video, label: "Video" },
            { icon: Mic, label: "Voice" },
          ].map((item, i) => (
            <button
              key={i}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                item.active ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20"
              )}
            >
              <item.icon className={cn("h-6 w-6 mx-auto mb-2", item.active ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Secure upload</span>
          </div>
          <p className="text-sm text-muted-foreground">Encrypted and secure. Your photos are only shared with contractors you approve.</p>
        </div>
      </div>
    ),
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: Bot,
    title: "We identify the issue",
    description: "We analyze your input, research possible causes, and show you our confidence level. If we're uncertain, we'll ask follow-up questions before making a recommendation.",
    demo: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Hypothesis</span>
            <span className="text-xs font-mono text-primary">91% confident</span>
          </div>
          <p className="font-medium mb-2">Faulty thermocouple</p>
          <p className="text-sm text-muted-foreground">Based on: pilot light behavior, unit age (12 years), symptom pattern</p>
        </div>
        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/10">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Need more info</p>
          <p className="text-sm text-muted-foreground">Can you record a 10-second video of the ignition sequence?</p>
        </div>
      </div>
    ),
  },
  {
    id: "decide",
    label: "Decide",
    icon: TrendingUp,
    title: "Compare all options",
    description: "See DIY, hire, defer, and replace side by side. Each option shows cost ranges, time estimates, required skills, and risk levels. Run simulations based on your budget.",
    demo: (
      <div className="space-y-3">
        {[
          { option: "DIY", cost: "$35", time: "1 hour", risk: "Low", recommended: true },
          { option: "Hire Pro", cost: "$180-240", time: "Same day", risk: "None" },
          { option: "Defer", cost: "$0 now", time: "—", risk: "Medium" },
        ].map((opt, i) => (
          <div
            key={i}
            className={cn(
              "p-4 rounded-xl border flex items-center justify-between",
              opt.recommended ? "border-primary/30 bg-primary/5" : "border-border"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
                opt.recommended ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-sm">{opt.option}</p>
                {opt.recommended && <span className="text-xs text-primary">Recommended</span>}
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{opt.cost}</p>
              <p className="text-xs text-muted-foreground">{opt.time}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "execute",
    label: "Execute",
    icon: Mail,
    title: "We handle outreach",
    description: "Decided to hire? We find top-rated contractors, draft personalized emails, and send them via your Gmail or Outlook. You review before anything goes out.",
    demo: (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Found 3 plumbers near you...</span>
        </div>
        {[
          { name: "Bay Area Plumbing", rating: "4.9", price: "$$", status: "Email sent" },
          { name: "QuickFix Pro", rating: "4.7", price: "$", status: "Draft ready" },
        ].map((v, i) => (
          <div key={i} className="p-3 rounded-xl border border-border flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.rating} · {v.price}</p>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded",
              v.status === "Email sent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
            )}>
              {v.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Calendar,
    title: "Book the appointment",
    description: "Connect your calendar. We'll find times that work for you and help coordinate with contractors. No more phone tag.",
    demo: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your availability</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { day: "Mon", date: "Jan 15", available: true },
              { day: "Tue", date: "Jan 16", available: true },
              { day: "Wed", date: "Jan 17", available: false },
            ].map((d, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg text-center text-sm",
                  d.available ? "bg-primary/10 border border-primary/20" : "bg-muted text-muted-foreground"
                )}
              >
                <p className="font-medium">{d.day}</p>
                <p className="text-xs text-muted-foreground">{d.date}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Appointment confirmed</span>
          </div>
          <p className="text-sm text-muted-foreground">Bay Area Plumbing · Mon, Jan 15 at 2:00 PM</p>
        </div>
      </div>
    ),
  },
  {
    id: "household",
    label: "Collaborate",
    icon: Users,
    title: "Decide together",
    description: "Invite family members with different permissions. Everyone sees the same information. Vote on big decisions. Keep a record of who approved what.",
    demo: (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {[
            { initials: "JD", color: "bg-primary" },
            { initials: "SK", color: "bg-blue-500" },
            { initials: "MJ", color: "bg-purple-500" },
          ].map((m, i) => (
            <div key={i} className={cn("h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium text-white", m.color)}>
              {m.initials}
            </div>
          ))}
          <button className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">+</button>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Replace water heater?</span>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">2 Approve</span>
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">1 Pending</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: TrendingUp,
    title: "Learn from every fix",
    description: "Your repair history builds automatically as you use Opportuniq. See what worked, which contractors delivered, and make smarter decisions next time.",
    demo: (
      <div className="space-y-3">
        {[
          { title: "Water heater flush", desc: "DIY · Saved $180 · Jan 2024", type: "success", outcome: "Still working" },
          { title: "Garbage disposal replaced", desc: "Bay Area Plumbing · $285 · Nov 2023", type: "success", outcome: "Great work" },
          { title: "Deck staining", desc: "DIY · $120 · Aug 2023", type: "warning", outcome: "Peeling after 6mo" },
        ].map((item, i) => (
          <div key={i} className={cn(
            "p-3 rounded-xl border flex items-start justify-between gap-3",
            item.type === "success" && "border-border",
            item.type === "warning" && "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/10"
          )}>
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded shrink-0",
              item.type === "success" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              item.type === "warning" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            )}>
              {item.outcome}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState("intake");
  const activeWorkflow = workflows.find((w) => w.id === activeTab)!;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div
          ref={ref}
          className={cn("text-center mb-16 opacity-0", inView && "animate-fade-up")}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            From problem to solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every step of the process, handled. Capture, diagnose, decide, and execute — all in one place.
          </p>
        </div>

        {/* Workflow tabs */}
        <div className={cn("flex flex-wrap justify-center gap-2 mb-12 opacity-0", inView && "animate-fade-up")} style={{ animationDelay: "100ms" }}>
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => setActiveTab(workflow.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
                activeTab === workflow.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <workflow.icon className="h-4 w-4" />
              {workflow.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={cn("grid md:grid-cols-2 gap-12 lg:gap-16 items-center opacity-0", inView && "animate-fade-up")} style={{ animationDelay: "200ms" }}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <activeWorkflow.icon className="h-4 w-4" />
              {activeWorkflow.label}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              {activeWorkflow.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {activeWorkflow.description}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            {activeWorkflow.demo}
          </div>
        </div>
      </div>
    </section>
  );
}
