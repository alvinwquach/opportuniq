"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

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
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(split.words, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.05,
              duration: 0.6,
              ease: "spring",
            });
          },
          once: true,
        });
      }

      if (subheadRef.current) {
        gsap.set(subheadRef.current, { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.create({
          trigger: subheadRef.current,
          start: "top 85%",
          onEnter: () => {
            gsap.to(subheadRef.current, {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.6,
              delay: 0.15,
              ease: "spring",
            });
          },
          once: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            The dashboard
          </p>
          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
          >
            Diagnose, track, and fix — in one place
          </h2>
          <p ref={subheadRef} className="text-base text-gray-500 max-w-xl mx-auto">
            Every issue you submit lives here. See the diagnosis, the cost breakdown, your repair history, and your team.
          </p>
        </div>

        {/* Dashboard preview — has its own scroll animation */}
        <Suspense
          fallback={
            <div className="h-[620px] bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
          }
        >
          <DashboardPreview variant="light" />
        </Suspense>
      </div>
    </section>
  );
}
