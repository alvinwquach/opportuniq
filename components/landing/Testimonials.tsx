"use client";

import { Clock, DollarSign, CheckCircle } from "lucide-react";

const caseStudies = [
  {
    title: "Porsche Cayenne Transmission Repair",
    category: "Automotive",
    problem: "Transmission was slipping and making grinding noises. Dealership quoted $3,400.",
    whyChose: "I needed to know if this was urgent and if there were better options than the dealership.",
    solution: "Found 3 Porsche-certified specialists nearby, compared pricing and reviews, got appointments within 48 hours instead of waiting 2 weeks",
    results: [
      "Saved $1,300 by finding specialist vs dealership",
      "Avoided 2-week wait time",
      "Got multiple quotes to compare"
    ],
    user: "Roy",
    savings: "$1,300",
    timeSaved: "6 hours",
  },
  {
    title: "Vintage Stereo Restoration",
    category: "Electronics",
    problem: "Inherited a 1970s Marantz receiver but didn't know if it was safe to power on or what cables I needed.",
    whyChose: "I didn't want to damage a family heirloom by plugging it in wrong.",
    solution: "Got the exact model number, found the original service manual, learned the safe power-up sequence, and sourced all correct cables locally",
    results: [
      "Prevented potential damage from incorrect setup",
      "Found parts locally same day",
      "Stereo works perfectly after 40 years"
    ],
    user: "Sean",
    savings: "N/A",
    timeSaved: "8 hours",
  },
  {
    title: "Dishwasher Won't Drain",
    category: "Appliances",
    problem: "Standing water at the bottom after every cycle. Wasn't sure if I needed to replace the whole unit.",
    whyChose: "I was on a tight budget and couldn't afford a new dishwasher.",
    solution: "AI diagnosed clogged filter. Cleaned it myself in 5 minutes following the guide. Saved a $120 service call.",
    results: [
      "Fixed in under 10 minutes",
      "Saved $120 on service call",
      "Learned proper dishwasher maintenance"
    ],
    user: "Chris",
    savings: "$120",
    timeSaved: "3 hours",
  },
  {
    title: "BMW Headlight Fogging",
    category: "Automotive",
    problem: "Headlights fogged up from inside. Dealership wanted $800 for new assemblies.",
    whyChose: "I knew there had to be a cheaper fix than replacing perfectly good headlights.",
    solution: "Found DIY seal repair method, bought supplies for $45, fixed both headlights in one afternoon",
    results: [
      "Saved $755 vs dealership",
      "Fixed both headlights for under $50",
      "Learned headlight restoration technique"
    ],
    user: "Stephan",
    savings: "$755",
    timeSaved: "5 hours",
  },
];

function CaseStudyCard({ study }: { study: typeof caseStudies[0] }) {
  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-600/50 transition-all hover:shadow-md rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            {study.category}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-navy dark:text-white mt-3 mb-1">
            {study.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            — {study.user}
          </p>
        </div>
        {study.savings !== "N/A" && (
          <div className="shrink-0 text-right ml-4">
            <div className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span className="text-lg font-bold">{study.savings}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved</p>
          </div>
        )}
      </div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          The problem
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          "{study.problem}"
        </p>
      </div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
          Why I used OpportuniQ
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{study.whyChose}"
        </p>
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
          What happened
        </p>
        <ul className="space-y-1.5">
          {study.results.map((result, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
              <span>{result}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
          <Clock className="h-3.5 w-3.5" />
          {study.timeSaved} saved
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-20 md:py-24 bg-white dark:bg-slate-900">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Success stories
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
            See how OpportuniQ helps people solve complex problems with confidence
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={index} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
