"use client";

import { IoShieldCheckmark, IoSparkles, IoLockClosed } from "react-icons/io5";

export function TrustSection() {
  return (
    <section className="relative py-32 bg-neutral-900 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Honest recommendations
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            We don't take kickbacks from contractors or stores. Our AI tells you the truth about what you can fix yourself.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IoShieldCheckmark className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              No hidden fees
            </h3>
            <p className="text-neutral-400">
              We don't charge contractors to appear in results. We show you the best options, period.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IoSparkles className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              AI-powered accuracy
            </h3>
            <p className="text-neutral-400">
              Vision analysis, cost estimation, and safety assessment powered by GPT-4 and proprietary models.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IoLockClosed className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Your data is private
            </h3>
            <p className="text-neutral-400">
              Photos and personal information are encrypted. We never sell your data to third parties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
