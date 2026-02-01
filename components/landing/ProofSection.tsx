"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoCheckmarkCircle } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [savings, setSavings] = useState(0);
  const [issues, setIssues] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animate savings counter
          gsap.to({ val: 0 }, {
            val: 1190,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              setSavings(Math.floor(this.targets()[0].val));
            }
          });

          // Animate issues counter
          gsap.to({ val: 0 }, {
            val: 12,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: function() {
              setIssues(Math.floor(this.targets()[0].val));
            }
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-neutral-950 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div ref={counterRef} className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-emerald-500 mb-4">
            Real Results
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-16">
            You did this.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 rounded-2xl p-8 border border-emerald-500/30">
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                ${savings.toLocaleString()}
              </div>
              <p className="text-neutral-400">saved in 6 months</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-8 border border-emerald-500/30">
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                {issues}
              </div>
              <p className="text-neutral-400">issues resolved</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-8 border border-emerald-500/30">
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                92%
              </div>
              <p className="text-neutral-400">DIY success rate</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {[
            { issue: "Kitchen faucet leak", saved: 152, time: "45 min" },
            { issue: "Garage door squeaking", saved: 87, time: "20 min" },
            { issue: "Dishwasher filter", saved: 150, time: "30 min" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <IoCheckmarkCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <span className="text-lg font-medium text-white">{item.issue}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-neutral-500">{item.time}</span>
                <span className="text-emerald-400 font-semibold">
                  Saved ${item.saved}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
