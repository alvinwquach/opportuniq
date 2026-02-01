import { getWaitlistData } from "./actions";
import {
  IoMail,
  IoTime,
  IoCalendar,
  IoGlobe,
} from "react-icons/io5";
import { SourceDistributionChart, SignupsTrendChart, ConversionFunnelChart } from "./charts";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  landing: { label: "Landing Page", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  website: { label: "Website", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  referral: { label: "Referral", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  social: { label: "Social Media", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  direct: { label: "Direct", color: "text-gray-400", bg: "bg-gray-500/10" },
};

function getSourceConfig(source: string | null) {
  const key = (source || "direct").toLowerCase();
  return SOURCE_CONFIG[key] || { label: source || "Direct", color: "text-gray-400", bg: "bg-gray-500/10" };
}

interface WaitlistEntry {
  id: string;
  email: string;
  source: string | null;
  createdAt: Date;
}

interface SourceBreakdown {
  source: string | null;
  count: number;
}

interface ConversionStats {
  total: number;
  converted: number;
  pending: number;
  conversionRate: number;
}

export default async function WaitlistPage() {
  let waitlistEntries: WaitlistEntry[] = [];
  let todaySignups: { count: number } | null = null;
  let weekSignups: { count: number } | null = null;
  let sourceBreakdown: SourceBreakdown[] = [];
  let conversionStats: ConversionStats = { total: 0, converted: 0, pending: 0, conversionRate: 0 };
  let error: string | null = null;

  try {
    const result = await getWaitlistData();
    waitlistEntries = result.waitlistEntries || [];
    todaySignups = result.todaySignups || null;
    weekSignups = result.weekSignups || null;
    sourceBreakdown = result.sourceBreakdown || [];
    conversionStats = result.conversionStats || { total: 0, converted: 0, pending: 0, conversionRate: 0 };
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load waitlist";
    console.error("[Admin Waitlist] Error loading waitlist:", err);
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-white">Waitlist</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Manage waitlist signups</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <h2 className="text-sm font-medium text-red-400">Error Loading Waitlist</h2>
          </div>
          <p className="text-xs text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Signups",
      value: waitlistEntries.length,
      icon: IoMail,
      color: "emerald",
    },
    {
      label: "Today",
      value: todaySignups?.count || 0,
      icon: IoTime,
      color: "emerald",
    },
    {
      label: "This Week",
      value: weekSignups?.count || 0,
      icon: IoCalendar,
      color: "emerald",
    },
    {
      label: "Sources",
      value: sourceBreakdown.length,
      icon: IoGlobe,
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "bg-emerald-500/20", text: "text-emerald-400" },
  };

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#111111] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Waitlist</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">Manage waitlist signups</p>
        </div>
        <span className="px-2 py-1 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-400 self-start sm:self-auto">
          {waitlistEntries.length} waiting
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${colors.bg} ${colors.border} border rounded-lg p-3 transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                </div>
              </div>
              <p className="text-[10px] text-[#888] mb-0.5">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SignupsTrendChart entries={waitlistEntries} />
        <SourceDistributionChart sourceBreakdown={sourceBreakdown} total={waitlistEntries.length} />
        <ConversionFunnelChart stats={conversionStats} />
      </div>

      {/* Traffic Sources */}
      {sourceBreakdown.length > 0 && (
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-white">Traffic Sources</h2>
            <p className="text-[10px] text-[#666]">Where waitlist signups are coming from</p>
          </div>
          <div className="space-y-3">
            {sourceBreakdown.map((source, i) => {
              const config = getSourceConfig(source.source);
              const percentage = waitlistEntries.length > 0
                ? Math.round((source.count / waitlistEntries.length) * 100)
                : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-[#555]">{percentage}%</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{source.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-emerald-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signups Table */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">All Signups</h2>
          <p className="text-[10px] text-[#666]">{waitlistEntries.length} people waiting for access</p>
        </div>
        {waitlistEntries.length === 0 ? (
          <div className="p-8 text-center">
            <IoMail className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-xs text-[#666]">No waitlist entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-[10px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {waitlistEntries.map((entry) => {
                  const config = getSourceConfig(entry.source);
                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs text-white">{entry.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-medium px-2 py-1 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#888]">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          <span className="text-[#555] ml-2">
                            {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
