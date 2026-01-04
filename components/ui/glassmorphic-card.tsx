"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";

interface GlassmorphicCardProps extends React.ComponentProps<typeof Card> {
  intensity?: "low" | "medium" | "high";
}

export function GlassmorphicCard({
  children,
  className,
  intensity = "medium",
  ...props
}: GlassmorphicCardProps) {
  const intensityClasses = {
    low: "bg-background/40 backdrop-blur-sm",
    medium: "bg-background/60 backdrop-blur-md",
    high: "bg-background/80 backdrop-blur-lg",
  };

  return (
    <Card
      className={cn(
        "border border-border/50",
        "shadow-xl shadow-primary/5",
        "relative overflow-hidden",
        intensityClasses[intensity],
        className
      )}
      {...props}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      {children}
    </Card>
  );
}
