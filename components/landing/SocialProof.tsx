"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Diagnosed my Cayenne's torque converter failure in minutes and showed me 3 top-rated Porsche specialists. Saved hours of calling around.",
    author: "Marcus Johnson",
    role: "Property manager",
    avatar: "MJ",
    color: "bg-blue-500",
  },
  {
    quote:
      "Told me my ceiling crack was cosmetic, not structural. Saved me a $400 inspection and showed me exactly what I needed from Lowe's for $18.",
    author: "Amanda Foster",
    role: "First-time homeowner",
    avatar: "AF",
    color: "bg-purple-500",
  },
  {
    quote:
      "Identified my dad's vintage stereo model, warned me not to crank it on first power-up, and gave me the exact wiring diagram. Works perfectly.",
    author: "Sarah Chen",
    role: "Software engineer",
    avatar: "SC",
    color: "bg-green-500",
  },
  {
    quote:
      "Diagnosed my washing machine leak in 30 seconds, found the part locally for $35, and I fixed it myself. Saved $200 on a service call.",
    author: "David Park",
    role: "College student",
    avatar: "DP",
    color: "bg-orange-500",
  },
  {
    quote:
      "Stopped me from installing a ceiling fan on an unsafe box. Found electricians, drafted the emails, and explained the risk. Best $220 I spent.",
    author: "Jessica Rivera",
    role: "Apartment renter",
    avatar: "JR",
    color: "bg-pink-500",
  },
  {
    quote:
      "Researched all the parts for my Plex server, found them in stock locally, and warned me about cooling requirements. Running perfectly for 6 months.",
    author: "Carlos Martinez",
    role: "IT consultant",
    avatar: "CM",
    color: "bg-cyan-500",
  },
];

export function SocialProof() {
  // Duplicate testimonials for seamless loop
  const extendedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Trusted by thousands making better decisions
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From repairs to setups to complex projects—see how OpportuniQ helps people save time and money.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="overflow-hidden">
            <div className="flex gap-6 animate-scroll hover:pause-animation">
              {extendedTestimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="flex-none w-87.5 md:w-100"
                >
                  <div className="relative h-full p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                    <div className="relative">
                      <div className="flex gap-0.5 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <blockquote className="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0",
                            testimonial.color
                          )}
                        >
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {testimonial.author}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-400px * ${testimonials.length} - 24px * ${testimonials.length}));
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-350px * ${testimonials.length} - 24px * ${testimonials.length}));
            }
          }
        }
      `}</style>
    </section>
  );
}
