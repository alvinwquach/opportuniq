import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Brain,
  DollarSign,
  Star,
} from "lucide-react";

export function OutcomeTrackingSection() {
  return (
    <Section>
      <AnimatedElement>
        <Section.Header
          badge={
            <Badge variant="secondary" className="border border-border/50">
              <Target className="h-3 w-3 mr-1.5" />
              Outcome Tracking
            </Badge>
          }
          title="Learn from every decision"
          description="We track what you spent, how long it took, and whether it worked. Over time, your recommendations get smarter."
        />
      </AnimatedElement>

      <div className="grid md:grid-cols-3 gap-6">
        <AnimatedElement>
          <Card className="border-border/50 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Kitchen faucet repair</p>
                  <p className="text-sm text-muted-foreground">
                    Completed 2 months ago
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommendation</span>
                  <span className="font-medium">DIY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated cost</span>
                  <span>$8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual cost</span>
                  <span className="text-primary font-medium">$8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Still working?</span>
                  <span className="text-primary">Yes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <Card className="border-border/50 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold">Garage door opener</p>
                  <p className="text-sm text-muted-foreground">
                    Completed 4 months ago
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommendation</span>
                  <span className="font-medium">Hire</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated cost</span>
                  <span>$350</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual cost</span>
                  <span className="text-yellow-500 font-medium">$420</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Still working?</span>
                  <span className="text-primary">Yes</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                Note: Additional part needed on-site. We&apos;ve updated
                estimates for similar repairs.
              </p>
            </CardContent>
          </Card>
        </AnimatedElement>
        <AnimatedElement delay={200}>
          <Card className="border-border/50 h-full bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Your household patterns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Based on 23 tracked outcomes over 18 months:
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>DIY success rate: 94%</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>Avg savings vs estimate: 8%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Preferred contractor: ABC Plumbing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedElement>
      </div>
    </Section>
  );
}
