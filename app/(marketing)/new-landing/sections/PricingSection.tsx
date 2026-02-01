"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, animateCounter } from "@/lib/gsap";
import { IoCheckmark, IoSparkles, IoRocket } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for occasional home issues",
    features: [
      "3 AI diagnoses per month",
      "Basic DIY vs hire recommendations",
      "Price range estimates",
      "Email support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 9,
    period: "month",
    description: "For proactive homeowners",
    features: [
      "Unlimited AI diagnoses",
      "Personalized recommendations",
      "Detailed cost breakdowns",
      "DIY guides & tutorials",
      "Savings tracking dashboard",
      "Household groups",
      "Priority support",
    ],
    cta: "Start 14-Day Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Family",
    price: 19,
    period: "month",
    description: "For multiple properties or households",
    features: [
      "Everything in Pro",
      "Up to 5 properties",
      "Unlimited household members",
      "Property-specific history",
      "Annual maintenance calendar",
      "Vendor management",
      "Dedicated support",
    ],
    cta: "Start 14-Day Trial",
    highlighted: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        },
      });

      // Cards stagger with scale
      const cards = cardsRef.current?.querySelectorAll(".pricing-card");
      cards?.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 80,
          scale: 0.9,
          duration: 0.7,
          delay: i * 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
        });
      });

      // Animate price counters
      const priceElements = document.querySelectorAll(".price-value");
      priceElements.forEach((el) => {
        const value = parseFloat(el.getAttribute("data-price") || "0");
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: () => {
            animateCounter(el as HTMLElement, value, {
              duration: 1,
              prefix: "$",
              decimals: 0,
            });
          },
          once: true,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return isAnnual ? Math.round(basePrice * 0.8) : basePrice;
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Invest pennies, save thousands
          </h2>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-8">
            The average Pro user saves $2,847/year. That&apos;s a 26x return on
            your subscription.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? "bg-emerald-500 text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isAnnual
                  ? "bg-emerald-500 text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-2 text-xs text-emerald-400">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card relative p-6 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/30 scale-105"
                  : "bg-gradient-to-b from-white/[0.03] to-transparent border-white/5 hover:border-white/10"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-semibold flex items-center gap-1">
                  <IoSparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className="price-value text-4xl font-bold text-white"
                    data-price={getPrice(plan.price)}
                  >
                    ${getPrice(plan.price)}
                  </span>
                  <span className="text-neutral-500">
                    /{plan.price === 0 ? plan.period : isAnnual ? "mo" : "mo"}
                  </span>
                </div>
                {isAnnual && plan.price > 0 && (
                  <div className="text-xs text-emerald-400 mt-1">
                    Billed ${getPrice(plan.price) * 12}/year
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <IoCheckmark
                      className={`w-5 h-5 mt-0.5 ${
                        plan.highlighted ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    />
                    <span className="text-sm text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.highlighted && <IoRocket className="w-4 h-4" />}
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <IoCheckmark className="w-4 h-4 text-emerald-400" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <IoCheckmark className="w-4 h-4 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <IoCheckmark className="w-4 h-4 text-emerald-400" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
