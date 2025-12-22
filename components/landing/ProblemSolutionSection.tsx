"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { X, Bot, Search, Mail, TrendingUp, Calendar, FileText } from "lucide-react";

const problems = [
  { text: "Paid $350 for a $12 part swap", subtext: "Most homeowners overpay by 40%" },
  { text: "DIY'd something and made it worse", subtext: "30% of DIY attempts create bigger problems" },
  { text: "Ignored a leak for 6 months", subtext: "Deferred issues cost 3-5x more" },
  { text: "Spent hours researching contractors", subtext: "Only to pick the wrong one" },
];

const capabilities = [
  {
    icon: Bot,
    title: "Diagnose & recommend",
    description: "Upload a photo or voice note. We identify the issue, estimate costs, and recommend whether to DIY, hire, or wait.",
  },
  {
    icon: Search,
    title: "Research contractors",
    description: "We search Yelp, Google, and Angi to find top-rated pros near you. Compare ratings, pricing, and reviews.",
  },
  {
    icon: Mail,
    title: "Draft & send outreach",
    description: "We draft personalized emails and send them through your Gmail or Outlook. You approve before anything goes out.",
  },
  {
    icon: Calendar,
    title: "Schedule appointments",
    description: "Connect your calendar. We'll find times that work for everyone and help coordinate with contractors.",
  },
  {
    icon: TrendingUp,
    title: "Learn what works",
    description: "Track outcomes over time. See which contractors delivered, which DIY fixes held up, and what to do differently next time.",
  },
  {
    icon: FileText,
    title: "Keep a record",
    description: "Your repair history, contractor contacts, and past decisions — all in one place for next time.",
  },
];

export function ProblemSolutionSection() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/50" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={cn("text-center mb-16 opacity-0", inView && "animate-fade-up")}
        >
          <p className="text-sm font-medium text-destructive tracking-wider uppercase mb-4">
            The Problem
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Sound familiar?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {problems.map((problem, i) => (
            <div
              key={i}
              className={cn(
                "p-5 rounded-2xl bg-card border border-border opacity-0",
                inView && "animate-fade-up"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X className="h-4 w-4 text-destructive" />
              </div>
              <p className="font-medium mb-2">{problem.text}</p>
              <p className="text-sm text-muted-foreground">{problem.subtext}</p>
            </div>
          ))}
        </div>
        <div className={cn("text-center mb-16 opacity-0", inView && "animate-fade-up")} style={{ animationDelay: "400ms" }}>
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            The Solution
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            One place for all of it
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From diagnosis to contractor outreach to scheduling — we handle the busywork so you don't have to.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, i) => (
            <div
              key={i}
              className={cn(
                "p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 opacity-0",
                inView && "animate-fade-up"
              )}
              style={{ animationDelay: `${(i + 5) * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <capability.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{capability.title}</h3>
              <p className="text-muted-foreground">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
