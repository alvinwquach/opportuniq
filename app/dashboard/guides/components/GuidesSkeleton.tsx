"use client";

export function GuidesSkeleton() {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-blue-600/50 to-blue-700/50 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-white/20 rounded mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded" />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-lg px-4 py-2 w-24 h-16" />
            ))}
          </div>
        </div>
      </div>

      {/* Search skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-lg h-11 bg-gray-100 rounded-xl" />
        <div className="w-24 h-11 bg-blue-600/50 rounded-xl" />
        <div className="w-24 h-11 bg-gray-100 rounded-xl" />
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Tabs skeleton */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-t-xl px-2 pt-2 pb-3 border-b border-gray-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-20 bg-[#333] rounded-lg" />
            ))}
          </div>

          {/* Filters skeleton */}
          <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-16 bg-[#333] rounded" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 w-20 bg-[#333] rounded-lg" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-[#333] rounded" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-7 w-20 bg-[#333] rounded-lg" />
              ))}
            </div>
          </div>

          {/* Guide cards skeleton */}
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl border border-gray-200 p-4 h-48"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#333] rounded-lg" />
                    <div className="h-5 w-24 bg-[#333] rounded-full" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-[#333] rounded" />
                    <div className="w-6 h-6 bg-[#333] rounded" />
                  </div>
                </div>
                <div className="h-5 w-full bg-[#333] rounded mb-2" />
                <div className="h-4 w-3/4 bg-[#333] rounded mb-3" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-3 w-12 bg-[#333] rounded" />
                  <div className="h-3 w-16 bg-[#333] rounded" />
                  <div className="h-3 w-12 bg-[#333] rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 bg-[#333] rounded-full" />
                  <div className="h-8 w-20 bg-blue-600/50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          {/* Stats card */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
            <div className="h-5 w-32 bg-[#333] rounded mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-blue-50 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Completion rate */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
            <div className="h-5 w-32 bg-[#333] rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-[#333] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-[#333] rounded" />
                <div className="h-3 w-full bg-[#333] rounded" />
              </div>
            </div>
          </div>

          {/* Savings chart */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
            <div className="h-5 w-40 bg-[#333] rounded mb-3" />
            <div className="h-32 bg-[#333]/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
