"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * Opportunity Cost Demo
 *
 * Interaction: Two sliders - "Your hourly rate" and "DIY time estimate"
 * The visualization shows a balance scale tipping based on whether DIY or Outsource wins.
 *
 * 5-second insight: "Oh. My time IS worth something. This shows me when DIY is actually more expensive."
 *
 * Why it converts: Makes abstract opportunity cost tangible and personal.
 * Users set their own values and see immediate consequences.
 */

export function OpportunityCostDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const [hourlyRate, setHourlyRate] = useState(40);
  const [diyHours, setDiyHours] = useState(4);
  const [contractorCost] = useState(150);


  const trueDiyCost = hourlyRate * diyHours;
  const savings = contractorCost - trueDiyCost;
  const diyWins = trueDiyCost < contractorCost;
  const difference = Math.abs(savings);

  // Animate the scale when values change
  useEffect(() => {
    if (!scaleRef.current) return;

    const rotation = diyWins ? -8 : 8;
    gsap.to(scaleRef.current, {
      rotation,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  }, [trueDiyCost, contractorCost, diyWins]);

  const handleHourlyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHourlyRate(Number(e.target.value));
  }, []);

  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDiyHours(Number(e.target.value));
  }, []);


  return (
    <section className="relative py-16 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Interactive Demo */}
          <div ref={containerRef} className="order-2 md:order-1">
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
              {/* Sliders */}
              <div className="space-y-6 mb-8">
                {/* Hourly Rate Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-neutral-400">Your hourly value</label>
                    <span className="text-sm font-mono text-[#00F0FF]">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="150"
                    value={hourlyRate}
                    onChange={handleHourlyChange}
                    className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#00F0FF]
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-neutral-600">
                    <span>$15</span>
                    <span>$150</span>
                  </div>
                </div>

                {/* DIY Hours Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-neutral-400">DIY time estimate</label>
                    <span className="text-sm font-mono text-[#00F0FF]">{diyHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={diyHours}
                    onChange={handleHoursChange}
                    className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#00F0FF]
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-neutral-600">
                    <span>1h</span>
                    <span>12h</span>
                  </div>
                </div>
              </div>

              {/* Visual Scale */}
              <div className="relative h-32 mb-6">
                {/* Fulcrum */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[24px] border-l-transparent border-r-transparent border-b-neutral-700" />

                {/* Balance beam */}
                <div
                  ref={scaleRef}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[280px] h-1 bg-neutral-600 rounded-full origin-center"
                  style={{ transformOrigin: "center center" }}
                >
                  {/* DIY side */}
                  <div className="absolute -left-2 -top-16 w-24 text-center">
                    <div
                      className={`px-3 py-2 rounded-lg border ${
                        diyWins
                          ? "bg-[#00FF88]/10 border-[#00FF88]/30"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                    >
                      <div className="text-xs text-neutral-400 mb-1">DIY Cost</div>
                      <div
                        className={`text-lg font-mono font-semibold ${
                          diyWins ? "text-[#00FF88]" : "text-white"
                        }`}
                      >
                        ${trueDiyCost}
                      </div>
                    </div>
                    <div className="w-px h-4 bg-neutral-600 mx-auto" />
                  </div>

                  {/* Contractor side */}
                  <div className="absolute -right-2 -top-16 w-24 text-center">
                    <div
                      className={`px-3 py-2 rounded-lg border ${
                        !diyWins
                          ? "bg-[#00FF88]/10 border-[#00FF88]/30"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                    >
                      <div className="text-xs text-neutral-400 mb-1">Contractor</div>
                      <div
                        className={`text-lg font-mono font-semibold ${
                          !diyWins ? "text-[#00FF88]" : "text-white"
                        }`}
                      >
                        ${contractorCost}
                      </div>
                    </div>
                    <div className="w-px h-4 bg-neutral-600 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="text-center pt-4 border-t border-neutral-800">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    diyWins
                      ? "bg-[#00FF88]/10 text-[#00FF88]"
                      : "bg-[#FF8800]/10 text-[#FF8800]"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {diyWins ? "DIY saves you" : "Contractor saves you"}
                  </span>
                  <span className="text-lg font-mono font-bold">${difference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Your Time Has a Price
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed mb-4">
              Slide to set your hourly value and the estimated DIY time.
              Watch the scale tip to show the true cost of each choice.
            </p>
            <p className="text-sm text-neutral-600">
              Saving $150 means nothing if you spent $240 of your time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
