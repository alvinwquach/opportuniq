"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoPieChartOutline,
  IoCalculatorOutline,
  IoCheckmarkCircle,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  {
    title: "Budget Tracking",
    description: "Set monthly budgets for home maintenance. Track spending by category and stay on target.",
    icon: IoWalletOutline,
  },
  {
    title: "DIY Savings",
    description: "See exactly how much you've saved by doing it yourself. Your repair decisions, quantified.",
    icon: IoTrendingUpOutline,
  },
  {
    title: "Spending Analysis",
    description: "Visualize where your money goes. Identify patterns and optimize your maintenance spend.",
    icon: IoPieChartOutline,
  },
  {
    title: "What-If Scenarios",
    description: "Model different repair decisions. See how DIY vs hiring affects your budget over time.",
    icon: IoCalculatorOutline,
  },
];

const SPENDING_CATEGORIES = [
  { category: "Plumbing", spent: 245, budget: 300, color: "bg-blue-500" },
  { category: "Electrical", spent: 0, budget: 200, color: "bg-amber-500" },
  { category: "HVAC", spent: 150, budget: 400, color: "bg-blue-500" },
  { category: "Appliances", spent: 89, budget: 250, color: "bg-purple-500" },
  { category: "Outdoor", spent: 175, budget: 200, color: "bg-green-500" },
];

const SAVINGS_DATA = [
  { month: "Jan", diy: 120, hired: 0 },
  { month: "Feb", diy: 280, hired: 150 },
  { month: "Mar", diy: 95, hired: 0 },
  { month: "Apr", diy: 340, hired: 200 },
  { month: "May", diy: 185, hired: 0 },
  { month: "Jun", diy: 420, hired: 0 },
];

const BENEFITS = [
  "Track all repair expenses in one place",
  "See cumulative DIY savings",
  "Set category-specific budgets",
  "Share budgets with household members",
  "Export for tax purposes",
  "Income-aware recommendations",
];

export default function BudgetPage() {
  const totalSavings = SAVINGS_DATA.reduce((sum, d) => sum + d.diy, 0);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-blue-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Budget Tracking</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoWalletOutline className="w-4 h-4" />
            Budget Tracking
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Know where your{" "}
            <span className="text-blue-400">
              money goes
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Track repair expenses, visualize DIY savings, and make budget-aware
            decisions about every fix. Your home finances, simplified.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget Visualization */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Budget by category
              </h2>
              <p className="text-neutral-300 mb-8">
                Set budgets for different repair categories. Track spending in real-time
                and get alerts before you exceed limits.
              </p>

              <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-neutral-400">This Month</span>
                  <span className="text-xs text-neutral-500">$659 / $1,350</span>
                </div>
                <div className="space-y-4">
                  {SPENDING_CATEGORIES.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white">{cat.category}</span>
                        <span className="text-xs text-neutral-500">
                          ${cat.spent} / ${cat.budget}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all`}
                          style={{ width: `${(cat.spent / cat.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Track your DIY savings
              </h2>
              <p className="text-neutral-300 mb-8">
                Every time you DIY instead of hiring, we calculate your savings.
                Watch your expertise pay off over time.
              </p>

              <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-neutral-400">6-Month Savings</span>
                  <span className="text-lg font-bold text-emerald-400">${totalSavings}</span>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {SAVINGS_DATA.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5">
                        <div
                          className="w-full bg-emerald-500/80 rounded-t"
                          style={{ height: `${(d.diy / 420) * 80}px` }}
                        />
                        {d.hired > 0 && (
                          <div
                            className="w-full bg-blue-500/60 rounded-b"
                            style={{ height: `${(d.hired / 420) * 80}px` }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500">{d.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-xs text-neutral-500">DIY Savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-xs text-neutral-500">Hired Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Why track your repair budget?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-neutral-900 border border-neutral-700">
                <IoCheckmarkCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-neutral-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start saving smarter
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist and take control of your home repair finances.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}
