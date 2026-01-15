import { getWaitlistData } from "./actions";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  landing: { label: "Landing Page", color: "text-blue-400", bg: "bg-blue-400/15" },
  website: { label: "Website", color: "text-emerald-400", bg: "bg-emerald-400/15" },
  referral: { label: "Referral", color: "text-purple-400", bg: "bg-purple-400/15" },
  social: { label: "Social Media", color: "text-pink-400", bg: "bg-pink-400/15" },
  direct: { label: "Direct", color: "text-gray-400", bg: "bg-gray-400/15" },
};

function getSourceConfig(source: string | null) {
  const key = (source || "direct").toLowerCase();
  return SOURCE_CONFIG[key] || { label: source || "Direct", color: "text-gray-400", bg: "bg-gray-400/15" };
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

export default async function WaitlistPage() {
  let waitlistEntries: WaitlistEntry[] = [];
  let todaySignups: { count: number } | null = null;
  let weekSignups: { count: number } | null = null;
  let sourceBreakdown: SourceBreakdown[] = [];
  let error: string | null = null;

  try {
    const result = await getWaitlistData();
    waitlistEntries = result.waitlistEntries || [];
    todaySignups = result.todaySignups || null;
    weekSignups = result.weekSignups || null;
    sourceBreakdown = result.sourceBreakdown || [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load waitlist";
    console.error("[Admin Waitlist] Error loading waitlist:", err);
  }

  if (error) {
    return (
      <div className="p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-[15px] font-medium text-white">Waitlist</h1>
          <p className="text-[13px] text-[#666]">Manage waitlist signups</p>
        </div>
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Waitlist</h2>
          <p className="text-red-300">{error}</p>
          <p className="text-sm text-red-400 mt-2">
            This is likely a database connection issue. Check your DATABASE_URL configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-[15px] font-medium text-white">Waitlist</h1>
        <p className="text-[13px] text-[#666]">Manage waitlist signups</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Total Signups</p>
          <span className="text-xl font-semibold text-white">{waitlistEntries.length}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Today</p>
          <span className="text-xl font-semibold text-white">{todaySignups?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">This Week</p>
          <span className="text-xl font-semibold text-white">{weekSignups?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Sources</p>
          <span className="text-xl font-semibold text-white">{sourceBreakdown.length}</span>
        </div>
      </div>
      {sourceBreakdown.length > 0 && (
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] mb-4">
          <div className="mb-3">
            <h2 className="text-[13px] font-medium text-white">Traffic Sources</h2>
            <p className="text-[11px] text-[#666]">Where waitlist signups are coming from</p>
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
                      <span className={`text-[13px] font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-[11px] text-[#555]">{percentage}%</span>
                    </div>
                    <span className="text-[15px] font-semibold text-white">{source.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${config.bg.replace('/15', '')}`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.color.includes('blue') ? '#60a5fa'
                          : config.color.includes('emerald') ? '#34d399'
                          : config.color.includes('purple') ? '#a78bfa'
                          : config.color.includes('pink') ? '#f472b6'
                          : '#9ca3af'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="rounded-lg bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f1f1f]">
          <h2 className="text-[13px] font-medium text-white">All Signups</h2>
          <p className="text-[11px] text-[#666]">{waitlistEntries.length} people waiting for access</p>
        </div>
        {waitlistEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-[#666]">No waitlist entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  <th className="text-left text-[11px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-[11px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-[11px] font-medium text-[#666] uppercase tracking-wider px-4 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {waitlistEntries.map((entry) => {
                  const config = getSourceConfig(entry.source);
                  return (
                    <tr key={entry.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-white">{entry.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-1 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-[#666]">
                          {entry.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          <span className="text-[#444] ml-2">
                            {entry.createdAt.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
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
