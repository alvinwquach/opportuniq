"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaReddit, FaYelp, FaAmazon } from "react-icons/fa";
import { SiYoutube } from "react-icons/si";
import { IoStorefront, IoCheckmarkCircle } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const dataSources = [
  { icon: FaReddit, name: "Reddit", color: "text-orange-500", desc: "234 users fixed this" },
  { icon: SiYoutube, name: "YouTube", color: "text-red-600", desc: "Step-by-step guides" },
  { icon: FaYelp, name: "Yelp", color: "text-red-600", desc: "Local contractor reviews" },
  { icon: IoStorefront, name: "Home Depot", color: "text-orange-600", desc: "Live inventory & pricing" },
  { icon: FaAmazon, name: "Amazon", color: "text-yellow-600", desc: "Price comparison" },
  { icon: IoStorefront, name: "Angi", color: "text-green-600", desc: "Pro availability & quotes" },
];

export function ResearchSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.children;
      if (cards) {
        gsap.fromTo(
          Array.from(cards),
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 70%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-slate-950 text-white px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-slate-400 mb-4">
            Real Data
          </p>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Not guessing. Knowing.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every recommendation is backed by real pricing, real reviews, and real solutions from people who've fixed the same thing.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {dataSources.map((source, idx) => {
            const Icon = source.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6"
              >
                <Icon className={`w-10 h-10 ${source.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{source.name}</h3>
                <p className="text-sm text-slate-400">{source.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Example Data Point */}
        <div className="mt-16 bg-slate-900 border-2 border-slate-800 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-slate-400 mb-2">Home Depot</p>
              <p className="text-3xl font-bold text-white mb-1">$24.99</p>
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <IoCheckmarkCircle className="w-4 h-4" />
                In stock, 0.8 mi away
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Amazon</p>
              <p className="text-3xl font-bold text-white mb-1">$22.49</p>
              <p className="text-sm text-blue-400">Prime delivery tomorrow</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Lowe's</p>
              <p className="text-3xl font-bold text-white mb-1">$26.99</p>
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <IoCheckmarkCircle className="w-4 h-4" />
                In stock, 2.1 mi away
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
