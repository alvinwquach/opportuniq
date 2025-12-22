import { Section, AnimatedElement } from "./shared";
import { Camera, Brain, Users, Zap } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Upload the issue",
    description: "Photo, video, or voice note. Just show us what's wrong.",
  },
  {
    icon: Brain,
    title: "AI analyzes it",
    description: "Cost estimates, labor rates, and your budget — all considered.",
  },
  {
    icon: Users,
    title: "Decide together",
    description: "Household members vote. Everyone sees the same data.",
  },
  {
    icon: Zap,
    title: "Take action",
    description: "DIY tutorial or contractor email — we help you execute.",
  },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works">
      <AnimatedElement>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            From problem to solution in four steps
          </p>
        </div>
      </AnimatedElement>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <AnimatedElement key={i} delay={i * 100}>
            <div className="relative">
              <div className="text-6xl font-bold text-muted/30 absolute -top-4 -left-2">
                {i + 1}
              </div>
              <div className="relative pt-8">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </Section>
  );
}
