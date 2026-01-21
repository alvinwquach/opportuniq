import { WaitlistModal } from "./WaitlistModal";
import { IoArrowForward, IoSearch, IoStorefront, IoConstruct } from "react-icons/io5";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-16 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
              Home projects,{" "}
              <span className="text-teal-700">researched for you.</span>
            </h1>

            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto lg:mx-0">
              Repairs, builds, or diagnostics—we find the parts, compare prices, and locate pros. You decide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <WaitlistModal>
                <button className="w-full sm:w-auto px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  Join Waitlist
                  <IoArrowForward className="w-4 h-4" />
                </button>
              </WaitlistModal>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 text-neutral-700 font-medium rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors duration-200"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl border border-neutral-300 p-6 shadow-lg">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 mb-6">
                <IoSearch className="w-5 h-5 text-neutral-500" />
                <span className="text-neutral-600">ceiling fan installation</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <IoStorefront className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Hunter 52" Ceiling Fan</p>
                    <p className="text-xs text-neutral-500">Home Depot · In stock</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">$149</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <IoConstruct className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Voltage Tester Kit</p>
                    <p className="text-xs text-neutral-500">Amazon · Prime delivery</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">$24</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-teal-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">PRO</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Mike&apos;s Electric</p>
                    <p className="text-xs text-neutral-500">Yelp · 4.8★ · 2.3 mi away</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-700">$180</span>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-sm text-neutral-500">DIY total: <span className="font-semibold text-neutral-900">$173</span></span>
                <span className="text-sm text-emerald-700 font-medium">Save $7 vs hiring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
