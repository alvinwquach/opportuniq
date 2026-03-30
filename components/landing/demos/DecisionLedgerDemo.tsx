"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Decision Ledger Timeline Demo
 *
 * Interaction: A scrollable timeline of past decisions. Click any entry to see
 * what was decided, why, and what the outcome was. Running savings total at top.
 *
 * 5-second insight: "I can actually track what I've done. No more forgetting what worked."
 *
 * Why it converts: Shows long-term value. Users see the product as an investment
 * in their decision-making history, not just a one-time tool.
 */

interface Decision {
  id: string;
  date: string;
  issue: string;
  decision: "diy" | "outsource" | "defer";
  outcome: "success" | "partial" | "failed";
  timeSaved: number; // hours
  moneySaved: number; // dollars
  notes: string;
}

const SAMPLE_DECISIONS: Decision[] = [
  {
    id: "1",
    date: "Dec 28",
    issue: "Dishwasher not draining",
    decision: "diy",
    outcome: "success",
    timeSaved: 0,
    moneySaved: 150,
    notes: "Cleared food trap. 25 minutes.",
  },
  {
    id: "2",
    date: "Dec 15",
    issue: "Furnace clicking noise",
    decision: "outsource",
    outcome: "success",
    timeSaved: 4,
    moneySaved: 0,
    notes: "Called HVAC tech. Igniter replaced.",
  },
  {
    id: "3",
    date: "Dec 8",
    issue: "Garage door squeaking",
    decision: "diy",
    outcome: "success",
    timeSaved: 2,
    moneySaved: 120,
    notes: "WD-40 on tracks. 15 minutes.",
  },
  {
    id: "4",
    date: "Nov 30",
    issue: "Leaky kitchen faucet",
    decision: "defer",
    outcome: "partial",
    timeSaved: 0,
    moneySaved: 0,
    notes: "Scheduled for January. Using bucket.",
  },
  {
    id: "5",
    date: "Nov 22",
    issue: "Clogged bathroom sink",
    decision: "diy",
    outcome: "success",
    timeSaved: 1,
    moneySaved: 100,
    notes: "Drain snake. Hair clog.",
  },
  {
    id: "6",
    date: "Nov 10",
    issue: "AC filter replacement",
    decision: "diy",
    outcome: "success",
    timeSaved: 0,
    moneySaved: 40,
    notes: "Bought 4-pack filters. 5 minutes.",
  },
];

const DECISION_COLORS = {
  diy: "#00FF88",
  outsource: "#FF8800",
  defer: "#888888",
};

const OUTCOME_LABELS = {
  success: { text: "Resolved", color: "#00FF88" },
  partial: { text: "Pending", color: "#FF8800" },
  failed: { text: "Issue", color: "#FF4444" },
};

export function DecisionLedgerDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);


  // Animate entries appearing
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setVisibleCount(prev => {
        if (prev >= SAMPLE_DECISIONS.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Calculate totals
  const totals = SAMPLE_DECISIONS.reduce(
    (acc, d) => ({
      moneySaved: acc.moneySaved + d.moneySaved,
      decisions: acc.decisions + 1,
      diyCount: acc.diyCount + (d.decision === "diy" ? 1 : 0),
    }),
    { moneySaved: 0, decisions: 0, diyCount: 0 }
  );

  const handleDecisionClick = (decision: Decision) => {
    setSelectedDecision(selectedDecision?.id === decision.id ? null : decision);
  };


  return (
    <section className="relative py-16 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Content */}
          <div className="md:sticky md:top-24">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Every Decision, Logged
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed mb-4">
              Click any entry to see the full story. Watch your savings add up over time.
            </p>
            <p className="text-sm text-neutral-600 mb-8">
              Next time it happens, you&apos;ll know exactly what you did.
            </p>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-[#00FF88]">
                  ${totals.moneySaved}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Total Saved</div>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-[#00F0FF]">
                  {totals.decisions}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Decisions</div>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                <div className="text-2xl font-mono font-bold text-white">
                  {Math.round((totals.diyCount / totals.decisions) * 100)}%
                </div>
                <div className="text-xs text-neutral-500 mt-1">DIY Rate</div>
              </div>
            </div>
          </div>

          {/* Timeline Demo */}
          <div ref={containerRef}>
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4 max-h-[480px] overflow-y-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-800" />

                {/* Entries */}
                <div className="space-y-2">
                  {SAMPLE_DECISIONS.slice(0, visibleCount).map((decision, index) => {
                    const isSelected = selectedDecision?.id === decision.id;
                    const decisionColor = DECISION_COLORS[decision.decision];
                    const outcomeInfo = OUTCOME_LABELS[decision.outcome];

                    return (
                      <div
                        key={decision.id}
                        onClick={() => handleDecisionClick(decision)}
                        className={`relative pl-8 pr-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-neutral-800/80"
                            : "bg-neutral-900/30 hover:bg-neutral-900/60"
                        }`}
                        style={{
                          opacity: index < visibleCount ? 1 : 0,
                          transform: index < visibleCount ? "translateX(0)" : "translateX(-10px)",
                          transition: "opacity 0.3s, transform 0.3s",
                        }}
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute left-1 top-4 w-5 h-5 rounded-full border-2 bg-black"
                          style={{ borderColor: decisionColor }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm text-white font-medium">{decision.issue}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{decision.date}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor: `${decisionColor}15`,
                                color: decisionColor,
                              }}
                            >
                              {decision.decision.toUpperCase()}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${outcomeInfo.color}15`,
                                color: outcomeInfo.color,
                              }}
                            >
                              {outcomeInfo.text}
                            </span>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Notes</span>
                              <span className="text-neutral-300 text-right max-w-[200px]">
                                {decision.notes}
                              </span>
                            </div>
                            {decision.moneySaved > 0 && (
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Saved</span>
                                <span className="text-[#00FF88] font-mono">
                                  ${decision.moneySaved}
                                </span>
                              </div>
                            )}
                            {decision.timeSaved > 0 && (
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Time freed</span>
                                <span className="text-[#00F0FF] font-mono">
                                  {decision.timeSaved}h
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
