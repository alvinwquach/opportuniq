"use client";

import { useState } from "react";
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
  CheckCircle2,
  Calendar,
  MessageSquare,
} from "lucide-react";

const workflows = [
  {
    id: "intake",
    label: "Capture",
    icon: Camera,
    title: "Show us what's wrong",
    description: "Snap a photo, record a video, voice note, or just type it out—in any language. Encrypted and secure — we only share media with contractors you approve.",
    demo: (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Camera, label: "Photo", active: true },
            { icon: Video, label: "Video" },
            { icon: Mic, label: "Voice" },
            { icon: MessageSquare, label: "Text" },
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
    label: "Calendar",
    icon: Calendar,
    title: "Coordinate schedules",
    description: "See when household members are home, working from home, or available for multi-person DIY tasks. Schedule contractor visits when someone can be there. Everyone sees the same calendar.",
    demo: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">This Week</p>
          <div className="space-y-2">
            {[
              { day: "Tue, Jan 16", event: "Sarah WFH", type: "wfh", icon: "🏠" },
              { day: "Thu, Jan 18", event: "Plumber Visit - 2-4 PM", type: "contractor", icon: "🔧" },
              { day: "Sat, Jan 20", event: "DIY Ceiling Fan (2 people)", type: "diy", icon: "👥" },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg border flex items-start gap-3",
                  item.type === "wfh" && "border-purple-500/30 bg-purple-50 dark:bg-purple-900/10",
                  item.type === "contractor" && "border-blue-500/30 bg-blue-50 dark:bg-blue-900/10",
                  item.type === "diy" && "border-green-500/30 bg-green-50 dark:bg-green-900/10"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{item.day}</p>
                  <p className="text-sm font-medium">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-primary font-medium">💡 Tip: Connect Google Calendar to sync automatically</p>
        </div>
      </div>
    ),
  },
  {
    id: "household",
    label: "Share",
    icon: Users,
    title: "Keep everyone informed",
    description: "Share repair issues with household members. Everyone can see the diagnosis, recommendations, and costs. Track shared expenses and repair history together.",
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
          <div className="mb-3">
            <span className="text-sm font-medium">Water heater replacement</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Diagnosis: Tank corroded, 15 years old</p>
            <p>• Estimated cost: $1,800-$2,400</p>
            <p>• Shared expense: Split 3 ways</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: TrendingUp,
    title: "Learn from past repairs",
    description: "See what worked, what didn't, and what it actually cost. Your repair history builds automatically so you can make better decisions next time.",
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

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("intake");
  const activeWorkflow = workflows.find((w) => w.id === activeTab)!;

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
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
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => setActiveTab(workflow.id)}
              className={
                activeTab === workflow.id
                  ? "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }
            >
              <workflow.icon className="h-4 w-4" />
              {workflow.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
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
