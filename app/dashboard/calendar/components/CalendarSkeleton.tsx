"use client";

export function CalendarSkeleton() {
  return (
    <div className="p-6 min-h-[calc(100vh-48px)] bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-7 w-36 bg-gray-100 rounded-lg" />
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-gray-100 rounded" />
            <div className="h-8 w-8 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
          <div className="h-8 w-32 bg-gray-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-100 rounded-lg" />
          <div className="h-9 w-20 bg-gray-100 rounded-lg" />
          <div className="h-9 w-24 bg-blue-600/30 rounded-lg" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-7 w-20 bg-gray-100 rounded-lg" />
        ))}
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid xl:grid-cols-4 gap-6">
        {/* Calendar + Charts Column */}
        <div className="xl:col-span-3 space-y-6">
          {/* Calendar Grid Skeleton */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {/* Week headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="px-3 py-2.5 text-center border-r border-gray-200 last:border-r-0"
                >
                  <div className="h-4 w-8 mx-auto bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0"
                >
                  <div className="h-6 w-6 bg-gray-200 rounded-full mb-2" />
                  {i % 7 < 3 && (
                    <div className="h-5 w-full bg-gray-200 rounded mt-1" />
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
                className="bg-gray-100 rounded-xl border border-gray-200 p-5"
              >
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-[180px] bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="xl:col-span-1 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl border border-gray-200 p-5"
            >
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
