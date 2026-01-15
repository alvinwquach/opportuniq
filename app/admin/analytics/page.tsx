import { UserGrowthChart } from "../components/UserGrowthChart";
import { WaitlistGrowthChart } from "../components/WaitlistGrowthChart";
import { MetricCard } from "../components/MetricCard";
import { DonutChart } from "../components/DonutChart";
import { ProgressBar } from "../components/ProgressBar";
import { StatsList } from "../components/StatsList";
import { getAnalyticsData } from "./actions";

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

export default async function AnalyticsPage() {
  let data: Awaited<ReturnType<typeof getAnalyticsData>> | null = null;
  let error: string | null = null;

  try {
    data = await getAnalyticsData();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Failed to load analytics";
    console.error("[Admin Analytics] Error loading analytics:", err);
  }

  if (error || !data) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-[13px] text-[#666]">Platform metrics and insights</p>
        </div>
        <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4">
          <h2 className="text-base font-medium text-red-400 mb-1">Error Loading Analytics</h2>
          <p className="text-[13px] text-red-300/80">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  // Format user growth data for chart
  const userChartData = data.userGrowthData || [];

  const formatWaitlistChartData = (chartData: { date: string; count: number }[]) => {
    const filled: { date: string; users: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoDate = date.toISOString().split("T")[0];
      const existing = chartData.find((d) => d.date === isoDate);
      filled.push({
        date: dateStr,
        users: existing?.count || 0,
      });
    }
    return filled;
  };
  const waitlistChartData = formatWaitlistChartData(data.waitlistGrowthData || []);

  const tierColors: Record<string, string> = {
    johatsu: "#f43f5e",
    alpha: "#a855f7",
    beta: "#22c55e",
    public: "#3b82f6",
  };
  const tierData = (data.tierDistribution || []).map((item) => ({
    name: (item.tier || "unknown").charAt(0).toUpperCase() + (item.tier || "unknown").slice(1),
    value: item.count,
    color: tierColors[item.tier || "public"] || "#64748b",
  }));
  const totalTierUsers = tierData.reduce((sum, t) => sum + t.value, 0);

  const statusColors: Record<string, string> = {
    open: "#3b82f6",
    investigating: "#8b5cf6",
    options_generated: "#06b6d4",
    decided: "#f59e0b",
    in_progress: "#eab308",
    completed: "#22c55e",
    deferred: "#64748b",
  };
  const issueStatusChartData = (data.issueStatusData || []).map((item) => ({
    name: (item.status || "unknown").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: item.count,
    color: statusColors[item.status || "open"] || "#64748b",
  }));
  const totalIssues = issueStatusChartData.reduce((sum, i) => sum + i.value, 0);

  const decisionColors: Record<string, string> = {
    diy: "#22c55e",
    hire: "#a855f7",
    defer: "#f59e0b",
    replace: "#3b82f6",
  };
  const decisionChartData = (data.decisionTypeData || []).map((item) => ({
    name: (item.decisionType || "unknown").toUpperCase(),
    value: item.count,
    color: decisionColors[item.decisionType || "other"] || "#64748b",
  }));
  const totalDecisions = decisionChartData.reduce((sum, d) => sum + d.value, 0);

  const countryItems = (data.countryData || [])
    .filter((c) => c.country)
    .slice(0, 5)
    .map((c, i) => ({
      label: c.country || "Unknown",
      value: c.count,
      color: ["#5eead4", "#a78bfa", "#fbbf24", "#f87171", "#3b82f6"][i % 5],
    }));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Analytics</h1>
        <p className="text-[13px] text-[#666]">Platform metrics and insights</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Total Users"
          value={data.userTotal?.count || 0}
          icon={<UsersIcon />}
        />
        <MetricCard
          title="Waitlist"
          value={data.waitlistTotal?.count || 0}
          subtitle="Waiting for access"
          icon={<ChartIcon />}
        />
        <MetricCard
          title="Groups"
          value={data.groupsTotal?.count || 0}
          subtitle="Households"
        />
        <MetricCard
          title="Issues"
          value={data.issuesTotal?.count || 0}
          subtitle="Projects tracked"
        />
        <MetricCard
          title="Decisions"
          value={data.decisionsTotal?.count || 0}
          subtitle="Made by users"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">User Growth</h2>
            <p className="text-[11px] text-[#666]">New signups over 30 days</p>
          </div>
          <div className="h-[180px]">
            <UserGrowthChart data={userChartData} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">Waitlist Growth</h2>
            <p className="text-[11px] text-[#666]">Signups over 30 days</p>
          </div>
          <div className="h-40">
            <WaitlistGrowthChart data={waitlistChartData} />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">User Tiers</h2>
            <p className="text-[11px] text-[#666]">Distribution by access level</p>
          </div>
          <div className="h-40">
            <DonutChart data={tierData} centerValue={totalTierUsers} centerLabel="users" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tierData.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-[11px] text-[#888]">{tier.name}</span>
                <span className="text-[11px] font-medium text-white ml-auto">{tier.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">Invite Funnel</h2>
            <p className="text-[11px] text-[#666]">Admin invite conversion</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#888]">Acceptance Rate</span>
              <span className="text-[12px] font-medium text-emerald-400">{data.inviteAcceptanceRate}%</span>
            </div>
            <ProgressBar
              label="Sent"
              value={data.invitesTotal?.count || 0}
              total={data.invitesTotal?.count || 1}
              color="#3b82f6"
            />
            <ProgressBar
              label="Accepted"
              value={data.invitesAccepted?.count || 0}
              total={data.invitesTotal?.count || 1}
              color="#22c55e"
            />
            <ProgressBar
              label="Pending"
              value={data.invitesPending?.count || 0}
              total={data.invitesTotal?.count || 1}
              color="#f59e0b"
            />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">Top Regions</h2>
            <p className="text-[11px] text-[#666]">Users by country</p>
          </div>
          {countryItems.length > 0 ? (
            <StatsList items={countryItems} showBar />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#666] text-[13px]">
              No location data yet
            </div>
          )}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">Issue Status</h2>
            <p className="text-[11px] text-[#666]">Current project states</p>
          </div>
          {totalIssues > 0 ? (
            <>
              <div className="h-[140px]">
                <DonutChart data={issueStatusChartData} centerValue={totalIssues} centerLabel="issues" />
              </div>
              <div className="mt-4 space-y-2">
                {issueStatusChartData.slice(0, 4).map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-[11px] text-[#888]">{status.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#666] text-[13px]">
              No issues yet
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="mb-4">
            <h2 className="text-[13px] font-medium text-white">Decision Types</h2>
            <p className="text-[11px] text-[#666]">DIY vs Hire vs Defer</p>
          </div>
          {totalDecisions > 0 ? (
            <>
              <div className="h-35">
                <DonutChart data={decisionChartData} centerValue={totalDecisions} centerLabel="decisions" />
              </div>
              <div className="mt-4 space-y-2">
                {decisionChartData.map((decision) => (
                  <div key={decision.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: decision.color }} />
                      <span className="text-[11px] text-[#888]">{decision.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-white">{decision.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#666] text-[13px]">
              No decisions yet
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[11px] text-[#666]">Invite Rate</span>
          </div>
          <span className="text-2xl font-semibold text-emerald-400">{data.inviteAcceptanceRate}%</span>
          <p className="text-[11px] text-[#555] mt-1">of invites accepted</p>
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <span className="text-[11px] text-[#666]">Total Users</span>
          </div>
          <span className="text-2xl font-semibold text-blue-400">{data.userTotal?.count || 0}</span>
          <p className="text-[11px] text-[#555] mt-1">registered accounts</p>
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span className="text-[11px] text-[#666]">Groups</span>
          </div>
          <span className="text-2xl font-semibold text-purple-400">{data.groupsTotal?.count || 0}</span>
          <p className="text-[11px] text-[#555] mt-1">households created</p>
        </div>
        <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[11px] text-[#666]">Waitlist</span>
          </div>
          <span className="text-2xl font-semibold text-amber-400">{data.waitlistTotal?.count || 0}</span>
          <p className="text-[11px] text-[#555] mt-1">waiting for access</p>
        </div>
      </div>
    </div>
  );
}
