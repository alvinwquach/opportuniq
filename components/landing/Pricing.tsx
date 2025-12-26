"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

const features = [
  "Unlimited projects and diagnoses",
  "Real-time parts & professional research",
  "Private budget tracking (encrypted)",
  "Step-by-step DIY guides",
  "Email drafts to service providers",
  "Multi-language support",
];

export function Pricing() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 overflow-hidden bg-white dark:bg-slate-900">
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight mb-3 opacity-0",
              inView && "animate-fade-up stagger-1"
            )}
          >
            Simple, transparent pricing
          </h2>
          <p
            className={cn(
              "text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto opacity-0",
              inView && "animate-fade-up stagger-2"
            )}
          >
            No hidden fees. No commissions. Just honest research.
          </p>
        </div>
        <div
          className={cn(
            "relative rounded-3xl border border-border bg-card p-8 md:p-12 opacity-0",
            inView && "animate-fade-up stagger-3"
          )}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
              <Sparkles className="h-4 w-4" />
              Early Access
            </div>
          </div>
          <div className="text-center mb-8 pt-4">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-6xl md:text-7xl font-bold">$0</span>
              <span className="text-2xl text-muted-foreground">/month</span>
            </div>
            <p className="text-lg text-muted-foreground">
              Free during beta
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" className="h-14 px-8 text-base rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25">
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required • No hidden fees • Cancel anytime
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              We don't sell parts or take commissions from service providers.
              <br />
              We just do the research so you can make better decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
