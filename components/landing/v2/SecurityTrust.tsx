"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { IoLockClosed, IoShield, IoAnalytics } from "react-icons/io5";

const columns = [
  {
    icon: IoLockClosed,
    title: "Encrypted",
    description: "Bank-level encryption. Delete anytime.",
  },
  {
    icon: IoShield,
    title: "Checked",
    description: "Every AI response verified for accuracy.",
  },
  {
    icon: IoAnalytics,
    title: "Improving",
    description: "Your reports improve recommendations.",
  },
];

export function SecurityTrust() {
  const sectionRef = useRef<HTMLElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      colRefs.current.forEach((col, i) => {
        if (!col) return;
        gsap.set(col, { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.create({
          trigger: col,
          start: "top 90%",
          onEnter: () => {
            gsap.to(col, { clipPath: "inset(0 0 0% 0)", duration: 0.6, delay: i * 0.1, ease: "spring" });
          },
          once: true,
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4 sm:px-6 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {columns.map((col, i) => {
            const Icon = col.icon;
            return (
              <div key={i} ref={(el) => { colRefs.current[i] = el; }} className="text-center px-6">
                <span className="text-2xl mb-3 block"><Icon className="w-6 h-6 text-gray-400 mx-auto" /></span>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {col.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {col.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
