"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { IoCalculator } from "react-icons/io5";

function CalculatorSkeleton() {
  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
            Calculate Your Savings
          </h2>
          <p className="text-neutral-600 text-base max-w-md mx-auto">
            See how much time and money you could save on common home projects.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <IoCalculator className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-neutral-700">Loading calculator...</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-28 bg-neutral-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-6 mb-8">
            <div>
              <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-neutral-100 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-neutral-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-xl bg-neutral-50">
              <div className="h-8 w-20 mx-auto bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-16 mx-auto bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="text-center p-4 rounded-xl bg-neutral-50">
              <div className="h-8 w-20 mx-auto bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-16 mx-auto bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Dynamically import the heavy component
const OpportunityCostCalculator = dynamic(
  () => import("./OpportunityCostCalculator").then((mod) => mod.OpportunityCostCalculator),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

export function OpportunityCostCalculatorLazy() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
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
      {isVisible ? <OpportunityCostCalculator /> : <CalculatorSkeleton />}
    </div>
  );
}
