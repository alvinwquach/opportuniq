"use client";

export function BeforeAfter() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            The difference
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Stop wasting hours. Get answers in minutes.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="rounded-2xl border border-red-100 bg-red-50/30 p-8">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-6">
              Without OpportunIQ
            </p>
            <div className="space-y-4">
              {[
                "Google the symptoms — 20 tabs open, conflicting answers",
                "Ask ChatGPT — get a generic answer with made-up costs",
                "Watch random YouTube videos hoping one matches your model",
                "Call 3 contractors — 2 never call back",
                "Get a quote with no idea if it's fair",
                "No record of what was done or what it cost",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-red-100">
              <p className="text-xs text-gray-400">
                Average time:{" "}
                <span className="font-semibold text-red-600">3-5 hours</span>
              </p>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-6">
              With OpportunIQ
            </p>
            <div className="space-y-4">
              {[
                "Describe the problem — text, photo, video, or voice",
                "Get a diagnosis with safety check in 90 seconds",
                "See real costs from HomeAdvisor and Angi for your area",
                "Find rated contractors with one-click quote requests via Gmail",
                "Follow step-by-step DIY guides if you want to do it yourself",
                "Track everything — costs, decisions, history — in one place",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-blue-100">
              <p className="text-xs text-gray-400">
                Average time:{" "}
                <span className="font-semibold text-blue-600">90 seconds</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
