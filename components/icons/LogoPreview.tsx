"use client";

import { OpportunIQLogo } from "./OpportunIQLogo";

export function LogoPreview() {
  const variants = [
    {
      name: "scale-smart",
      label: "Smart Scale (RECOMMENDED)",
      description: "Weighing options with intelligence - combines scales + IQ"
    },
    {
      name: "brain-paths",
      label: "Brain + Decision Paths",
      description: "Intelligence + choices (OpportunIQ = Opportunity + IQ)"
    },
    {
      name: "scales",
      label: "Balance Scales (Simple)",
      description: "Weighing trade-offs and options"
    },
    {
      name: "compass",
      label: "Compass",
      description: "Guidance and direction for decisions"
    },
    {
      name: "lightbulb-graph",
      label: "Lightbulb + Graph",
      description: "Insights leading to optimization"
    },
    {
      name: "decision-node",
      label: "Decision Network",
      description: "Analyzing connections between factors"
    },
  ] as const;

  return (
    <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Logo Variants</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {variants.map((variant) => (
            <div
              key={variant.name}
              className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* White background version */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                    <OpportunIQLogo
                      variant={variant.name as any}
                      className="h-9 w-9 text-white"
                    />
                  </div>
                </div>

                {/* Dark background version */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700">
                    <OpportunIQLogo
                      variant={variant.name as any}
                      className="h-9 w-9 text-emerald-400"
                    />
                  </div>
                </div>

                {/* Small size preview */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <OpportunIQLogo
                      variant={variant.name as any}
                      className="h-6 w-6 text-white"
                    />
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-1">{variant.label}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {variant.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold mb-3">How to use:</h3>
          <pre className="text-sm bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto">
{`// Default (brain-paths)
<OpportunIQLogo className="h-5 w-5 text-white" />

// Or specify variant:
<OpportunIQLogo
  variant="compass"
  className="h-5 w-5 text-white"
/>`}
          </pre>
        </div>
      </div>
    </section>
  );
}
