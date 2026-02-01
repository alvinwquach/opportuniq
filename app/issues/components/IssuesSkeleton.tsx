"use client";

export function IssuesSkeleton() {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] animate-pulse">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 w-32 bg-[#2a2a2a] rounded-lg mb-2" />
            <div className="h-4 w-48 bg-[#1f1f1f] rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-[#2a2a2a] rounded-xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2a]" />
                <div>
                  <div className="h-6 w-16 bg-[#2a2a2a] rounded-lg mb-1" />
                  <div className="h-3 w-20 bg-[#1f1f1f] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="h-4 w-24 bg-[#2a2a2a] rounded-lg mb-2" />
              <div className="h-3 w-32 bg-[#1f1f1f] rounded-lg mb-4" />
              <div className="h-32 bg-[#1f1f1f] rounded-lg" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 flex-1 max-w-md bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
            ))}
            <div className="h-6 w-px bg-[#2a2a2a]" />
            <div className="h-10 w-32 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
            <div className="h-10 w-24 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        <div className="h-4 w-32 bg-[#2a2a2a] rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2a]" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-[#2a2a2a] rounded-lg mb-2" />
                  <div className="h-3 w-1/2 bg-[#1f1f1f] rounded-lg" />
                </div>
              </div>
              <div className="h-20 bg-[#0f0f0f] rounded-lg mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-[#2a2a2a] rounded-lg" />
                <div className="h-4 w-16 bg-[#1f1f1f] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
