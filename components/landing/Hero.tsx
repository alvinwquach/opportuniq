import { WaitlistModal } from "./WaitlistModal";
import { IoArrowForward, IoShield, IoTime, IoTrendingUp } from "react-icons/io5";

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
        aria-hidden="true"
      />

      {/* Radial Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(13,148,136,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="text-sm font-medium text-teal-400">Decision Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Make informed decisions{" "}
              <span className="text-teal-400">every time</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join the waitlist to get early access to decision frames that analyze{" "}
              <span className="text-white font-medium">risk</span>,{" "}
              <span className="text-white font-medium">safety</span>, and{" "}
              <span className="text-white font-medium">budget</span> based on available information—so you can make better choices without second-guessing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <WaitlistModal>
                <button className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg transition-colors duration-200 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 flex items-center justify-center gap-2">
                  Join Waitlist
                  <IoArrowForward className="w-4 h-4" />
                </button>
              </WaitlistModal>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 text-white font-medium rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors duration-200"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <IoShield className="w-4 h-4 text-teal-500" />
                <span>Risk Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTime className="w-4 h-4 text-teal-500" />
                <span>Time Estimates</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTrendingUp className="w-4 h-4 text-teal-500" />
                <span>Budget Tracking</span>
              </div>
            </div>
          </div>

          {/* Visual - Static Chart Preview */}
          <div className="relative">
            <div className="relative bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Risk Analysis</h3>
                    <p className="text-xs text-neutral-500">Real-time assessment</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  Live Demo
                </span>
              </div>

              {/* Mini Chart Preview - Static */}
              <div className="mb-6">
                <div className="flex items-end justify-between h-32 gap-3 px-4">
                  {[
                    { height: "45%", label: "Low", color: "bg-emerald-500" },
                    { height: "70%", label: "Med", color: "bg-amber-500" },
                    { height: "30%", label: "Low", color: "bg-emerald-500" },
                    { height: "85%", label: "High", color: "bg-red-500" },
                    { height: "55%", label: "Med", color: "bg-amber-500" },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full ${bar.color} rounded-t-lg`}
                        style={{ height: bar.height }}
                      />
                      <span className="text-[10px] text-neutral-500">{bar.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 px-4 text-[10px] text-neutral-600">
                  <span>Safety</span>
                  <span>Time</span>
                  <span>Skill</span>
                  <span>Cost</span>
                  <span>Tools</span>
                </div>
              </div>

              {/* Risk Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Risk Level", value: "Medium", color: "text-amber-400" },
                  { label: "Time Est.", value: "2-3 hrs", color: "text-teal-400" },
                  { label: "Confidence", value: "87%", color: "text-emerald-400" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                    <p className={`text-sm font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
