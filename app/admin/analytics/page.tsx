import { UserGrowthChart } from "../components/UserGrowthChart";
import { WaitlistGrowthChart } from "../components/WaitlistGrowthChart";
import { CountryDistributionChart } from "../components/CountryDistributionChart";
import { IssueStatusChart } from "../components/IssueStatusChart";
import { DecisionTypeChart } from "../components/DecisionTypeChart";
import { getAnalyticsData } from "./actions";

export default async function AnalyticsPage() {
  let userGrowthData: any[] = [];
  let waitlistGrowthData: any[] = [];
  let countryData: any[] = [];
  let userTotal: any = null;
  let waitlistTotal: any = null;
  let groupsTotal: any = null;
  let issuesTotal: any = null;
  let decisionsTotal: any = null;
  let issueStatusData: any[] = [];
  let decisionTypeData: any[] = [];
  let error: string | null = null;

  try {
    const result = await getAnalyticsData();
    userGrowthData = result.userGrowthData || [];
    waitlistGrowthData = result.waitlistGrowthData || [];
    countryData = result.countryData || [];
    userTotal = result.userTotal || null;
    waitlistTotal = result.waitlistTotal || null;
    groupsTotal = result.groupsTotal || null;
    issuesTotal = result.issuesTotal || null;
    decisionsTotal = result.decisionsTotal || null;
    issueStatusData = result.issueStatusData || [];
    decisionTypeData = result.decisionTypeData || [];
  } catch (err: any) {
    error = err?.message || "Failed to load analytics";
    console.error("[Admin Analytics] Error loading analytics:", err);
  }

  if (error) {
    return (
      <div className="p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-[15px] font-medium text-white">Analytics</h1>
          <p className="text-[13px] text-[#666]">Platform growth and engagement metrics</p>
        </div>
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Analytics</h2>
          <p className="text-red-300">{error}</p>
          <p className="text-sm text-red-400 mt-2">
            This is likely a database connection issue. Check your DATABASE_URL configuration.
          </p>
        </div>
      </div>
    );
  }

  // WaitlistGrowthChart still needs the old format
  const formatWaitlistChartData = (data: { date: string; count: number }[]) => {
    const filled: { date: string; users: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isoDate = date.toISOString().split('T')[0];
      const existing = data.find(d => d.date === isoDate);
      filled.push({
        date: dateStr,
        users: existing?.count || 0,
      });
    }
    return filled;
  };

  // UserGrowthChart now handles date filling internally
  const userChartData = userGrowthData;
  const waitlistChartData = formatWaitlistChartData(waitlistGrowthData);

  const countryChartData = countryData
    .filter(c => c.country)
    .map((c, i) => ({
      name: c.country || 'Unknown',
      value: c.count,
      color: ['#5eead4', '#a78bfa', '#fbbf24', '#f87171', '#3b82f6'][i % 5],
    }));

  const statusColors: Record<string, string> = {
    open: '#3b82f6',
    in_progress: '#fbbf24',
    resolved: '#22c55e',
    closed: '#64748b',
    archived: '#374151',
  };

  const issueChartData = issueStatusData.map(item => ({
    name: item.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
    value: item.count,
    color: statusColors[item.status || 'open'] || '#64748b',
  }));

  const decisionColors: Record<string, string> = {
    diy: '#22c55e',
    hire: '#a78bfa',
    defer: '#fbbf24',
    replace: '#3b82f6',
    other: '#64748b',
  };

  const decisionChartData = decisionTypeData.map(item => ({
    name: item.decisionType?.toUpperCase() || 'Unknown',
    value: item.count,
    color: decisionColors[item.decisionType || 'other'] || '#64748b',
  }));

  return (
    <div className="p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-[15px] font-medium text-white">Analytics</h1>
        <p className="text-[13px] text-[#666]">Platform growth and engagement metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Users</p>
          <span className="text-xl font-semibold text-white">{userTotal?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Waitlist</p>
          <span className="text-xl font-semibold text-white">{waitlistTotal?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Groups</p>
          <span className="text-xl font-semibold text-white">{groupsTotal?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Issues</p>
          <span className="text-xl font-semibold text-white">{issuesTotal?.count || 0}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <p className="text-[11px] text-[#666] mb-1">Decisions</p>
          <span className="text-xl font-semibold text-white">{decisionsTotal?.count || 0}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {/* User & Waitlist Growth */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-white">User signups</h2>
              <p className="text-[11px] text-[#666]">Last 30 days</p>
            </div>
            <div className="h-[160px]">
              <UserGrowthChart data={userChartData} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-white">Waitlist signups</h2>
              <p className="text-[11px] text-[#666]">Last 30 days</p>
            </div>
            <div className="h-[160px]">
              <WaitlistGrowthChart data={waitlistChartData} />
            </div>
          </div>
        </div>

        {/* Issue & Decision Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-white">Issues by status</h2>
              <p className="text-[11px] text-[#666]">Current distribution</p>
            </div>
            {issueChartData.length > 0 ? (
              <div className="h-[160px]">
                <IssueStatusChart data={issueChartData} />
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[#666] text-[13px]">
                No issues yet
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-white">Decision types</h2>
              <p className="text-[11px] text-[#666]">DIY vs Hire vs Defer</p>
            </div>
            {decisionChartData.length > 0 ? (
              <div className="h-[160px]">
                <DecisionTypeChart data={decisionChartData} />
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[#666] text-[13px]">
                No decisions yet
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-white">Users by country</h2>
              <p className="text-[11px] text-[#666]">Geographic distribution</p>
            </div>
            {countryChartData.length > 0 ? (
              <div className="h-[160px]">
                <CountryDistributionChart data={countryChartData} />
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-[#666] text-[13px]">
                No location data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
