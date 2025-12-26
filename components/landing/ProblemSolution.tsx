"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function ProblemSolution() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative section-spacing overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
    >
      {/* Premium pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Eden-style Badge + Typography Header */}
        <div className="mb-20 max-w-4xl">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 label-category mb-6 opacity-0",
              inView && "animate-fade-up stagger-1"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Every decision, simplified
          </div>
          <h2
            className={cn(
              "headline-lg font-display text-navy dark:text-white text-balance mb-5 opacity-0",
              inView && "animate-fade-up stagger-2"
            )}
          >
            The workspace for{" "}
            <span className="gradient-text-primary">smarter decisions.</span>
          </h2>
          <p
            className={cn(
              "body-xl text-slate-600 dark:text-slate-400 opacity-0",
              inView && "animate-fade-up stagger-3"
            )}
          >
            From fixing what's broken to building what's next—see every option, understand the trade-offs, and choose what's right for you.
          </p>
        </div>

        {/* Asymmetric Feature Layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Main Features - Vertical Stack */}
          <div className="lg:col-span-7 space-y-12">
            {/* Feature 1 */}
            <div
              className={cn(
                "opacity-0",
                inView && "animate-fade-up stagger-3"
              )}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-600 mt-2" />
                <div>
                  <h3 className="headline-md font-display text-navy dark:text-white mb-3">
                    Answer the real questions
                  </h3>
                  <p className="body-lg text-slate-600 dark:text-slate-400">
                    Can I fix this myself? Should I just pay someone? Will what I have go to waste if I don't act now? Is this worth my time or money? We help you answer all of them.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className={cn(
                "opacity-0",
                inView && "animate-fade-up stagger-4"
              )}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-600 mt-2" />
                <div>
                  <h3 className="headline-md font-display text-navy dark:text-white mb-3">
                    Understand the trade-offs
                  </h3>
                  <p className="body-lg text-slate-600 dark:text-slate-400">
                    Every choice has consequences. We show you what you're saving, what you're risking, and what you might be giving up—so you can decide with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Supporting Features - Clean List */}
          <div className="lg:col-span-5">
            <div
              className={cn(
                "space-y-8 opacity-0",
                inView && "animate-fade-up stagger-5"
              )}
            >
              {/* Supporting Feature 1 */}
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                <h4 className="subhead-md text-navy dark:text-white mb-2">
                  Budget-aware
                </h4>
                <p className="body-md text-slate-600 dark:text-slate-400">
                  See if you can afford it now, or if waiting makes more sense. Track spending privately.
                </p>
              </div>

              {/* Supporting Feature 2 */}
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                <h4 className="subhead-md text-navy dark:text-white mb-2">
                  Local context
                </h4>
                <p className="body-md text-slate-600 dark:text-slate-400">
                  Parts in stock nearby. Contractors with real reviews. No endless scrolling.
                </p>
              </div>

              {/* Supporting Feature 3 */}
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                <h4 className="subhead-md text-navy dark:text-white mb-2">
                  Complete picture
                </h4>
                <p className="body-md text-slate-600 dark:text-slate-400">
                  Diagnosis, safety warnings, cost ranges, and next steps—all in one place.
                </p>
              </div>

              {/* Supporting Feature 4 */}
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                <h4 className="subhead-md text-navy dark:text-white mb-2">
                  Ready to act
                </h4>
                <p className="body-md text-slate-600 dark:text-slate-400">
                  Step-by-step guides for DIY. Pre-written emails for pros. Start immediately.
                </p>
              </div>

              {/* Supporting Feature 5 */}
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                <h4 className="subhead-md text-navy dark:text-white mb-2">
                  Your data, protected
                </h4>
                <p className="body-md text-slate-600 dark:text-slate-400">
                  End-to-end encryption for sensitive data. Photos, videos, budget info—everything stays private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
