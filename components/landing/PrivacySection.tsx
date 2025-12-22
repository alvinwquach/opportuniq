import { Section, AnimatedElement } from "./shared";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Lock, text: "Local-first processing" },
  { icon: Shield, text: "End-to-end encryption" },
  { icon: Eye, text: "No third-party data sharing" },
  { icon: CheckCircle2, text: "GDPR & CCPA compliant" },
];

export function PrivacySection() {
  return (
    <Section>
      <AnimatedElement>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Your data stays yours
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            We process locally when we can. Cloud processing is encrypted and
            deleted immediately after. We never sell your data. Your financial
            information stays on your device — you control what you share.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {features.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedElement>
    </Section>
  );
}
