"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const DashboardPreview = dynamic(
  () =>
    import("@/components/landing/dashboard-preview").then((m) => ({
      default: m.DashboardPreview,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
    ),
  }
);

export function DashboardSection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      {/* Header — centered, constrained */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-10">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
          The dashboard
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Diagnose, track, and fix — in one place
        </h2>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          Every issue you submit lives here. See the diagnosis, the cost breakdown, your repair history, and your team.
        </p>
      </div>

      {/* Dashboard preview — full width */}
      <div className="px-4 sm:px-6 lg:px-10">
        <Suspense
          fallback={
            <div className="h-[700px] bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
          }
        >
          <DashboardPreview variant="light" />
        </Suspense>
      </div>
    </section>
  );
}
