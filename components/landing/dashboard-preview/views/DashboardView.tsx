"use client";

import {
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoShieldOutline,
  IoWarning,
  IoConstructOutline,
  IoHomeOutline,
  IoCarOutline,
  IoFlashOutline,
  IoLeafOutline,
  IoTrendingUpOutline,
  IoPlayCircleOutline,
  IoFolderOutline,
  IoCalendarOutline,
  IoBookOutline,
  IoChevronForwardOutline,
  IoLocationOutline,
  IoStarOutline,
  IoCloudOutline,
  IoRainyOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import {
  stats,
  safetyAlerts,
  openIssues,
  recentActivity,
  outcomeSummary,
  savingsOverTime,
  activeGuides,
} from "../mockData";
import { useNavigation } from "../NavigationContext";
import { useDarkMode } from "../DarkModeContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const totalSavings = savingsOverTime[savingsOverTime.length - 1].savings;
const monthlyBudget = 800;
const totalSpent    = 485;
const remaining     = monthlyBudget - totalSpent;
const budgetPct     = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));
const circ          = 2 * Math.PI * 26;
const dashOffset    = circ * (1 - budgetPct / 100);

const priorityDot: Record<string, string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-blue-300",
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  open:          { label: "Open",     bg: "bg-blue-50",   text: "text-blue-600"  },
  investigating: { label: "Active",   bg: "bg-amber-50",  text: "text-amber-600" },
  in_progress:   { label: "Working",  bg: "bg-purple-50", text: "text-purple-600"},
  completed:     { label: "Done",     bg: "bg-gray-100",  text: "text-gray-400"  },
};

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  HVAC:       IoFlashOutline,
  Plumbing:   IoHomeOutline,
  Garage:     IoCarOutline,
  Electrical: IoFlashOutline,
  Safety:     IoShieldOutline,
  Exterior:   IoLeafOutline,
  Appliances: IoConstructOutline,
};

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, trend, up, prefix = "" }: {
  label: string; value: string | number; trend: string; up: boolean; prefix?: string;
}) {
  const dark = useDarkMode();
  return (
    <div className={`flex-1 min-w-0 px-4 py-3 border-r last:border-r-0 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
      <p className={`text-[10px] mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>{label}</p>
      <div className="flex items-end gap-2">
        <p className={`text-xl font-bold leading-none ${dark ? "text-gray-100" : "text-gray-900"}`}>
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <span className={`text-[10px] font-medium mb-0.5 ${up ? "text-green-500" : dark ? "text-gray-600" : "text-gray-400"}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

// ── Issue row ─────────────────────────────────────────────────────────────────

function IssueRow({ issue }: { issue: typeof openIssues[0] }) {
  const dark = useDarkMode();
  const st  = statusConfig[issue.status] ?? statusConfig.open;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors group cursor-pointer ${dark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-gray-100 hover:bg-gray-50"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[issue.priority] ?? "bg-gray-300"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${dark ? "text-gray-200" : "text-gray-900"}`}>{issue.title}</p>
        <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{issue.group}</p>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0 ${st.bg} ${st.text}`}>{st.label}</span>
      <IoChevronForwardOutline className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? "text-gray-600" : "text-gray-300"}`} />
    </div>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: typeof recentActivity[0] }) {
  const dark = useDarkMode();
  return (
    <div className={`flex items-start gap-2.5 py-2.5 border-b last:border-0 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${dark ? "bg-white/10" : "bg-gray-100"}`}>
        {item.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-snug ${dark ? "text-gray-400" : "text-gray-700"}`}>{item.message}</p>
        <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{item.time}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { navigate } = useNavigation();
  const dark = useDarkMode();

  const activeIssues   = openIssues.filter((i) => i.status !== "completed");
  const guidesInProgress = (activeGuides ?? []).slice(0, 3);

  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const panelBg = dark ? "bg-[#1a1a1a]" : "bg-white";
  const labelCls = dark ? "text-gray-600" : "text-gray-400";
  const headingCls = dark ? "text-gray-200" : "text-gray-900";

  return (
    <div className={`flex h-full overflow-hidden ${panelBg}`}>

      {/* ── Main panel ── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Stat bar */}
        <div className={`flex border-b ${b}`}>
          {stats.map((s) => (
            <StatPill key={s.label} label={s.label} value={s.value} trend={s.trend} up={s.up} prefix={s.prefix} />
          ))}
        </div>

        {/* Safety alert */}
        {safetyAlerts.length > 0 && (
          <div className="mx-4 mt-3 mb-0 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
              <IoWarning className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700">{safetyAlerts[0].title}</p>
              <p className="text-[10px] text-red-600/80 mt-0.5">{safetyAlerts[0].emergencyInstructions}</p>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 uppercase font-semibold flex-shrink-0">
              {safetyAlerts[0].severity}
            </span>
          </div>
        )}

        {/* Two-column body */}
        <div className="flex-1 overflow-y-auto">
          <div className={`grid grid-cols-2 gap-0 h-full divide-x ${dark ? "divide-white/[0.06]" : "divide-gray-100"}`}>

            {/* Left col: open issues */}
            <div className="flex flex-col min-h-0">
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${b}`}>
                <div className="flex items-center gap-2">
                  <IoAlertCircleOutline className={`w-3.5 h-3.5 ${labelCls}`} />
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>Open Issues</p>
                </div>
                <button onClick={() => navigate("projects")} className="text-[10px] text-blue-500 hover:text-blue-400 font-medium">
                  View all
                </button>
              </div>
              {activeIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}

              {/* Insights */}
              <div className={`mt-auto border-t ${b} p-4`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>Insights</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-blue-50 px-3 py-2">
                    <p className="text-[10px] text-blue-600 font-medium">DIY Success</p>
                    <p className="text-lg font-bold text-blue-700">{outcomeSummary.diySuccessRate}%</p>
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${dark ? "bg-white/[0.04]" : "bg-gray-50"}`}>
                    <p className={`text-[10px] font-medium ${dark ? "text-gray-500" : "text-gray-500"}`}>Avg. resolution</p>
                    <p className={`text-lg font-bold ${headingCls}`}>{outcomeSummary.avgResolutionTimeDays}d</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right col: guides + activity */}
            <div className="flex flex-col min-h-0 overflow-y-auto">
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${b}`}>
                <div className="flex items-center gap-2">
                  <IoPlayCircleOutline className={`w-3.5 h-3.5 ${labelCls}`} />
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>In Progress</p>
                </div>
                <button onClick={() => navigate("guides")} className="text-[10px] text-blue-500 hover:text-blue-400 font-medium">
                  All guides
                </button>
              </div>
              {guidesInProgress.length > 0 ? guidesInProgress.map((g: any) => (
                <div key={g.id} className={`flex items-center gap-3 px-4 py-2.5 border-b transition-colors ${dark ? `${b} hover:bg-white/[0.04]` : "border-gray-100 hover:bg-gray-50"}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <IoBookOutline className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${headingCls}`}>{g.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex-1 h-1 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-gray-100"}`}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.progress}%` }} />
                      </div>
                      <span className={`text-[10px] flex-shrink-0 ${labelCls}`}>{g.progress}%</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-6 text-center">
                  <IoBookOutline className={`w-6 h-6 mx-auto mb-1 ${dark ? "text-gray-700" : "text-gray-300"}`} />
                  <p className={`text-xs ${labelCls}`}>No active guides</p>
                </div>
              )}

              <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-t ${b} mt-1`}>
                <IoTimeOutline className={`w-3.5 h-3.5 ${labelCls}`} />
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>Activity</p>
              </div>
              <div className="px-4">
                {recentActivity.slice(0, 4).map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={`w-[200px] flex-shrink-0 border-l flex flex-col h-full ${panelBg} ${b}`}>

        {/* Budget donut */}
        <div className={`px-4 py-4 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-3 ${labelCls}`}>Budget</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
                <circle cx="30" cy="30" r="26" fill="none" stroke={dark ? "#2a2a2a" : "#f3f4f6"} strokeWidth="6" />
                <circle cx="30" cy="30" r="26" fill="none" stroke={budgetPct > 90 ? "#ef4444" : "#2563eb"} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${headingCls}`}>{budgetPct}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <p className={`text-[10px] ${labelCls}`}>Spent</p>
                <p className={`text-sm font-bold ${headingCls}`}>${totalSpent}</p>
              </div>
              <div>
                <p className={`text-[10px] ${labelCls}`}>Left</p>
                <p className="text-sm font-bold text-blue-500">${remaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${labelCls}`}>Total Saved</p>
          <p className="text-2xl font-bold text-emerald-500">${totalSavings.toLocaleString()}</p>
          <p className={`text-[10px] mt-0.5 ${labelCls}`}>{outcomeSummary.totalResolved} DIY projects</p>
        </div>

        {/* Quick actions */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>Quick Actions</p>
          <div className="space-y-1.5">
            {[
              { label: "New Project",   icon: IoFolderOutline,   view: "projects" as const },
              { label: "Schedule DIY",  icon: IoCalendarOutline, view: "calendar" as const },
              { label: "Browse Guides", icon: IoBookOutline,     view: "guides"   as const },
            ].map(({ label, icon: Icon, view }) => (
              <button
                key={label}
                onClick={() => navigate(view)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left border ${
                  dark
                    ? "text-gray-400 border-white/10 hover:bg-white/[0.06] hover:text-gray-200"
                    : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className={`px-4 py-3 border-b ${b}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>Weather</p>
            <span className={`flex items-center gap-1 text-[10px] ${labelCls}`}>
              <IoLocationOutline className="w-3 h-3" />Columbus, OH
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <IoCloudOutline className={`w-8 h-8 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-400"}`} />
            <div>
              <p className={`text-xl font-bold ${headingCls}`}>28°F</p>
              <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-500"}`}>Overcast · Feels 22°</p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1.5 rounded-lg bg-amber-50 border border-amber-100">
            <IoRainyOutline className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-medium">Snow tomorrow — reschedule exterior work</p>
          </div>
          <div className="flex justify-between mt-2">
            {[
              { day: "Tue", icon: IoCloudOutline, hi: 34, lo: 22 },
              { day: "Wed", icon: IoRainyOutline, hi: 30, lo: 20 },
              { day: "Thu", icon: IoSunnyOutline, hi: 42, lo: 28 },
            ].map(({ day, icon: Icon, hi, lo }) => (
              <div key={day} className="flex flex-col items-center gap-0.5">
                <span className={`text-[9px] ${labelCls}`}>{day}</span>
                <Icon className={`w-3.5 h-3.5 ${dark ? "text-gray-600" : "text-gray-400"}`} />
                <span className={`text-[9px] font-medium ${dark ? "text-gray-400" : "text-gray-700"}`}>{hi}°</span>
                <span className={`text-[9px] ${labelCls}`}>{lo}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby */}
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>Nearby</p>
            <span className={`text-[10px] ${labelCls}`}>ZIP 90210</span>
          </div>
          <div className={`relative w-full h-[72px] rounded-lg overflow-hidden mb-2 border ${dark ? "border-white/10" : "border-gray-200"}`}>
            <svg viewBox="0 0 160 72" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="160" height="72" fill={dark ? "#1e1e1e" : "#f8f9fa"}/>
              <rect x="0" y="0" width="50" height="28" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="55" y="0" width="45" height="28" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="105" y="0" width="55" height="28" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="0" y="34" width="35" height="38" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="40" y="34" width="55" height="38" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="100" y="34" width="60" height="38" fill={dark ? "#252525" : "#f1f3f4"} stroke={dark ? "#333" : "#e5e7eb"} strokeWidth="0.5"/>
              <rect x="0" y="28" width="160" height="6" fill={dark ? "#333" : "#e5e7eb"}/>
              <rect x="50" y="0" width="5" height="72" fill={dark ? "#333" : "#e5e7eb"}/>
              <rect x="95" y="0" width="5" height="72" fill={dark ? "#333" : "#e5e7eb"}/>
              <circle cx="72" cy="31" r="4" fill="#2563eb"/>
              <circle cx="72" cy="31" r="8" fill="#2563eb" fillOpacity="0.15"/>
              <circle cx="20" cy="14" r="4" fill="#f97316"/>
              <circle cx="118" cy="14" r="4" fill="#f97316"/>
              <circle cx="115" cy="52" r="4" fill="#10b981"/>
              <circle cx="18" cy="52" r="4" fill="#10b981"/>
              <circle cx="8" cy="66" r="3" fill="#f97316"/>
              <circle cx="22" cy="66" r="3" fill="#10b981"/>
              <circle cx="36" cy="66" r="3" fill="#2563eb"/>
            </svg>
          </div>
          <div className="flex items-center gap-3 mb-2">
            {[
              { color: "bg-orange-400", label: "Parts stores" },
              { color: "bg-emerald-500", label: "Contractors" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className={`text-[9px] ${labelCls}`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { name: "Home Depot",    dist: "0.8mi", type: "store",      badge: "bg-orange-50 text-orange-700", rating: null as number | null },
              { name: "Johnson HVAC",  dist: "1.2mi", type: "contractor", badge: "bg-green-50 text-green-700",   rating: 4.8  },
              { name: "Ace Hardware",  dist: "1.9mi", type: "store",      badge: "bg-orange-50 text-orange-700", rating: null as number | null },
              { name: "Peak Plumbing", dist: "2.1mi", type: "contractor", badge: "bg-green-50 text-green-700",   rating: 4.6  },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === "store" ? "bg-orange-50" : "bg-green-50"}`}>
                  {item.type === "store"
                    ? <IoHomeOutline className="w-3 h-3 text-orange-500" />
                    : <IoConstructOutline className="w-3 h-3 text-green-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-medium truncate ${dark ? "text-gray-300" : "text-gray-800"}`}>{item.name}</p>
                  <p className={`text-[9px] ${labelCls}`}>{item.dist}</p>
                </div>
                {item.rating !== null ? (
                  <span className={`text-[9px] px-1 py-0.5 rounded font-medium flex-shrink-0 ${item.badge}`}>
                    <IoStarOutline className="w-2.5 h-2.5 inline mr-0.5" />{item.rating}
                  </span>
                ) : (
                  <span className={`text-[9px] px-1 py-0.5 rounded font-medium flex-shrink-0 ${item.badge}`}>
                    Store
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
