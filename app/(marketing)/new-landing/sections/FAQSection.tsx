"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { IoChevronDown, IoHelpCircle } from "react-icons/io5";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "How accurate is the AI diagnosis?",
    answer:
      "Our AI has been trained on over 100,000 home repair cases and achieves 94% accuracy in identifying common issues. For complex or unusual problems, we always recommend getting a professional opinion. The AI is designed to give you a solid starting point, not replace expert evaluation when needed.",
  },
  {
    question: "How do DIY vs hire recommendations work?",
    answer:
      "We consider multiple factors: the repair complexity, your self-reported skill level, your hourly time value, required tools, safety risks, and potential consequences of mistakes. We then calculate whether DIY or hiring makes more financial and practical sense for YOUR specific situation.",
  },
  {
    question: "What if I'm not handy at all?",
    answer:
      "That's exactly who we help most! Even if you never pick up a wrench, OpportunIQ helps you avoid overpaying. You'll know what a fair price looks like, what questions to ask contractors, and when a 'complex' repair is actually simple (meaning you're being overcharged).",
  },
  {
    question: "How do you calculate my potential savings?",
    answer:
      "We track industry averages for repair overcharges (35-60% markup is common), time spent researching issues (14 hours average), and costs of wrong DIY/hire decisions. Your personalized savings estimate considers your repair frequency, average costs, and hourly value.",
  },
  {
    question: "Is my home data secure?",
    answer:
      "Absolutely. We use bank-level encryption for all data. Photos are processed locally when possible, and we never share your information with contractors or third parties. You own your data and can delete it anytime.",
  },
  {
    question: "Can I share with my family or roommates?",
    answer:
      "Yes! Household Groups let you share repair history, coordinate on issues, and track spending together. Everyone sees the same dashboard, and you can assign tasks to specific people. Great for couples, families, or shared living situations.",
  },
  {
    question: "What types of repairs does it cover?",
    answer:
      "We cover most common home repairs: plumbing, electrical, HVAC, appliances, structural issues, roofing, and more. Our AI is continuously learning and expanding. If we can't identify something, we'll tell you and suggest next steps.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, no contracts or commitments. You can cancel your subscription anytime from your account settings. You'll keep access until the end of your billing period, and you can export all your data.",
  },
];

export function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const faqsRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      // FAQ items stagger
      const items = faqsRef.current?.querySelectorAll(".faq-item");
      items?.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          delay: i * 0.08,
          scrollTrigger: {
            trigger: faqsRef.current,
            start: "top 75%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 bg-[#0a0a0a]"
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm mb-6">
            <IoHelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Common questions
          </h2>
          <p className="text-lg text-neutral-400">
            Everything you need to know about OpportunIQ
          </p>
        </div>

        {/* FAQ list */}
        <div ref={faqsRef} className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="faq-item rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white pr-8">
                  {faq.question}
                </span>
                <IoChevronDown
                  className={`w-5 h-5 text-neutral-500 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-neutral-400 mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <button className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
