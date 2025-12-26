import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Search, Target, Repeat, Bot } from "lucide-react";

const workflows = [
  {
    icon: Bell,
    title: "Proactive Monitoring",
    description:
      "Detects price increases on recurring expenses, spots spending spikes, and alerts you when tariffs affect planned purchases.",
    example:
      '"Your car insurance renewed at $180/month, up from $156. That\'s a 15% increase — want to flag this for shopping around?"',
    color: "blue",
  },
  {
    icon: Search,
    title: "Autonomous Research",
    description:
      "When you approve a hire, we automatically find rated vendors in your area, read their reviews, and compare typical pricing.",
    example:
      '"Found 4 plumbers within 10 miles. ABC Plumbing has the best reviews for faucet repairs. Here\'s their contact info and business hours."',
    color: "green",
  },
  {
    icon: Target,
    title: "Opportunity Cost Analysis",
    description:
      "Calculates your effective hourly rate against DIY time estimates. Factors in your skill level and tool ownership.",
    example:
      '"This job takes 3 hours for a beginner. At your hourly rate, that\'s $285 of your time. A pro charges $180. Hire recommended."',
    color: "amber",
  },
  {
    icon: Repeat,
    title: "Follow-up & Learning",
    description:
      "Checks in after repairs to track outcomes. Learns from your experiences to improve future recommendations.",
    example:
      '"You hired Mike\'s Electric 2 months ago. How did it go? This helps me give better recommendations next time."',
    color: "purple",
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  green: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  amber: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
};

export function AgenticWorkflows() {
  return (
    <Section background="gradient">
      <AnimatedElement>
        <Section.Header
          align="left"
          badge={
            <Badge variant="secondary" className="border border-border/50">
              <Bot className="h-3 w-3 mr-1.5" />
              AI
            </Badge>
          }
          title="AI that works while you sleep"
          description="Not just answering questions — proactively finding opportunities, doing research, and following up on your behalf."
        />
      </AnimatedElement>
      <div className="grid md:grid-cols-2 gap-6">
        {workflows.map((workflow, i) => {
          const colors = colorClasses[workflow.color as keyof typeof colorClasses];
          return (
            <AnimatedElement key={i} delay={i * 100}>
              <Card className="border-border/50 overflow-hidden h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
                      >
                        <workflow.icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {workflow.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 bg-muted/30 border-t ${colors.border}`}>
                    <div className="flex items-start gap-2">
                      <Bot className={`h-4 w-4 ${colors.text} mt-0.5 shrink-0`} />
                      <p className="text-sm text-muted-foreground italic">
                        {workflow.example}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          );
        })}
      </div>
    </Section>
  );
}
