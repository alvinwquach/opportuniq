"use client";

import { User, Users, CheckCircle2 } from "lucide-react";

export function Flexible() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-white dark:bg-slate-900">
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            Built for flexibility
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Track <span className="text-emerald-600">solo</span> or <span className="text-emerald-600">coordinate with others</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Whether it's just you or your whole group, OpportuniQ adapts to how you actually live.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group relative p-8 rounded-2xl bg-linear-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-6 right-6">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
              Personal Tracking
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Just you managing your own projects, expenses, and repairs.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Track your car repairs, home projects, and electronics
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Manage your personal budget and expenses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Keep all your repair history in one place
                </span>
              </li>
            </ul>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Example</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                "My personal projects" → Just you tracking everything
              </p>
            </div>
          </div>
          <div className="group relative p-8 rounded-2xl bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-2 border-emerald-200 dark:border-emerald-900 hover:shadow-2xl transition-all duration-300">
            <div className="absolute -top-3 right-6">
              <div className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                Popular
              </div>
            </div>
            <div className="absolute top-6 right-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
              Shared Coordination
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Invite roommates, partners, or family to track and split expenses together.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Split costs:</strong> Everyone sees shared expenses and budget
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Coordinate DIY:</strong> "Who has time Saturday to fix the dishwasher?"
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Vote together:</strong> Should we DIY or hire a pro?
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Magic link invites:</strong> Invite members instantly via email
                </span>
              </li>
            </ul>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2">Examples</p>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  "Downtown Apartment" → You + 3 roommates
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  "Mom's House" → Helping parents coordinate repairs
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Have multiple spaces?</strong> Create as many groups as you need.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
