"use client";

import { IoStar } from "react-icons/io5";

const testimonials = [
  {
    name: "Alex Chen",
    role: "Homeowner, San Jose",
    text: "I was ready to call a plumber for $200. OpportunIQ showed me it was just a $8 O-ring. Fixed it in 30 minutes.",
    savings: "$192 saved",
  },
  {
    name: "Maria Rodriguez",
    role: "First-time homeowner, Oakland",
    text: "Finally, someone who tells me honestly when I can't do it myself. Saved me from a dangerous electrical DIY.",
    savings: "Safety first",
  },
  {
    name: "James Park",
    role: "Property manager, Mountain View",
    text: "Managing 5 properties used to mean endless contractor calls. Now I know what's urgent and what can wait.",
    savings: "$3,200 saved this year",
  },
];

export function SocialProofSection() {
  return (
    <section className="relative py-32 bg-neutral-950 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <IoStar key={i} className="w-6 h-6 text-amber-400" />
            ))}
          </div>
          <p className="text-neutral-400">Trusted by thousands of homeowners</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800"
            >
              <p className="text-neutral-300 mb-6 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="border-t border-neutral-800 pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-neutral-500">{testimonial.role}</p>
                <p className="text-sm text-emerald-400 font-medium mt-2">
                  {testimonial.savings}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
