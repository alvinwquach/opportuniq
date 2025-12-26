"use client";

import { useState } from "react";
import { Wrench, Car, Trees, Shield, Lightbulb, Users } from "lucide-react";

const useCases = [
  // Row 1
  {
    category: "Automotive",
    icon: Car,
    name: "Roy",
    quote: "Changed my brake pads for the first time. OpportuniQ found parts at 3 local stores and a YouTube tutorial that matched my exact car model.",
  },
  {
    category: "Appliances",
    icon: Wrench,
    name: "Sean",
    quote: "My dishwasher wouldn't drain. OpportuniQ showed me how to clean the filter in 5 minutes. Saved a $120 service call.",
  },
  {
    category: "Automotive",
    icon: Car,
    name: "Chris",
    quote: "BMW headlights were fogged inside. Found DIY seal repair method for $45 instead of $800 dealer replacement.",
  },
  {
    category: "Shared",
    icon: Users,
    name: "Sarah & Alex",
    quote: "Our apartment dishwasher broke. OpportuniQ helped us decide together—Alex fixed it Saturday while I got parts. Split the $45 cost.",
  },
  {
    category: "Yard",
    icon: Trees,
    name: "Marcus",
    quote: "Lawn mower wouldn't start. Turned out it was just a $3 spark plug. OpportuniQ saved me from buying a new one.",
  },
  {
    category: "Safety",
    icon: Shield,
    name: "James",
    quote: "CO detector started beeping at 2am. OpportuniQ's emergency guide told me exactly what to do—potentially saved my family.",
  },
  // Row 2
  {
    category: "Automotive",
    icon: Car,
    name: "David",
    quote: "Needed an oil change but didn't know if I should DIY. OpportuniQ compared costs and showed me it's worth doing myself.",
  },
  {
    category: "Shared",
    icon: Users,
    name: "The Johnson Family",
    quote: "Tracking mom's house repairs as a family. Everyone sees the budget and can vote on decisions. No more confused group texts.",
  },
  {
    category: "Yard",
    icon: Trees,
    name: "Jordan",
    quote: "Broken sprinkler head was flooding my yard. Found the exact replacement part and a 15-minute install guide.",
  },
  {
    category: "Safety",
    icon: Shield,
    name: "Tyler",
    quote: "Smoke detector chirping drove me crazy. OpportuniQ explained it just needed a new battery and showed me which one to buy.",
  },
  {
    category: "Shared",
    icon: Users,
    name: "Downtown Loft (4 roommates)",
    quote: "We pool $100/month each for apartment repairs. OpportuniQ tracks our shared budget and shows who contributed what. Game changer.",
  },
  {
    category: "Projects",
    icon: Lightbulb,
    name: "Kevin",
    quote: "Setting up vintage stereo gear. OpportuniQ found the manual, identified the right cables, and warned me about safe power-up.",
  },
];

// Split use cases into two rows
const firstRow = useCases.slice(0, 6);
const secondRow = useCases.slice(6, 12);

interface UseCaseCardProps {
  useCase: typeof useCases[0];
  onHoverChange: (isHovered: boolean) => void;
}

function UseCaseCard({ useCase, onHoverChange }: UseCaseCardProps) {
  const Icon = useCase.icon;

  return (
    <div
      className="shrink-0 w-96 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">
        <Icon className="h-3.5 w-3.5" />
        <span>{useCase.category}</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
          {useCase.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            {useCase.name}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        "{useCase.quote}"
      </p>
    </div>
  );
}

export function UseCases() {
  const [isRow1Paused, setIsRow1Paused] = useState(false);
  const [isRow2Paused, setIsRow2Paused] = useState(false);

  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-white dark:bg-slate-900">
      <div className="relative mx-auto max-w-7xl px-6 mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-center">
          People love solving with <span className="text-emerald-600">OpportuniQ</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 text-center">
          From repairs to projects to maintenance—discover why people choose OpportuniQ every day.
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="flex flex-col gap-0">
          {/* First row - scrolls right to left */}
          <div className="flex overflow-hidden">
            <div
              className="flex gap-0 animate-scroll-left"
              style={{ animationPlayState: isRow1Paused ? 'paused' : 'running' }}
            >
              {[...firstRow, ...firstRow, ...firstRow].map((useCase, index) => (
                <UseCaseCard key={`first-${index}`} useCase={useCase} onHoverChange={setIsRow1Paused} />
              ))}
            </div>
          </div>
          {/* Second row - scrolls left to right */}
          <div className="flex overflow-hidden">
            <div
              className="flex gap-0 animate-scroll-right"
              style={{ animationPlayState: isRow2Paused ? 'paused' : 'running' }}
            >
              {[...secondRow, ...secondRow, ...secondRow].map((useCase, index) => (
                <UseCaseCard key={`second-${index}`} useCase={useCase} onHoverChange={setIsRow2Paused} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
