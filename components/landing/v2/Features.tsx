"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { IoCamera } from "react-icons/io5";

function SmallCard({
  title,
  desc,
  accent,
  refCallback,
}: {
  title: string;
  desc: string;
  accent?: boolean;
  refCallback: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={refCallback}
      className={`rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 ${
        accent
          ? "bg-blue-50/60 border border-blue-100"
          : "bg-white border border-gray-200"
      }`}
    >
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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
            gsap.to(split.words, { clipPath: "inset(0 0 0% 0)", stagger: 0.05, duration: 0.6, ease: "spring" });
          },
          once: true,
        });
      }
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.create({
          trigger: card,
          start: "top 85%",
          onEnter: () => {
            gsap.to(card, { clipPath: "inset(0 0 0% 0)", duration: 0.6, delay: i * 0.06, ease: "spring" });
          },
          once: true,
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  let ci = 0;

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 ref={headingRef} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything the AI does for you
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            It decides what you need and goes and gets it.
          </p>
        </div>

        {/* Row 1: AI Diagnosis (wide) + Contractor Finder (narrow) */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-5 mb-5">
          {/* AI Diagnosis — hero card with chat mockup */}
          <div
            ref={(el) => { cardRefs.current[ci++] = el; }}
            className="bg-blue-50/50 border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Diagnosis
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Analyzes photos, video with audio, and voice in 40+ languages. Assesses
              severity, flags safety risks you didn&apos;t know to ask about, and tells
              you whether to DIY or call a pro.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <IoCamera className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-xs text-gray-700 max-w-xs">
                  I need to clean the algae out of my pond
                </div>
              </div>
              <div className="flex items-start gap-2.5 justify-end">
                <div className="bg-blue-600 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white max-w-sm">
                  <span className="font-semibold">Safety note first.</span> Algaecides and
                  decomposing algae release toxic gases — you&apos;ll need a respirator,
                  nitrile gloves, and eye protection before you start.
                </div>
              </div>
            </div>
          </div>

          {/* Contractor Finder — elevated from row 2 */}
          <div
            ref={(el) => { cardRefs.current[ci++] = el; }}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Contractor Finder
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Searches Yelp and Foursquare for rated pros near you. Drafts the quote
              request and sends it from your Gmail — one click, lands in your sent folder.
            </p>
            {/* Mini contractor card */}
            <div className="space-y-2">
              {[
                { name: "Mike's Plumbing", rating: "4.8", reviews: "142 reviews", tag: "Licensed" },
                { name: "Bay Area Rooter", rating: "4.6", reviews: "89 reviews", tag: "Same-day" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.reviews}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">{c.tag}</span>
                    <span className="text-xs font-semibold text-gray-700">{c.rating}★</span>
                  </div>
                </div>
              ))}
              <button className="w-full mt-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition-colors">
                Send quote request via Gmail
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Community Research (wide) + Safety Recalls (narrow) */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-5 mb-5">
          <div
            ref={(el) => { cardRefs.current[ci++] = el; }}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Community Research
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Real Reddit threads from people who had the exact same issue. What worked,
              what didn&apos;t, what they actually paid.
            </p>
            {/* Mini thread previews */}
            <div className="space-y-2">
              {[
                { sub: "r/HomeImprovement", title: "Water stain on ceiling — turned out to be AC condensate line", votes: "847" },
                { sub: "r/Plumbing", title: "Fixed mine for $12 — just needed a new drain cap", votes: "312" },
              ].map((t) => (
                <div key={t.title} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-semibold text-orange-500 flex-shrink-0 mt-0.5">{t.sub}</span>
                  <p className="text-xs text-gray-600 leading-snug flex-1">{t.title}</p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{t.votes} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={(el) => { cardRefs.current[ci++] = el; }}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Safety Recalls
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Checks CPSC and NHTSA databases for product and vehicle recalls related to your issue.
            </p>
            <div className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">CPSC Alert</p>
              <p className="text-xs text-amber-800 leading-snug">1 active recall matches your appliance model.</p>
            </div>
          </div>
        </div>

        {/* Row 3: Real Cost Data (wide) + Rebates (narrow, teal tint) */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-5 mb-5">
          <div
            ref={(el) => { cardRefs.current[ci++] = el; }}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Real Cost Data
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              DIY vs professional breakdowns from HomeAdvisor and Angi. Specific to your region. Updated regularly.
            </p>
            <div className="space-y-3">
              {[
                { label: "DIY", range: "$80–$150", pct: "30%", color: "bg-blue-500" },
                { label: "Professional", range: "$350–$800", pct: "75%", color: "bg-blue-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500 font-medium">{row.label}</span>
                    <span className={`font-semibold ${row.color === "bg-blue-500" ? "text-blue-600" : "text-blue-600"}`}>{row.range}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full`} style={{ width: row.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SmallCard
            title="Rebates & Tax Credits"
            desc="Find utility rebates and federal tax credits for energy upgrades like heat pumps, insulation, and smart thermostats."
            accent
            refCallback={(el) => { cardRefs.current[ci++] = el; }}
          />
        </div>

        {/* Row 4: four small equal cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {[
            { title: "DIY Guides", desc: "Step-by-step guides from iFixit, YouTube, Stack Exchange, and Instructables." },
            { title: "Product Reviews", desc: "Real buyer feedback before you purchase parts or tools." },
            { title: "Video Tutorials", desc: "YouTube tutorials matched to your specific project." },
            { title: "Google Calendar", desc: "Schedule repairs, contractor visits, and maintenance reminders. Syncs automatically." },
          ].map((f) => (
            <SmallCard
              key={f.title}
              title={f.title}
              desc={f.desc}
              refCallback={(el) => { cardRefs.current[ci++] = el; }}
            />
          ))}
        </div>

        {/* Row 5: full-width PPE / in-store card */}
        <div
          ref={(el) => { cardRefs.current[ci++] = el; }}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-8 py-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">In-Store Availability</h3>
              <p className="text-sm text-gray-600">
                Check if tools, materials, or safety equipment is in stock at Home Depot before you make the trip.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">Nitrile gloves · In stock</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">P100 respirator · In stock</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
