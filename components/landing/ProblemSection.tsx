import { Section, AnimatedElement } from "./shared";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Wallet,
  HelpCircle
} from "lucide-react";

const problems = [
  {
    icon: DollarSign,
    text: "Paid a plumber $200 for a fix that took him 5 minutes",
  },
  {
    icon: Clock,
    text: "Spent an entire Saturday on a \"quick fix\" that still doesn't work",
  },
  {
    icon: AlertTriangle,
    text: "Ignored a small problem until it became a $3,000 emergency",
  },
  {
    icon: Users,
    text: "Got into an argument about whether to fix something now or later",
  },
  {
    icon: Wallet,
    text: "No idea if you can actually afford the repair this month",
  },
  {
    icon: HelpCircle,
    text: "Hired someone sketchy because you didn't know where else to look",
  },
];

export function ProblemSection() {
  return (
    <Section id="features" background="muted">
      <AnimatedElement>
        <Section.Header
          title="Sound familiar?"
          description="The mental load of every household decision"
        />
      </AnimatedElement>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {problems.map((problem, i) => (
          <AnimatedElement key={i} delay={i * 50}>
            <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.text}</p>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </Section>
  );
}
