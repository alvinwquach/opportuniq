import { getWaitlistData } from "./actions";

export default async function Waitlist() {
  let waitlistEntries: any[] = [];
  let todaySignups: any = null;
  let weekSignups: any = null;
  let sourceBreakdown: any[] = [];
  let error: string | null = null;

  try {
    const result = await getWaitlistData();
    waitlistEntries = result.waitlistEntries || [];
    todaySignups = result.todaySignups || null;
    weekSignups = result.weekSignups || null;
    sourceBreakdown = result.sourceBreakdown || [];
  } catch (err: any) {
    error = err?.message || "Failed to load waitlist";
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
        <div className="grid lg:grid-cols-4 gap-3 mb-4">
          {sourceBreakdown.map((source, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#888]">{source.source || 'Direct'}</span>
                <span className="text-[15px] font-semibold text-white">{source.count}</span>
              </div>
              <div className="h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5eead4] rounded-full"
                  style={{ width: `${(source.count / waitlistEntries.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-lg bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        {waitlistEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-[#666]">No waitlist entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Email</th>
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Source</th>
                  <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {waitlistEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-white">{entry.email}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#5eead4]/15 text-[#5eead4]">
                        {entry.source || "website"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#888]">
                        {entry.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
