"use client";

import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  PackageX,
  Truck,
  Calendar,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";

const features = [
  { icon: PackageX, text: "Steel, aluminum, and lumber tariff tracking" },
  { icon: Truck, text: "Import cost projections for major appliances" },
  { icon: Calendar, text: "Seasonal pricing patterns (Black Friday, Memorial Day)" },
  { icon: CircleDollarSign, text: "Utility rebates and tax credit deadlines" },
];

export function Tariff() {
  return (
    <Section background="gradient">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimatedElement>
          <Section.Header
            align="left"
            badge={
              <Badge variant="secondary" className="border border-border/50">
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Tariff Intelligence
              </Badge>
            }
            title="Will it cost more if you wait?"
            description="Tariffs on building materials, appliances, and imported parts change prices constantly. We track trade policy, supply chain data, and manufacturer announcements so you can time your purchases strategically."
            className="mb-8"
          />

          <div className="space-y-3">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-yellow-500 shrink-0" />
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden">
            <div className="p-5 border-b border-border/50 bg-muted/30">
              <p className="font-semibold">Water Heater Replacement</p>
              <p className="text-sm text-muted-foreground">
                50-gallon gas, your zip code
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground">Current price range</p>
                  <p className="text-2xl font-bold">$1,200 – $1,800</p>
                </div>
                <p className="text-sm text-muted-foreground">Installed</p>
              </div>
              <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Price increase expected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Steel tariffs take effect March 1. Prices may rise 12-18%. If
                      you can wait 3-4 months after, prices often stabilize.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Buy now</p>
                  <p className="font-bold text-primary">$1,400</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-muted-foreground mb-1">March est.</p>
                  <p className="font-bold text-yellow-600 dark:text-yellow-500">$1,650</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">June est.</p>
                  <p className="font-bold">$1,500</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
}
