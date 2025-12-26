"use client";

import { Section, AnimatedElement, FeatureCard } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Mic, Upload } from "lucide-react";

const inputs = [
  {
    icon: Camera,
    title: "Snap a photo",
    description:
      "Take a picture of the problem. We identify what we're looking at and assess the damage.",
    example:
      '"That\'s efflorescence on your basement wall — mineral deposits from water seeping through."',
  },
  {
    icon: Video,
    title: "Record a video",
    description:
      "Show us what's happening. Perfect for sounds, leaks in action, or anything that moves.",
    example:
      '"That clicking before your furnace ignites is normal. It\'s the igniter."',
  },
  {
    icon: Mic,
    title: "Leave a voice note",
    description:
      "Just describe what's going on. Sometimes that's easier than typing it all out.",
    example:
      '"Your garbage disposal hums but doesn\'t spin. That\'s usually a jam."',
  },
];

export function MediaInput() {
  return (
    <Section>
      <AnimatedElement>
        <Section.Header
          align="left"
          badge={
            <Badge variant="secondary" className="border border-border/50">
              <Upload className="h-3 w-3 mr-1.5" />
              Multi-Modal Input
            </Badge>
          }
          title="Show us what's wrong"
          description="No forms. No dropdowns. Just send us a photo, video, or voice note like you'd text a friend who knows this stuff."
        />
      </AnimatedElement>
      <div className="grid md:grid-cols-3 gap-6">
        {inputs.map((input, i) => (
          <AnimatedElement key={i} delay={i * 100}>
            <div className="group h-full rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <input.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{input.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {input.description}
              </p>
              <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                <p className="text-sm text-muted-foreground italic">
                  {input.example}
                </p>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </Section>
  );
}
