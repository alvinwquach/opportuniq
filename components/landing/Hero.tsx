import { WaitlistModal } from "./WaitlistModal";
import { IoArrowForward, IoSearch, IoStorefront, IoConstruct } from "react-icons/io5";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-16 bg-neutral-950">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Home projects,{" "}
              <span className="text-teal-400">researched for you.</span>
            </h1>

            <p className="text-lg text-neutral-400 mb-8 max-w-md mx-auto lg:mx-0">
              Repairs, builds, or diagnostics—we find the parts, compare prices, and locate pros. You decide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <WaitlistModal>
                <button className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  Join Waitlist
                  <IoArrowForward className="w-4 h-4" />
                </button>
              </WaitlistModal>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 text-neutral-300 font-medium rounded-lg border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 transition-colors duration-200"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800 border border-neutral-700 mb-6">
                <IoSearch className="w-5 h-5 text-neutral-500" />
                <span className="text-neutral-400">ceiling fan installation</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/50 transition-colors bg-neutral-800/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <IoStorefront className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Hunter 52&quot; Ceiling Fan</p>
                    <p className="text-xs text-neutral-500">Home Depot · In stock</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">$149</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/50 transition-colors bg-neutral-800/50">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <IoConstruct className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Voltage Tester Kit</p>
                    <p className="text-xs text-neutral-500">Amazon · Prime delivery</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">$24</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/50 transition-colors bg-neutral-800/50">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">PRO</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Mike&apos;s Electric</p>
                    <p className="text-xs text-neutral-500">Yelp · 4.8★ · 2.3 mi away</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-400">$180</span>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-sm text-neutral-500">DIY total: <span className="font-semibold text-white">$173</span></span>
                <span className="text-sm text-emerald-400 font-medium">Save $7 vs hiring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
