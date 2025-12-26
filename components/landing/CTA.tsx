"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

export function CTA() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
  
    <section
      ref={sectionRef}
      className="relative py-32 md:py-40 overflow-hidden bg-linear-to-b from-emerald-50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 opacity-0",
            inView && "animate-fade-up stagger-1"
          )}
        >
          Ready to make{" "}
          <span className="text-emerald-600">better decisions?</span>
        </h2>

        <p
          className={cn(
            "text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto opacity-0",
            inView && "animate-fade-up stagger-2"
          )}
        >
          Every repair, setup, and maintenance decision—researched, compared, and ready for you to act on.
        </p>
        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 opacity-0",
            inView && "animate-fade-up stagger-3"
          )}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base rounded-xl border-2"
          >
            See How It Works
          </Button>
        </div>
        <p
          className={cn(
            "text-sm text-slate-500 dark:text-slate-500 opacity-0",
            inView && "animate-fade-up stagger-4"
          )}
        >
          No credit card required · No hidden fees · Cancel anytime
        </p>
        <div
          className={cn(
            "mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 opacity-0",
            inView && "animate-fade-up stagger-6"
          )}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Questions? We're here to help.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="/faq" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Read FAQ
            </a>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Contact Support
            </a>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
