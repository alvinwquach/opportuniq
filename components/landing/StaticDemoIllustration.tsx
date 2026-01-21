import { IoSearch, IoStorefront, IoCheckmarkCircle, IoPeople } from "react-icons/io5";

export function StaticDemoIllustration() {
  return (
    <section id="demo" className="relative py-20 sm:py-28 bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg max-w-md mx-auto">
            Tell us your project. We handle the research.
          </p>
        </div>

        {/* Three-step visual flow */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1: Describe */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <IoSearch className="w-6 h-6 text-teal-700" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">1. Describe</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Tell us what you need—a repair, installation, or diagnosis.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <IoSearch className="w-4 h-4 text-neutral-500" />
                <span>&quot;install ceiling fan&quot;</span>
              </div>
            </div>
          </div>

          {/* Step 2: Research */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <IoStorefront className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">2. Research</h3>
            <p className="text-sm text-neutral-600 mb-4">
              We scan stores, forums, and contractor listings automatically.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Parts</span>
                <span className="text-neutral-600">Home Depot, Amazon</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Pros</span>
                <span className="text-neutral-600">Yelp, Angi</span>
              </div>
            </div>
          </div>

          {/* Step 3: Decide */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <IoCheckmarkCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">3. Decide</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Compare DIY vs hiring a pro with clear cost breakdowns.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">DIY</span>
                <span className="font-medium text-emerald-700">$173</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Pro</span>
                <span className="font-medium text-neutral-900">$329</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional features */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <IoPeople className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Find Local Pros</h4>
              <p className="text-sm text-neutral-600">We search Yelp and Angi to find top-rated contractors near you.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
              <IoStorefront className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Track Expenses</h4>
              <p className="text-sm text-neutral-600">Log your home repair costs and see where your money goes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
