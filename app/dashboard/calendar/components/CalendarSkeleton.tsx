"use client";

export function CalendarSkeleton() {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-[#0f0f0f] animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-7 w-36 bg-[#1a1a1a] rounded-lg" />
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-[#1a1a1a] rounded" />
            <div className="h-8 w-8 bg-[#1a1a1a] rounded" />
          </div>
          <div className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
          <div className="h-8 w-32 bg-[#1a1a1a] rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-[#1a1a1a] rounded-lg" />
          <div className="h-9 w-20 bg-[#1a1a1a] rounded-lg" />
          <div className="h-9 w-24 bg-emerald-600/30 rounded-lg" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-7 w-20 bg-[#1a1a1a] rounded-lg" />
        ))}
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid xl:grid-cols-4 gap-6">
        {/* Calendar + Charts Column */}
        <div className="xl:col-span-3 space-y-6">
          {/* Calendar Grid Skeleton */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            {/* Week headers */}
            <div className="grid grid-cols-7 border-b border-[#2a2a2a] bg-[#0f0f0f]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="px-3 py-2.5 text-center border-r border-[#2a2a2a] last:border-r-0"
                >
                  <div className="h-4 w-8 mx-auto bg-[#2a2a2a] rounded" />
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[100px] p-2 border-r border-b border-[#2a2a2a] last:border-r-0"
                >
                  <div className="h-6 w-6 bg-[#2a2a2a] rounded-full mb-2" />
                  {i % 7 < 3 && (
                    <div className="h-5 w-full bg-[#2a2a2a] rounded mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5"
              >
                <div className="h-4 w-32 bg-[#2a2a2a] rounded mb-4" />
                <div className="h-[180px] bg-[#2a2a2a] rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="xl:col-span-1 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5"
            >
              <div className="h-4 w-24 bg-[#2a2a2a] rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-[#2a2a2a] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
