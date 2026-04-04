"use client";

export function FinancesSkeleton() {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg" />
        ))}
      </div>

      {/* Available Funds Card */}
      <div className="h-32 bg-gray-100 rounded-xl border border-gray-200 mb-6" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="h-64 bg-gray-100 rounded-xl border border-gray-200" />
        <div className="h-64 bg-gray-100 rounded-xl border border-gray-200" />
      </div>

      {/* More Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-48 bg-gray-100 rounded-xl border border-gray-200" />
        <div className="h-48 bg-gray-100 rounded-xl border border-gray-200" />
      </div>
    </div>
  );
}
