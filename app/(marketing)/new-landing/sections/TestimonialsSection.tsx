"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, scrambleText } from "@/lib/gsap";
import { IoStar } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "I was about to pay $800 for a garbage disposal replacement. OpportunIQ showed me it was a simple reset button issue. Saved me $785 in 5 minutes.",
    author: "Jennifer M.",
    location: "Austin, TX",
    saved: "$785",
    avatar: "👩",
  },
  {
    quote:
      "As a first-time homeowner, I had no idea what was reasonable. This app has become my go-to before I call anyone. Already saved over $2,000 this year.",
    author: "Marcus R.",
    location: "Denver, CO",
    saved: "$2,100",
    avatar: "👨",
  },
  {
    quote:
      "The DIY vs hire recommendations are spot-on. It correctly told me to hire for electrical work I thought I could handle. Probably saved me from a house fire.",
    author: "Sarah K.",
    location: "Seattle, WA",
    saved: "Peace of mind",
    avatar: "👩‍🦰",
  },
  {
    quote:
      "My contractor tried to charge me $1,200 for a 'complex' repair. OpportunIQ diagnosed it as a $30 part replacement. I did it myself in 20 minutes.",
    author: "David L.",
    location: "Portland, OR",
    saved: "$1,170",
    avatar: "👴",
  },
  {
    quote:
      "The time value calculator changed how I think about DIY. Sometimes hiring IS the right call when you factor in your hourly worth.",
    author: "Emily T.",
    location: "Chicago, IL",
    saved: "14+ hours",
    avatar: "👩‍💼",
  },
  {
    quote:
      "I share the household group with my husband. We can both track issues and see repair history. Game changer for home management.",
    author: "Lisa & Tom H.",
    location: "Phoenix, AZ",
    saved: "$3,200",
    avatar: "👫",
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation with scramble
      ScrollTrigger.create({
        trigger: headingRef.current,
        start: "top 80%",
        onEnter: () => {
          if (savedRef.current) {
            scrambleText(savedRef.current, "$6.8M+", {
              duration: 1.5,
              chars: "$0123456789M+",
            });
          }
        },
        once: true,
      });

      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Cards masonry-style stagger
      const cards = cardsRef.current?.querySelectorAll(".testimonial-card");
      cards?.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 60,
          scale: 0.95,
          duration: 0.6,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
        });
      });

      // Continuous horizontal scroll effect for saved amounts
      const savedAmounts = document.querySelectorAll(".saved-amount");
      savedAmounts.forEach((el) => {
        gsap.to(el, {
          backgroundPosition: "200% center",
          duration: 3,
          ease: "linear",
          repeat: -1,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/10 via-transparent to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            Real Results
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            <span ref={savedRef} className="text-emerald-400">
              $6.8M+
            </span>{" "}
            saved by homeowners
          </h2>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Join thousands of homeowners who stopped overpaying and started
            making confident repair decisions.
          </p>
        </div>

        {/* Testimonials grid */}
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="testimonial-card group p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <IoStar key={j} className="w-4 h-4 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-300 leading-relaxed mb-6 text-sm">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Saved amount */}
                <div className="saved-amount px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  Saved {testimonial.saved}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">2,400+</div>
            <div className="text-sm text-neutral-500">Active users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-neutral-500">Average rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">94%</div>
            <div className="text-sm text-neutral-500">Would recommend</div>
          </div>
        </div>
      </div>
    </section>
  );
}
