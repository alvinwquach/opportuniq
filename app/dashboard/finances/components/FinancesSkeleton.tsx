"use client";

export function FinancesSkeleton() {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f] animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-[#2a2a2a] rounded mb-2" />
          <div className="h-4 w-48 bg-[#2a2a2a] rounded" />
        </div>
        <div className="h-10 w-24 bg-[#2a2a2a] rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 bg-[#2a2a2a] rounded-lg" />
        ))}
      </div>

      {/* Available Funds Card */}
      <div className="h-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] mb-6" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="h-64 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
        <div className="h-64 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
      </div>

      {/* More Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-48 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
        <div className="h-48 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
      </div>
    </div>
  );
}
