"use client";

import { Upload, ArrowRight, DollarSign, CheckCircle } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative section-spacing overflow-hidden bg-linear-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 label-category mb-6">
            <Upload className="h-4 w-4" />
            How it works
          </div>
          <h2 className="headline-lg font-display text-navy dark:text-white text-balance mb-4">
            Everything you need to <span className="gradient-text-primary">make the right call</span>
          </h2>
          <p className="body-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your problem, see all options, and act immediately.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto">
          <div className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 shadow-premium border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:shadow-premium-lg group-hover:-translate-y-1 transition-all duration-300">
                <Upload className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="headline-sm font-display text-navy dark:text-white mb-4">
                Share your problem
              </h3>
              <p className="body-lg text-slate-600 dark:text-slate-400 mb-6">
                Upload a photo, video, or describe what you want to fix, build, or maintain.
              </p>
              <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="aspect-video rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Photo, video, or description
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute top-32 -right-4 text-slate-300 dark:text-slate-700">
              <ArrowRight className="h-8 w-8" />
            </div>
          </div>
          <div className="relative group">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 shadow-premium border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:shadow-premium-lg group-hover:-translate-y-1 transition-all duration-300">
                <DollarSign className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="headline-sm font-display text-navy dark:text-white mb-4">
                See your options
              </h3>
              <p className="body-lg text-slate-600 dark:text-slate-400 mb-6">
                See DIY and professional options side-by-side with costs, risks, and trade-offs for each.
              </p>
              <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">DIY</span>
                  <span className="text-emerald-600 font-bold">$45-120</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Hire Pro</span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">$200-400</span>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-center">
                    Trade-offs explained
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute top-32 -right-4 text-slate-300 dark:text-slate-700">
              <ArrowRight className="h-8 w-8" />
            </div>
          </div>
          <div className="group">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 shadow-premium border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:shadow-premium-lg group-hover:-translate-y-1 transition-all duration-300">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="headline-sm font-display text-navy dark:text-white mb-4">
                Make your decision
              </h3>
              <p className="body-lg text-slate-600 dark:text-slate-400 mb-6">
                Get step-by-step DIY guides or vetted professionals near you. Start immediately.
              </p>
              <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-xs font-medium text-center">
                  Step-by-step guide
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-xs font-medium text-center">
                  Find parts nearby
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-xs font-medium text-center">
                  Contact contractors
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Works for automotive repairs, home maintenance, DIY projects, electronics, and more
          </p>
        </div>
      </div>
    </section>
  );
}
