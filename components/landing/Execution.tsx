import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Mail, CheckCircle2 } from "lucide-react";

const features = [
  "Pre-written emails to contractors (customized for your issue)",
  "Price comparisons for parts from major retailers",
  "Step-by-step tutorials matched to your skill level",
  "Calendar integration for scheduled repairs",
  "Expense logging when the job is done",
];

export function Execution() {
  return (
    <Section background="muted">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimatedElement>
          <Section.Header
            align="left"
            badge={
              <Badge variant="secondary" className="border border-border/50">
                <Zap className="h-3 w-3 mr-1.5" />
                Execution Assistance
              </Badge>
            }
            title={
              <>
                We don&apos;t just tell you —
                <br />
                we help you do it
              </>
            }
            description="Decided to hire someone? We draft the email. Decided to DIY? We link the tutorials. Need to schedule it for later? We'll remind you."
            className="mb-8"
          />
          <ul className="space-y-3">
            {features.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Draft email to contractor
              </p>
            </div>
            <div className="p-5">
              <div className="rounded-xl bg-muted/30 border border-border/50 p-4 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>To: ABC Heating & Air</span>
                  <Badge variant="secondary" className="text-xs">
                    Best match
                  </Badge>
                </div>
                <p className="mb-3">Hi,</p>
                <p className="mb-3 text-muted-foreground">
                  I have a 15-year-old Carrier HVAC system that&apos;s not cooling as
                  efficiently as it used to. It runs constantly but the house
                  only gets down to about 74°F on hot days.
                </p>
                <p className="mb-3 text-muted-foreground">
                  I&apos;m looking for a diagnosis and repair estimate, or if
                  replacement is recommended, a quote for that as well.
                </p>
                <p className="text-muted-foreground">
                  I&apos;m available weekday evenings or weekends. Thanks!
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Mail className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  Send to all 3
                </Button>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
}
