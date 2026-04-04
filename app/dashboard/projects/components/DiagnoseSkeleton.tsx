"use client";

export function DiagnoseSkeleton() {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-gray-50 flex animate-pulse">
      {/* Left Column - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Issue Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-100 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Assistant message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-4/5 bg-gray-200 rounded" />
                  <div className="h-4 w-3/5 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-blue-600/30 rounded-2xl rounded-br-md px-4 py-3">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-blue-100 rounded" />
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gray-200" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="h-8 w-16 bg-gray-200 rounded mx-auto" />
                  <div className="h-3 w-12 bg-gray-200 rounded mx-auto mt-2" />
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="h-8 w-16 bg-gray-200 rounded mx-auto" />
                  <div className="h-3 w-16 bg-gray-200 rounded mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4">
              <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                </div>
                <div className="w-24 h-10 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Resources */}
      <div className="w-[380px] flex-shrink-0 border-l border-gray-200 flex flex-col bg-gray-50">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center justify-center gap-2 px-4 py-4">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
