"use client";

import { useState } from "react";
import { Section, AnimatedElement } from "./shared";
import { cn } from "@/lib/utils";
import {
  Brain,
  Search,
  TrendingUp,
  Users,
  Wrench,
  HardHat,
  Timer,
  Star,
  Globe,
  Mail,
  AlertTriangle,
  Vote,
  Crown,
  UserCheck,
} from "lucide-react";

const features = [
  {
    id: "decisions",
    label: "Smart Decisions",
    icon: Brain,
    title: "DIY, hire, or wait?",
    description: "Every recommendation considers your budget, skill level, and time. No more guessing.",
    visual: (
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">DIY</p>
              <p className="text-xs text-muted-foreground">Recommended</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">$8</p>
            <p className="text-xs text-muted-foreground">30 min</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/50 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-3">
            <HardHat className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium">Hire pro</p>
          </div>
          <p className="font-semibold">$150</p>
        </div>
        <div className="p-4 rounded-xl border border-border/50 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium">Wait</p>
          </div>
          <p className="text-sm text-destructive">Not recommended</p>
        </div>
      </div>
    ),
  },
  {
    id: "vendors",
    label: "Find Contractors",
    icon: Search,
    title: "Vetted pros, instantly",
    description: "We search Yelp, Google, Angi, and more. You get a curated list with ratings and pricing.",
    visual: (
      <div className="space-y-3">
        {[
          { name: "ABC Plumbing", rating: 4.9, reviews: 234, price: "$$", best: true },
          { name: "QuickFix Pro", rating: 4.7, reviews: 156, price: "$" },
          { name: "HomeServe", rating: 4.5, reviews: 89, price: "$$" },
        ].map((v, i) => (
          <div key={i} className={cn(
            "p-3 rounded-xl border flex items-center justify-between",
            v.best ? "border-primary/30 bg-primary/5" : "border-border/50"
          )}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{v.name}</p>
                {v.best && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Best</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {v.rating} ({v.reviews}) · {v.price}
              </div>
            </div>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "pricing",
    label: "Price Intelligence",
    icon: TrendingUp,
    title: "Buy now or wait?",
    description: "Tariff tracking, seasonal trends, and rebate deadlines. Know the best time to buy.",
    visual: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Price increase coming</p>
              <p className="text-xs text-muted-foreground mt-1">Steel tariffs effective March 1</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Now</p>
            <p className="font-bold text-primary">$1,400</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-muted-foreground">March</p>
            <p className="font-bold text-yellow-600 dark:text-yellow-500">$1,650</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">June</p>
            <p className="font-bold">$1,500</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "household",
    label: "Household",
    icon: Users,
    title: "Decide together",
    description: "Invite family members with role-based permissions. Vote on big decisions.",
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {[
            { initials: "AL", color: "bg-primary/10 text-primary" },
            { initials: "JM", color: "bg-blue-500/10 text-blue-500" },
            { initials: "SK", color: "bg-purple-500/10 text-purple-500" },
          ].map((m, i) => (
            <div key={i} className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium", m.color)}>
              {m.initials}
            </div>
          ))}
          <div className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-lg">+</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-sm">Replace HVAC?</p>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Vote className="h-3 w-3" /> 2/3 voted
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
              <Crown className="h-3 w-3" /> Buy now
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> Wait
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("decisions");
  const activeFeature = features.find((f) => f.id === activeTab)!;

  return (
    <Section background="muted">
      <AnimatedElement>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground">
            One app for smarter household decisions
          </p>
        </div>
      </AnimatedElement>
      <AnimatedElement delay={100}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
                  activeTab === feature.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                <feature.icon className="h-4 w-4" />
                {feature.label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {activeFeature.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {activeFeature.description}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
              {activeFeature.visual}
            </div>
          </div>
        </div>
      </AnimatedElement>
    </Section>
  );
}
