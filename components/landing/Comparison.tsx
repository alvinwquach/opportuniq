"use client";

import { Shield, Users, Zap, Brain, DollarSign, AlertTriangle } from "lucide-react";

const differentiators = [
  {
    icon: Brain,
    title: "We do the research for you",
    description:
      "Stop juggling Home Depot, YouTube, Reddit, and contractor sites. Upload a photo and get instant answers on what's wrong, what could go wrong, where to get parts, and who can help.",
  },
  {
    icon: AlertTriangle,
    title: "Know the risks before you DIY",
    description:
      "We tell you what could go wrong if you try it yourself—water damage, electrical hazards, warranty voiding. Make informed decisions, not expensive mistakes.",
  },
  {
    icon: DollarSign,
    title: "Respect your actual budget",
    description:
      "Private budget tracking that tells you if you can afford it now or should defer. Compare rent vs. buy for tools. No more financial stress or impulse spending.",
  },
  {
    icon: Users,
    title: "Find parts and pros locally",
    description:
      "See real inventory at nearby stores (in stock, limited, out of stock). Get contractor recommendations with ratings. We show you where to get what you need—today.",
  },
  {
    icon: Zap,
    title: "Everything in one place",
    description:
      "Diagnosis, risk assessment, budget check, parts finder, contractor search, email drafts—handle the entire repair decision without switching apps.",
  },
  {
    icon: Shield,
    title: "Your data stays private",
    description:
      "End-to-end encryption for photos and budget data. Your financial information never leaves your device. We research for you without seeing your personal details.",
  },
];

export function Comparison() {
  
  return (
    <section id="why-fixsense" className="relative py-24 md:py-32 overflow-hidden bg-linear-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            Why OpportuniQ
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            Know your options. Make the call.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From broken appliances to stubborn stains to complex technical setups—we research everything so you don't have to.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((diff, i) => (
              <div
                key={i}
                className="relative p-7 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <diff.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 text-white">{diff.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {diff.description}
                </p>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
