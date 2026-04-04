"use client";

import { useState } from "react";
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoLeafOutline,
  IoRepeatOutline,
  IoConstructOutline,
  IoShieldOutline,
  IoHomeOutline,
  IoAddOutline,
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoFolderOutline,
  IoPeopleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import {
  initialExpenses,
  initialIncomeStreams,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
} from "./finances";
import { useDarkMode } from "../DarkModeContext";

// ── constants ─────────────────────────────────────────────────────────────────

const NOW = Date.now();
const monthlyIncome   = calculateMonthlyIncome(initialIncomeStreams);
const monthlyBudget   = 800;
const diySaved        = 1190;
const spent           = 316;
const remaining       = monthlyBudget - spent;
const budgetPct       = Math.min(100, Math.round((spent / monthlyBudget) * 100));
const circumference   = 2 * Math.PI * 30;
const dashOffset      = circumference * (1 - budgetPct / 100);

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; bar: string }> = {
  Repairs:     { icon: IoConstructOutline, color: "text-amber-600",  bg: "bg-amber-50",  bar: "bg-amber-400" },
  Maintenance: { icon: IoHomeOutline,      color: "text-blue-600",   bg: "bg-blue-50",   bar: "bg-blue-400"  },
  Insurance:   { icon: IoShieldOutline,    color: "text-indigo-600", bg: "bg-indigo-50", bar: "bg-indigo-400"},
  Utilities:   { icon: IoWalletOutline,    color: "text-gray-500",   bg: "bg-gray-100",  bar: "bg-gray-300"  },
};

const expenseCategories = ["Repairs", "Maintenance", "Insurance", "Utilities"];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconBg, iconColor, valueColor = "text-gray-900",
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string; iconColor: string; valueColor?: string;
}) {
  const dark = useDarkMode();
  return (
    <div className={`flex-1 min-w-0 px-3 py-3 border-r last:border-r-0 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-3 h-3 ${iconColor}`} />
        </div>
        <span className={`text-[9px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>{label}</span>
      </div>
      <p className={`text-base font-bold leading-none mb-0.5 ${valueColor}`}>{value}</p>
      <p className={`text-[9px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{sub}</p>
    </div>
  );
}

function TxRow({ expense }: { expense: typeof initialExpenses[0] }) {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const cfg = categoryConfig[expense.category] ?? categoryConfig.Utilities;
  const Icon = cfg.icon;
  const date = expense.date instanceof Date ? expense.date : new Date(expense.date);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const freqLabel = expense.recurringFrequency ?? (expense.isRecurring ? "recurring" : null);

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors ${b} ${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-medium leading-snug ${dark ? "text-gray-200" : "text-gray-900"}`}>{expense.description}</p>
          {expense.approvalStatus === "approved" && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-50 text-green-600 border border-green-200">
              Approved
            </span>
          )}
          {expense.approvalStatus === "pending" && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              Pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{expense.category}</span>
          {freqLabel && (
            <span className="flex items-center gap-0.5 text-[10px] text-blue-500">
              <IoRepeatOutline className="w-2.5 h-2.5" />{freqLabel}
            </span>
          )}
          {expense.issueTitle && (
            <span className={`text-[10px] truncate ${dark ? "text-gray-600" : "text-gray-400"}`}>· {expense.issueTitle}</span>
          )}
        </div>
        {expense.issueId && (
          <div className="flex items-center gap-1 mt-0.5">
            <IoFolderOutline className={`w-2.5 h-2.5 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-400"}`} />
            <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Linked to project</span>
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-900"}`}>-${expense.amount.toFixed(2)}</p>
        <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{label}</p>
      </div>
    </div>
  );
}

function IncomeRow({ stream }: { stream: typeof initialIncomeStreams[0] }) {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors ${b} ${dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
        <IoArrowUpOutline className="w-4 h-4 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${stream.isActive ? "bg-green-500" : dark ? "bg-gray-700" : "bg-gray-300"}`}
            title={stream.isActive ? "Active" : "Inactive"}
          />
          <p className={`text-sm font-medium leading-snug ${dark ? "text-gray-200" : "text-gray-900"}`}>{stream.source}</p>
        </div>
        <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{stream.description} · {stream.frequency}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-green-500">+${stream.amount.toLocaleString()}</p>
        <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>per mo</p>
      </div>
    </div>
  );
}

function SpendBar({ label, amount, max, bar }: { label: string; amount: number; max: number; bar: string }) {
  const dark = useDarkMode();
  const pct = Math.min(100, Math.round((amount / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className={dark ? "text-gray-500" : "text-gray-500"}>{label}</span>
        <span className={`font-semibold ${dark ? "text-gray-400" : "text-gray-700"}`}>${amount.toFixed(0)}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type FinanceTab = "expenses" | "income";

export function FinancesView() {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const expenses = initialExpenses;
  const [activeTab, setActiveTab] = useState<FinanceTab>("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddStream, setShowAddStream] = useState(false);

  // Add expense form state
  const [newExpDesc, setNewExpDesc] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpCategory, setNewExpCategory] = useState("Repairs");

  // Add stream form state
  const [newStreamSource, setNewStreamSource] = useState("");
  const [newStreamAmount, setNewStreamAmount] = useState("");

  const upcomingBills = expenses
    .filter((e) => e.isRecurring && e.nextDueDate)
    .sort((a, b_) => (a.nextDueDate?.getTime() ?? 0) - (b_.nextDueDate?.getTime() ?? 0));

  const spendByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {})
  ).sort((a, b_) => b_[1] - a[1]);

  const maxCat = spendByCategory[0]?.[1] ?? 1;

  const inputCls = `w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors ${
    dark
      ? "bg-white/[0.04] border-white/10 text-gray-200 placeholder:text-gray-600"
      : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"
  }`;

  return (
    <div className={`flex h-full overflow-hidden ${dark ? "bg-[#111111]" : "bg-white"}`}>

      {/* ── Left panel: Summary + Transactions ── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-xs font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>Finances</p>
          <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>April 2026</p>
        </div>

        {/* Summary bar */}
        <div className={`border-b ${b}`}>
          <div className="flex items-stretch">
            <StatCard
              label="Income"
              value={`$${monthlyIncome.toLocaleString()}`}
              sub="this month"
              icon={IoTrendingUpOutline}
              iconBg="bg-green-50"
              iconColor="text-green-500"
              valueColor="text-green-500"
            />
            <StatCard
              label="Spent"
              value={`$${spent}`}
              sub={`of $${monthlyBudget} budget`}
              icon={IoArrowDownOutline}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              valueColor={dark ? "text-gray-200" : "text-gray-900"}
            />
            <StatCard
              label="DIY Saved"
              value={`$${diySaved}`}
              sub="vs hiring pros"
              icon={IoLeafOutline}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              valueColor="text-emerald-500"
            />

            {/* Budget ring inline */}
            <div className="flex-shrink-0 px-3 py-3 flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <svg width="52" height="52" viewBox="0 0 68 68" className="-rotate-90">
                  <circle cx="34" cy="34" r="30" fill="none" stroke={dark ? "#ffffff0f" : "#f3f4f6"} strokeWidth="7" />
                  <circle
                    cx="34" cy="34" r="30"
                    fill="none"
                    stroke={budgetPct > 90 ? "#ef4444" : "#2563eb"}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[10px] font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>{budgetPct}%</span>
                </div>
              </div>
              <div>
                <p className={`text-[9px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Remaining</p>
                <p className={`text-sm font-bold ${remaining >= 0 ? "text-blue-500" : "text-red-500"}`}>
                  ${remaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Expenses | Income */}
        <div className={`flex items-center justify-between px-4 border-b ${b}`}>
          <div className="flex">
            {(["expenses", "income"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-1 mr-5 text-xs font-medium border-b-2 transition-colors -mb-px capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-500"
                    : dark ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab} {tab === "expenses" ? `(${expenses.length})` : `(${initialIncomeStreams.length})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => activeTab === "expenses" ? setShowAddExpense(true) : setShowAddStream(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <IoAddOutline className="w-3 h-3" />
            {activeTab === "expenses" ? "Add Expense" : "Add Stream"}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 scrollbar-auto-hide">
          {activeTab === "expenses" && (
            <>
              {/* Add expense form */}
              {showAddExpense && (
                <div className={`px-4 py-3 border-b ${b} ${dark ? "bg-white/[0.02]" : "bg-gray-50/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-[10px] font-semibold ${dark ? "text-gray-400" : "text-gray-500"}`}>New expense</p>
                    <button onClick={() => setShowAddExpense(false)} className={`p-0.5 rounded ${dark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                      <IoCloseOutline className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Description" value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} className={`${inputCls} flex-1`} />
                    <div className="relative w-24">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>$</span>
                      <input type="number" placeholder="0.00" value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)} className={`${inputCls} pl-6`} />
                    </div>
                    <select value={newExpCategory} onChange={(e) => setNewExpCategory(e.target.value)} className={inputCls} style={{ width: 110 }}>
                      {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex-shrink-0">
                      Add
                    </button>
                  </div>
                </div>
              )}
              {expenses.map((e) => (
                <TxRow key={e.id} expense={e} />
              ))}
            </>
          )}

          {activeTab === "income" && (
            <>
              {/* Add stream form */}
              {showAddStream && (
                <div className={`px-4 py-3 border-b ${b} ${dark ? "bg-white/[0.02]" : "bg-gray-50/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-[10px] font-semibold ${dark ? "text-gray-400" : "text-gray-500"}`}>New income stream</p>
                    <button onClick={() => setShowAddStream(false)} className={`p-0.5 rounded ${dark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                      <IoCloseOutline className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Source name" value={newStreamSource} onChange={(e) => setNewStreamSource(e.target.value)} className={`${inputCls} flex-1`} />
                    <div className="relative w-28">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>$</span>
                      <input type="number" placeholder="0" value={newStreamAmount} onChange={(e) => setNewStreamAmount(e.target.value)} className={`${inputCls} pl-6`} />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>/mo</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex-shrink-0">
                      Add
                    </button>
                  </div>
                </div>
              )}
              {initialIncomeStreams.map((s) => (
                <IncomeRow key={s.id} stream={s} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Right panel: Sidebar ── */}
      <div className={`w-[280px] flex-shrink-0 border-l flex flex-col h-full scrollbar-auto-hide ${b} ${dark ? "bg-[#141414]" : "bg-white"}`}>

        {/* By category */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-3 ${dark ? "text-gray-600" : "text-gray-400"}`}>By Category</p>
          <div className="space-y-3">
            {spendByCategory.map(([cat, amount]) => (
              <SpendBar
                key={cat}
                label={cat}
                amount={amount}
                max={maxCat}
                bar={categoryConfig[cat]?.bar ?? "bg-gray-300"}
              />
            ))}
          </div>

          {/* Category Limits */}
          <div className={`mt-3 pt-3 border-t ${b}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>Category Limits</p>
            <div className="space-y-2">
              {([
                { cat: "Repairs",     used: 180, limit: 300, bar: "bg-amber-400" },
                { cat: "Maintenance", used: 95,  limit: 150, bar: "bg-blue-400"  },
                { cat: "Insurance",   used: 120, limit: 200, bar: "bg-indigo-400"},
              ] as const).map(({ cat, used, limit, bar }) => {
                const pct = Math.min(100, Math.round((used / limit) * 100));
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className={dark ? "text-gray-500" : "text-gray-500"}>{cat}</span>
                      <span className={dark ? "text-gray-600" : "text-gray-400"}>${used}/${limit}</span>
                    </div>
                    <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project costs */}
          <div className={`mt-3 pt-3 border-t ${b}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>By Project</p>
            <div className="space-y-2">
              {[
                { project: "Leaky kitchen faucet", total: 33.48, count: 2 },
                { project: "AC maintenance", total: 132.99, count: 1 },
                { project: "Garage door", total: 0, count: 0, label: "No spend yet" },
              ].map((p) => (
                <div key={p.project} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] truncate ${dark ? "text-gray-300" : "text-gray-700"}`}>{p.project}</p>
                    <p className={`text-[9px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{p.label || `${p.count} entries`}</p>
                  </div>
                  <span className={`text-[11px] font-semibold flex-shrink-0 ${p.total > 0 ? (dark ? "text-gray-200" : "text-gray-900") : (dark ? "text-gray-600" : "text-gray-400")}`}>
                    {p.total > 0 ? `$${p.total.toFixed(2)}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming bills */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-3 ${dark ? "text-gray-600" : "text-gray-400"}`}>Upcoming Bills</p>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const due = bill.nextDueDate!;
              const daysUntil = Math.ceil((due.getTime() - NOW) / 86400000);
              const isUrgent = daysUntil <= 7;
              return (
                <div key={bill.id} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${isUrgent ? "bg-red-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium truncate ${dark ? "text-gray-300" : "text-gray-800"}`}>{bill.description}</p>
                    <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
                      {due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}
                      <span className={isUrgent ? "text-red-500 font-medium" : dark ? "text-gray-600" : "text-gray-400"}>
                        {daysUntil}d
                      </span>
                    </p>
                  </div>
                  <p className={`text-[11px] font-semibold flex-shrink-0 ${dark ? "text-gray-400" : "text-gray-700"}`}>${bill.amount}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared Pool */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-green-50">
              <IoPeopleOutline className="w-3.5 h-3.5 text-green-500" />
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Shared Pool</span>
          </div>
          <p className="text-xl font-bold leading-none mb-1 text-green-500">$1,250</p>
          <p className={`text-[10px] mb-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>2 contributors</p>
          <div className={`flex items-center gap-1 rounded-md px-2 py-1 ${dark ? "bg-green-50" : "bg-green-50"}`}>
            <IoShieldOutline className="w-3 h-3 text-green-500 flex-shrink-0" />
            <span className="text-[10px] text-green-600 font-medium">$2,000 protected</span>
          </div>
        </div>

        {/* DIY Savings */}
        <div className={`px-4 py-3 mt-auto border-t ${b}`}>
          <div className="rounded-lg border p-3 bg-emerald-50 border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-600 mb-0.5">DIY Savings</p>
            <p className="text-lg font-bold text-emerald-600">${diySaved.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600">saved vs hiring pros</p>
          </div>
        </div>
      </div>
    </div>
  );
}
