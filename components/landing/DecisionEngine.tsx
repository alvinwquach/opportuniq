import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Wrench,
  HardHat,
  Timer,
  CheckCircle2,
  Lightbulb,
  LucideIcon,
} from "lucide-react";

const decisionOptions: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
}[] = [
  {
    icon: Wrench,
    title: "DIY it",
    description: "Parts are cheap, job is straightforward, and you've got the time and tools",
    iconClass: "bg-primary/10 text-primary",
  },
  {
    icon: HardHat,
    title: "Call a pro",
    description: "Your time is worth more than the labor cost, or you might make it worse",
    iconClass: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Timer,
    title: "Wait it out",
    description: "Prices are dropping, it's not urgent, or you need to save up first",
    iconClass: "bg-yellow-500/10 text-yellow-500",
  },
];

export function DecisionEngine() {
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <AnimatedElement>
          <Section.Header
            align="left"
            badge={
              <Badge variant="secondary" className="border border-border/50">
                <Brain className="h-3 w-3 mr-1.5" />
                Decision Engine
              </Badge>
            }
            title="DIY, hire, or wait?"
            description="Every recommendation is personalized. Your income matters. Your skill level matters. How much you actually enjoy this stuff matters."
            className="mb-8"
          />

          <div className="space-y-4">
            {decisionOptions.map((option, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${option.iconClass}`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{option.title}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-lg">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <p className="font-semibold">Dripping kitchen faucet</p>
              <p className="text-sm text-muted-foreground">
                Constant drip, about 1 drop/second
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">DIY</p>
                    <p className="text-xs text-primary">Recommended for you</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$8</p>
                  <p className="text-xs text-muted-foreground">30 min</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5" />
                  <p className="font-medium">Hire a plumber</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$150</p>
                  <p className="text-xs text-muted-foreground">Same day</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Wait</p>
                    <p className="text-xs text-muted-foreground">
                      Wastes ~$20/mo in water
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-destructive">Not recommended</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/20">
              <p className="text-sm">
                <Lightbulb className="inline h-4 w-4 mr-1.5 text-yellow-500" />
                <strong>Why DIY?</strong> You marked yourself as "comfortable with
                basic tools." This is a 30-minute job with a $8 part.
              </p>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
}
