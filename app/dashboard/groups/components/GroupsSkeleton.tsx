"use client";

export function GroupsSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-gray-50 animate-pulse">
      {/* Left Sidebar */}
      <div className="w-[280px] flex-shrink-0 p-4 border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-14 bg-gray-200 rounded-lg" />
        </div>

        {/* Group Cards */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-6 h-6 rounded-full bg-[#333] border-2 border-gray-200" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-12 bg-gray-100 rounded" />
                  <div className="h-8 w-12 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-3 w-12 bg-gray-100 rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-6 w-16 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded-lg" />
            <div className="h-9 w-20 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-3 w-12 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Members Section */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden mb-5">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg min-w-[200px] border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-[#333]" />
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl border border-gray-200 p-4">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-32 bg-gray-50 rounded" />
            </div>
          ))}
        </div>

        {/* Recent Section */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2.5 p-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
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
