"use client";

export function GroupsSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-[#0f0f0f] animate-pulse">
      {/* Left Sidebar */}
      <div className="w-[280px] flex-shrink-0 p-4 border-r border-[#2a2a2a]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-16 bg-[#2a2a2a] rounded mb-1" />
            <div className="h-3 w-32 bg-[#1f1f1f] rounded" />
          </div>
          <div className="h-8 w-14 bg-[#2a2a2a] rounded-lg" />
        </div>

        {/* Group Cards */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#2a2a2a]" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-[#2a2a2a] rounded mb-1" />
                    <div className="h-3 w-20 bg-[#1f1f1f] rounded" />
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-6 h-6 rounded-full bg-[#333] border-2 border-[#1a1a1a]" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-12 bg-[#1f1f1f] rounded" />
                  <div className="h-8 w-12 bg-[#1f1f1f] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="h-6 w-8 bg-[#2a2a2a] rounded mx-auto mb-1" />
              <div className="h-3 w-12 bg-[#1f1f1f] rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-6 w-16 bg-[#2a2a2a] rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-[#1f1f1f] rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-6 w-32 bg-[#2a2a2a] rounded mb-2" />
            <div className="h-4 w-48 bg-[#1f1f1f] rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-[#2a2a2a] rounded-lg" />
            <div className="h-9 w-20 bg-[#2a2a2a] rounded-lg" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-12 bg-[#1f1f1f] rounded" />
              </div>
              <div className="h-6 w-8 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>

        {/* Members Section */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden mb-5">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
            <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
            <div className="h-4 w-20 bg-[#1f1f1f] rounded" />
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg min-w-[200px] border border-[#2a2a2a]">
                  <div className="w-10 h-10 rounded-full bg-[#333]" />
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-[#2a2a2a] rounded mb-1" />
                    <div className="h-3 w-20 bg-[#1f1f1f] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
              <div className="h-4 w-32 bg-[#2a2a2a] rounded mb-3" />
              <div className="h-32 bg-[#0f0f0f] rounded" />
            </div>
          ))}
        </div>

        {/* Recent Section */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
              </div>
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2.5 p-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a2a]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#2a2a2a] rounded mb-1" />
                      <div className="h-3 w-24 bg-[#1f1f1f] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
