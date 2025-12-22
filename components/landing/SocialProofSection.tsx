"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Saved us $400 on our first issue. Turned out to be a simple thermostat replacement, not the HVAC failure we feared.",
    author: "Sarah M.",
    role: "Homeowner, Oakland",
    avatar: "SM",
    color: "bg-blue-500",
  },
  {
    quote:
      "Finally, my husband and I can see the same info and make decisions together. No more arguing about whether to call a pro.",
    author: "Jennifer K.",
    role: "Homeowner, Austin",
    avatar: "JK",
    color: "bg-purple-500",
  },
  {
    quote:
      "The tariff alerts saved me hundreds. I was about to replace my water heater but waited 2 months based on their pricing forecast. Spot on.",
    author: "Marcus T.",
    role: "Homeowner, Seattle",
    avatar: "MT",
    color: "bg-primary",
  },
];

const metrics = [
  { value: "$847", label: "Avg. savings per household", sublabel: "first year" },
  { value: "4.2x", label: "Faster decisions", sublabel: "than guessing" },
  { value: "89%", label: "Recommendation accuracy", sublabel: "verified outcomes" },
];

export function SocialProofSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/50" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={cn(
            "grid md:grid-cols-3 gap-8 mb-24 opacity-0",
            inView && "animate-fade-up"
          )}
        >
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="font-display text-5xl md:text-6xl font-bold gradient-text-coral mb-2">
                {metric.value}
              </p>
              <p className="font-medium text-lg mb-1">{metric.label}</p>
              <p className="text-sm text-muted-foreground">{metric.sublabel}</p>
            </div>
          ))}
        </div>
        <div
          className={cn(
            "text-center mb-12 opacity-0",
            inView && "animate-fade-up"
          )}
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            From Real Households
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Why homeowners trust Opportuniq
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => {
            const { ref: cardRef, inView: cardInView } = useInView({
              threshold: 0.3,
              triggerOnce: true,
            });

            return (
              <div
                key={i}
                ref={cardRef}
                className={cn(
                  "opacity-0",
                  cardInView && "animate-fade-up"
                )}
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <blockquote className="text-base leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium text-white",
                        testimonial.color
                      )}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
