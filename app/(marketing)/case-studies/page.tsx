import Link from "next/link";
import { IoArrowForward, IoCash, IoTime, IoTrendingUp, IoSparkles } from "react-icons/io5";
import { Button } from "@/components/ui/button";

const caseStudies = [
  {
    slug: "porsche-cayenne",
    title: "From \"my car jerks weird\" to $4,220 saved",
    category: "Automotive Repair",
    excerpt: "Kevin diagnosed his Porsche transmission issue and fixed it for $280 instead of $4,500—using OpportunIQ's tiered decision framework.",
    image: "/companies/porsche.svg",
    stats: {
      saved: "$4,220",
      time: "45 min",
      roi: "93%"
    },
    tags: ["Automotive", "High-value", "Diagnostic"],
    customer: "Kevin",
  },
];

export default function CaseStudiesIndex() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative pt-28 pb-16 px-6 overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-600 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            Case Studies
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-neutral-900">
            Real decisions. Real savings.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            See how people use OpportunIQ to make confident decisions—<span className="text-teal-600 font-medium">saving thousands</span> by starting with the right solution.
          </p>
        </div>
      </section>
      <section className="py-8 px-6 border-y border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-600 font-mono">$847</div>
              <div className="text-sm text-neutral-500 mt-1">Avg. Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 font-mono">89%</div>
              <div className="text-sm text-neutral-500 mt-1">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 font-mono">2.3min</div>
              <div className="text-sm text-neutral-500 mt-1">Avg. Decision Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 font-mono">12,400+</div>
              <div className="text-sm text-neutral-500 mt-1">Decisions Made</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                href={`/case-study/${study.slug}`}
                className="group relative"
              >
                <div className="relative h-full rounded-2xl border border-neutral-200 bg-white shadow-sm hover:border-neutral-300 hover:shadow-md transition-all overflow-hidden">
                  <div className="relative p-6">
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-600 rounded-full text-xs font-semibold font-mono">
                        {study.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-teal-600 transition-colors leading-tight">
                      {study.title}
                    </h2>
                    <p className="text-neutral-600 mb-6 leading-relaxed text-sm">
                      {study.excerpt}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <IoCash className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-green-600 font-mono text-center">{study.stats.saved}</p>
                        <p className="text-xs text-neutral-500 font-mono text-center">Saved</p>
                      </div>
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <IoTime className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-teal-600 font-mono text-center">{study.stats.time}</p>
                        <p className="text-xs text-neutral-500 font-mono text-center">Decision</p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <IoTrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-bold text-green-600 font-mono text-center">{study.stats.roi}</p>
                        <p className="text-xs text-neutral-500 font-mono text-center">ROI</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all font-mono text-sm">
                      <IoSparkles className="h-4 w-4" />
                      Read the full story
                      <IoArrowForward className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-6 border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-neutral-900">
            Start your own success story
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            Get instant diagnosis, tiered options, and clear trade-offs for any repair or purchase decision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding">
              <Button className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold">
                Get Started Free
                <IoArrowForward className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/product">
              <Button
                variant="outline"
                className="h-12 px-8 border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-mono"
              >
                View All Features
              </Button>
            </Link>
          </div>
          <p className="text-sm text-neutral-500 mt-4 font-mono">
            No credit card required • 2 minutes to set up
          </p>
        </div>
      </section>
    </div>
  );
}
