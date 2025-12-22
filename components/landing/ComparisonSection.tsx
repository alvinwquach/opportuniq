"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { Check, X, Shield, Cpu, Users, Zap } from "lucide-react";

const comparisons = [
  {
    feature: "AI-powered diagnostics",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: false,
  },
  {
    feature: "Cost vs. budget analysis",
    us: true,
    budgetApps: true,
    diyResources: false,
    contractorSites: false,
  },
  {
    feature: "DIY vs. Hire recommendation",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: false,
  },
  {
    feature: "Multi-member households",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: false,
  },
  {
    feature: "Decision voting & approval",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: false,
  },
  {
    feature: "Privacy-first (local processing)",
    us: true,
    budgetApps: false,
    diyResources: true,
    contractorSites: false,
  },
  {
    feature: "Contractor search & outreach",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: true,
  },
  {
    feature: "Price & tariff intelligence",
    us: true,
    budgetApps: false,
    diyResources: false,
    contractorSites: false,
  },
];

const differentiators = [
  {
    icon: Shield,
    title: "Privacy-first",
    description:
      "Photos and videos are processed on your device. We never see your raw media unless you share it.",
  },
  {
    icon: Cpu,
    title: "Smart recommendations",
    description:
      "We ask follow-up questions, research the issue, and explain our reasoning — not just a one-shot guess.",
  },
  {
    icon: Users,
    title: "Household collaboration",
    description:
      "Role-based permissions, voting on decisions, and a shared view so everyone's on the same page.",
  },
  {
    icon: Zap,
    title: "End-to-end execution",
    description:
      "From diagnosis to contractor outreach to scheduling — we help you act, not just decide.",
  },
];

export function ComparisonSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="compare" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={cn(
            "text-center mb-16 opacity-0",
            inView && "animate-fade-up"
          )}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            Comparison
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Why Opportuniq?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No more juggling Yelp, YouTube, Gmail, and contractor sites. Everything you need in one place.
          </p>
        </div>
        <div
          className={cn(
            "rounded-2xl border border-border/50 bg-card overflow-hidden mb-20 opacity-0",
            inView && "animate-fade-up"
          )}
          style={{ animationDelay: "100ms" }}
        >
          <div className="grid grid-cols-5 gap-4 p-4 bg-muted/30 border-b border-border/50 text-sm font-medium">
            <div>Feature</div>
            <div className="text-center text-primary">Opportuniq</div>
            <div className="text-center text-muted-foreground">Budget Apps</div>
            <div className="text-center text-muted-foreground">DIY Resources</div>
            <div className="text-center text-muted-foreground">Contractor Sites</div>
          </div>

          {/* Data rows */}
          {comparisons.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 p-4 border-b border-border/50 last:border-0 items-center text-sm"
            >
              <div>{row.feature}</div>
              <div className="flex justify-center">
                {row.us ? (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {row.budgetApps ? (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {row.diyResources ? (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {row.contractorSites ? (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((diff, i) => {
            const { ref: cardRef, inView: cardInView } = useInView({
              threshold: 0.3,
              triggerOnce: true,
            });

            return (
              <div
                key={i}
                ref={cardRef}
                className={cn(
                  "p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 opacity-0",
                  cardInView && "animate-fade-up"
                )}
                style={{ animationDelay: `${(i + 2) * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <diff.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{diff.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {diff.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
