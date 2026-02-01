"use client";

export function DiagnoseSkeleton() {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex animate-pulse">
      {/* Left Column - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Issue Header */}
        <div className="px-6 py-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a]" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-[#1a1a1a] rounded" />
              <div className="h-4 w-28 bg-[#1a1a1a] rounded" />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Assistant message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#2a2a2a]">
                  <div className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
                  <div className="h-3 w-20 bg-[#2a2a2a] rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#2a2a2a] rounded" />
                  <div className="h-4 w-4/5 bg-[#2a2a2a] rounded" />
                  <div className="h-4 w-3/5 bg-[#2a2a2a] rounded" />
                </div>
              </div>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-emerald-600/30 rounded-2xl rounded-br-md px-4 py-3">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-emerald-500/30 rounded" />
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#2a2a2a]" />
                  <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
                </div>
                <div className="h-6 w-16 bg-[#2a2a2a] rounded-full" />
              </div>

              <div className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl mb-4">
                <div className="h-4 w-full bg-[#2a2a2a] rounded" />
                <div className="h-3 w-24 bg-[#2a2a2a] rounded mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-center">
                  <div className="h-8 w-16 bg-[#2a2a2a] rounded mx-auto" />
                  <div className="h-3 w-12 bg-[#2a2a2a] rounded mx-auto mt-2" />
                </div>
                <div className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-center">
                  <div className="h-8 w-16 bg-[#2a2a2a] rounded mx-auto" />
                  <div className="h-3 w-16 bg-[#2a2a2a] rounded mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-[#1f1f1f]">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
              <div className="h-5 w-48 bg-[#2a2a2a] rounded mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a2a]" />
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a2a]" />
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a2a]" />
                </div>
                <div className="w-24 h-10 rounded-xl bg-[#2a2a2a]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Resources */}
      <div className="w-[380px] flex-shrink-0 border-l border-[#1f1f1f] flex flex-col bg-[#0a0a0a]">
        {/* Tabs */}
        <div className="flex border-b border-[#1f1f1f]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center justify-center gap-2 px-4 py-4">
              <div className="w-4 h-4 rounded bg-[#2a2a2a]" />
              <div className="h-4 w-12 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-[#2a2a2a] rounded" />
                  <div className="h-4 w-full bg-[#2a2a2a] rounded" />
                  <div className="h-3 w-24 bg-[#2a2a2a] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
