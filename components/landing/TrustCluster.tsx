import { IoSearch, IoTime, IoWallet, IoLocation } from "react-icons/io5";

const TRUST_POINTS = [
  {
    icon: IoSearch,
    title: "Smart Research",
    description: "We crawl forums, stores, and review sites so you don't have to.",
    color: "text-teal-700",
    bgColor: "bg-teal-100",
  },
  {
    icon: IoLocation,
    title: "Local Results",
    description: "Find contractors and stores near you with real reviews and pricing.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: IoTime,
    title: "Save Hours",
    description: "Get answers in minutes instead of spending hours comparing options.",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    icon: IoWallet,
    title: "Track Spending",
    description: "Log expenses and income to see the true cost of home ownership.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

export function TrustCluster() {
  return (
    <section className="relative py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
            Your Research Assistant
          </h2>
          <p className="text-neutral-600 text-base max-w-md mx-auto">
            We do the legwork so you can make informed decisions faster.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.title}
              className="group p-5 sm:p-6 rounded-xl bg-neutral-50 border border-neutral-200
                         hover:border-neutral-300 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${point.bgColor} flex items-center justify-center shrink-0`}>
                  <point.icon className={`w-5 h-5 ${point.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-1">{point.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{point.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
