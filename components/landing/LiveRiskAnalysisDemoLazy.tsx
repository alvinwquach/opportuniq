"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { IoLocation, IoShield, IoStorefront, IoThermometer } from "react-icons/io5";

// Skeleton placeholder while the real component loads
function DemoSkeleton() {
  return (
    <section className="relative py-24 overflow-hidden bg-neutral-100">
      <div className="relative container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
            See It in Action
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Location-specific analysis with weather, nearby stores, safety equipment, and cost calculations.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={`skeleton-btn-${i}`}
              className="px-4 py-2 rounded-lg bg-neutral-200 animate-pulse w-32 h-10"
            />
          ))}
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-neutral-300 flex items-center gap-2">
                <IoLocation className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-900">Location Map</span>
              </div>
              <div className="h-72 w-full bg-neutral-200 animate-pulse flex items-center justify-center">
                <span className="text-neutral-900 text-sm font-medium">Loading map...</span>
              </div>
              <div className="p-3 border-t border-neutral-300 bg-neutral-50">
                <div className="flex gap-3">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-300 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <IoStorefront className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-900">Tools Available Nearby</span>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={`skeleton-tool-${i}`} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-300 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <IoThermometer className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-900">Weather Conditions</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={`skeleton-weather-${i}`} className="text-center p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="h-8 w-12 mx-auto bg-neutral-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-10 mx-auto bg-neutral-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-neutral-300 flex items-center gap-2">
                <IoShield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-neutral-900">Risk Analysis Stream</span>
              </div>
              <div className="p-4 h-40 bg-neutral-50">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={`skeleton-stream-${i}`} className="h-4 bg-neutral-200 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-neutral-300">
                <span className="text-sm font-medium text-neutral-900">Risk Severity Matrix</span>
              </div>
              <div className="p-4 h-52 flex items-center justify-center">
                <span className="text-neutral-600 text-sm">Loading chart...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Dynamically import the heavy component
const LiveRiskAnalysisDemo = dynamic(
  () => import("./live-risk-analysis-demo").then((mod) => mod.LiveRiskAnalysisDemo),
  {
    loading: () => <DemoSkeleton />,
    ssr: false, // Don't render on server - this is a heavy client component
  }
);

export function LiveRiskAnalysisDemoLazy() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use Intersection Observer to detect when section is near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before it's visible
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded]);

  return (
    <div ref={containerRef}>
      {isVisible ? <LiveRiskAnalysisDemo /> : <DemoSkeleton />}
    </div>
  );
}
