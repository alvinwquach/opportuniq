"use client";

import Link from "next/link";
import {
  IoCamera,
  IoMic,
  IoCalendar,
  IoTime,
  IoChevronForward,
  IoConstruct,
  IoPeople,
  IoGrid,
  IoAlertCircle,
  IoSettings,
  IoBook,
  IoAdd,
  IoCash,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoWarning,
  IoFlash,
  IoShield,
  IoArrowForward,
  IoTimer,
} from "react-icons/io5";

// User's financial context
const USER_FINANCIALS = {
  hourlyRate: 45, // $45/hr
  monthlyIncome: 7800,
};

// Recent decisions showing the core value - what they decided and saved
const RECENT_DECISIONS = [
  {
    id: 1,
    title: "Water heater rumbling noise",
    decision: "DIY",
    diagnosis: "Sediment buildup - flush recommended",
    proCost: 225,
    diyCost: 0,
    timeSpent: 0.75, // hours
    risk: "Low",
    date: "2 days ago",
    status: "completed",
  },
  {
    id: 2,
    title: "Garage door squeaking",
    decision: "DIY",
    diagnosis: "Needs lubrication on hinges and tracks",
    proCost: 110,
    diyCost: 15,
    timeSpent: 0.33, // hours
    risk: "Low",
    date: "5 days ago",
    status: "completed",
  },
  {
    id: 3,
    title: "AC not cooling properly",
    decision: "Hired Pro",
    diagnosis: "Refrigerant leak - requires certified technician",
    proCost: 350,
    diyCost: null, // Can't DIY
    timeSpent: 0,
    risk: "High",
    date: "1 week ago",
    status: "completed",
    whyPro: "Requires EPA certification",
  },
];

// Pending issues awaiting decision - with opportunity cost calculation
const PENDING_ISSUES = [
  {
    id: 1,
    title: "Ceiling crack in bedroom",
    urgency: "low",
    diyOption: { cost: 25, timeHours: 2 },
    proOption: { cost: 200 },
    recommendation: "DIY",
    riskLevel: "Cosmetic only",
  },
  {
    id: 2,
    title: "Dishwasher not draining",
    urgency: "moderate",
    diyOption: { cost: 0, timeHours: 0.5 },
    proOption: { cost: 150 },
    recommendation: "DIY",
    riskLevel: "Check filter first",
  },
];

const SIDEBAR_LINKS = [
  { icon: <IoGrid className="w-4 h-4" />, label: "Dashboard", active: true },
  { icon: <IoAlertCircle className="w-4 h-4" />, label: "Issues", count: 2 },
  { icon: <IoPeople className="w-4 h-4" />, label: "Groups" },
  { icon: <IoCalendar className="w-4 h-4" />, label: "Calendar" },
  { icon: <IoBook className="w-4 h-4" />, label: "Guides" },
  { icon: <IoSettings className="w-4 h-4" />, label: "Settings" },
];

export function DashboardDemo() {
  // Calculate real savings with opportunity cost
  const diyDecisions = RECENT_DECISIONS.filter(d => d.decision === "DIY");
  const totalDecisions = RECENT_DECISIONS.length;

  // Gross savings = Pro cost - DIY cost
  const grossSaved = diyDecisions.reduce((sum, d) => sum + (d.proCost - (d.diyCost || 0)), 0);

  // Time cost = hours spent * hourly rate
  const totalTimeSpent = diyDecisions.reduce((sum, d) => sum + d.timeSpent, 0);
  const timeCost = totalTimeSpent * USER_FINANCIALS.hourlyRate;

  // Net savings = Gross - opportunity cost
  const netSaved = grossSaved - timeCost;

  // Format time
  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return "1 hr";
    return `${hours} hrs`;
  };

  return (
    <section className="relative py-20 lg:py-28 bg-gray-50 overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #2563eb15 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Your Decision Ledger
          </h2>
          <p className="text-lg text-gray-600">
            Every choice tracked. Every dollar accounted for.
          </p>
        </div>

        {/* Browser Chrome */}
        <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
          {/* Browser Header */}
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-100 border-b border-gray-200">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-lg text-sm text-gray-500 border border-gray-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                www.opportuniq.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex min-h-[520px]">
            {/* Left Sidebar */}
            <div className="hidden lg:flex flex-col w-56 border-r border-gray-200 bg-white">
              {/* Logo */}
              <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#2563eb" strokeWidth="4" fill="none" />
                    <circle cx="50" cy="45" r="12" stroke="#2563eb" strokeWidth="4" fill="none" strokeDasharray="60 25" transform="rotate(-90 50 45)" />
                    <path d="M 58 53 L 68 63" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="45" r="4" fill="#2563eb" />
                  </svg>
                </div>
                <span className="text-[13px] font-semibold text-gray-900">OpportunIQ</span>
              </div>

              {/* New Issue Button */}
              <div className="px-2 py-2">
                <button className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md bg-blue-100 text-blue-600 border border-blue-200 text-[13px] font-medium hover:bg-blue-200 transition-colors">
                  <IoAdd className="w-4 h-4" />
                  New Issue
                </button>
              </div>

              {/* Nav Links */}
              <nav className="px-2 space-y-0.5">
                {SIDEBAR_LINKS.map((link, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] ${
                      link.active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {link.icon}
                      {link.label}
                    </div>
                    {link.count && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        {link.count}
                      </span>
                    )}
                  </div>
                ))}
              </nav>

              {/* Your Rate */}
              <div className="mt-auto mx-2 mb-2 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-[10px] text-blue-600 uppercase tracking-wide font-medium mb-1">Your Time Value</div>
                  <div className="text-xl font-bold text-blue-700">${USER_FINANCIALS.hourlyRate}/hr</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-emerald-600 uppercase tracking-wide font-medium mb-1">Net Saved</div>
                  <div className="text-xl font-bold text-emerald-600">${Math.round(netSaved)}</div>
                  <div className="text-[10px] text-emerald-600">after time costs</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-50 overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Welcome back, Alex</h3>
                    <p className="text-sm text-gray-500">
                      You&apos;ve made <span className="text-blue-600 font-medium">{totalDecisions} decisions</span> this month
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                    <IoCamera className="w-4 h-4" />
                    New Issue
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <IoCash className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${Math.round(netSaved)}</div>
                    <div className="text-xs text-gray-500">Net saved this month</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{diyDecisions.length}/{totalDecisions}</div>
                    <div className="text-xs text-gray-500">DIY decisions</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <IoAlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{PENDING_ISSUES.length}</div>
                    <div className="text-xs text-gray-500">Pending decisions</div>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Pending Decisions */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <IoWarning className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-gray-900">Awaiting Your Decision</span>
                      </div>
                      <span className="text-xs text-gray-500">{PENDING_ISSUES.length} issues</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {PENDING_ISSUES.map((issue) => (
                        <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{issue.riskLevel}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              issue.urgency === 'moderate'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {issue.urgency}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded text-blue-700">
                              <IoFlash className="w-3 h-3" />
                              DIY: ${issue.diyOption.cost} · {formatTime(issue.diyOption.timeHours)}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-gray-600">
                              <IoShield className="w-3 h-3" />
                              Pro: ${issue.proOption.cost}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                            <IoCheckmarkCircle className="w-3 h-3" />
                            Recommended: {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Decisions */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-gray-900">Recent Decisions</span>
                      </div>
                      <span className="text-xs text-gray-500">This month</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {RECENT_DECISIONS.slice(0, 3).map((decision) => (
                        <div key={decision.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{decision.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{decision.diagnosis}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              decision.decision === 'DIY'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {decision.decision}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {decision.decision === 'DIY' && decision.diyCost !== null ? (
                              <span className="text-emerald-600 font-medium">
                                Saved ${decision.proCost - (decision.diyCost || 0)}
                              </span>
                            ) : (
                              <span>Paid ${decision.proCost}</span>
                            )}
                            {decision.timeSpent > 0 && (
                              <span className="flex items-center gap-1">
                                <IoTimer className="w-3 h-3" />
                                {formatTime(decision.timeSpent)}
                              </span>
                            )}
                            <span>{decision.date}</span>
                          </div>
                          {decision.whyPro && (
                            <div className="mt-2 text-xs text-gray-500 italic">
                              Why pro: {decision.whyPro}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below */}
        <div className="text-center mt-8">
          <Link
            href="/product/analytics"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <span>See how decisions compound over time</span>
            <IoChevronForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
