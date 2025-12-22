"use client";

import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const cases = [
  {
    problem: "Garbage disposal won't turn on",
    decision: "DIY",
    reason: "It was just the reset button. Took 30 seconds.",
    saved: "$150",
    color: "primary",
  },
  {
    problem: "Water heater making rumbling sounds",
    decision: "Wait + DIY",
    reason: "Sediment buildup. Flushing it extends life 3-5 years.",
    saved: "$1,200",
    color: "blue",
  },
  {
    problem: "AC not cooling well",
    decision: "Hire",
    reason: "Refrigerant issue requires certified tech. Plus your hourly rate is $95.",
    saved: "$0 (right call)",
    color: "yellow",
  },
  {
    problem: "Roof shingles lifting",
    decision: "Buy now",
    reason: "Tariffs on asphalt rising 20% in Q2. Locked in current prices.",
    saved: "$1,800",
    color: "orange",
  },
];

const colorClasses = {
  primary: "border-primary/30 bg-primary/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  yellow: "border-yellow-500/30 bg-yellow-500/5",
  orange: "border-orange-500/30 bg-orange-500/5",
};

export function UseCasesSection() {
  return (
    <Section>
      <AnimatedElement>
        <Section.Header
          align="left"
          title="Real decisions, real outcomes"
          description="Here's what households actually asked about — and what happened."
        />
      </AnimatedElement>

      <div className="grid md:grid-cols-2 gap-4">
        {cases.map((c, i) => (
          <AnimatedElement key={i} delay={i * 100}>
            <Card
              className={`border ${
                colorClasses[c.color as keyof typeof colorClasses]
              } h-full hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-5">
                <p className="font-semibold mb-2">{c.problem}</p>
                <p className="text-sm text-muted-foreground mb-4">{c.reason}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-card">
                    {c.decision}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">
                    Saved {c.saved}
                  </span>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        ))}
      </div>
    </Section>
  );
}
