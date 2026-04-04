"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoChatbox, IoStar, IoCheckmarkCircle } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


interface Testimonial {
  quote: string;
  author: string;
  context: string;
  highlight?: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I was unsure about what was wrong with my Porsche. OpportunIQ's decision frame helped me understand the risk factors and potential outcomes before making any decisions.",
    author: "Kevin H.",
    context: "Automotive diagnosis",
    highlight: "Risk assessment",
    rating: 5,
  },
  {
    quote: "Had an algae situation in my pond. The platform showed me exactly what safety considerations to keep in mind and what complications might arise—without pushing me toward any specific solution.",
    author: "Kevin W.",
    context: "Property maintenance",
    highlight: "Safety insights",
    rating: 5,
  },
  {
    quote: "Finally, a tool that helps me think through decisions instead of just telling me what to do. The risk visualization made it clear what I was dealing with.",
    author: "Marcus T.",
    context: "First-time decision maker",
    rating: 5,
  },
  {
    quote: "We use it together to evaluate projects. The neutral analysis helps us make choices without the usual back-and-forth.",
    author: "David & Lisa K.",
    context: "Joint decision making",
    highlight: "Collaborative analysis",
    rating: 5,
  },
  {
    quote: "The safety equipment recommendations alone are worth it. I never would have thought about some of these considerations on my own.",
    author: "Sarah M.",
    context: "Safety-conscious user",
    highlight: "PPE guidance",
    rating: 5,
  },
  {
    quote: "No sales pitch, no pressure—just clear information about risks, time, and what could go wrong. Exactly what I needed.",
    author: "James R.",
    context: "Informed decision maker",
    rating: 5,
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);


  useEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".testimonials-header > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.from(".testimonial-card", {
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative py-24"
      style={{
        background: "linear-gradient(180deg, #FAFAF9 0%, #FFFFFF 100%)",
      }}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="testimonials-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <IoCheckmarkCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Trusted by Decision Makers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Real People, Real Insights
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            See how others use OpportunIQ to analyze risk, understand safety considerations, and make informed decisions.
          </p>
        </div>
        <div className="testimonials-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
            >
              <IoChatbox className="w-8 h-8 text-blue-500/20 mb-4" />
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <IoStar key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {testimonial.context}
                  </p>
                </div>
                {testimonial.highlight && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {testimonial.highlight}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "2,400+", label: "On the Waitlist" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "4.9/5", label: "User Rating" },
            { value: "15+", label: "Risk Categories" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
