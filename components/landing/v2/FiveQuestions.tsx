"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText, CustomEase } from "@/lib/gsap";
import {
  IoShieldCheckmark,
  IoAlarm,
  IoBuild,
  IoCash,
  IoPeople,
} from "react-icons/io5";
import type { IconType } from "react-icons";

const questions: {
  icon: IconType;
  question: string;
  detail: string;
  color: string;
  iconColor: string;
  bg: string;
  border: string;
}[] = [
  {
    icon: IoShieldCheckmark,
    question: "Is it safe?",
    detail: "Should I turn off the water? Is this outlet dangerous? Can I drive with that noise?",
    color: "text-red-600",
    iconColor: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: IoAlarm,
    question: "Is it urgent?",
    detail: "Handle it this weekend or call someone right now?",
    color: "text-amber-600",
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: IoBuild,
    question: "What do I need?",
    detail: "A $12 part, a specific tool, or a licensed professional?",
    color: "text-blue-600",
    iconColor: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: IoCash,
    question: "What should it cost?",
    detail: "Real data, not a guess. DIY vs professional — before you decide.",
    color: "text-emerald-600",
    iconColor: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: IoPeople,
    question: "Do I need a pro?",
    detail: "And if so, who? The AI finds rated contractors and drafts the email.",
    color: "text-purple-600",
    iconColor: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

export function FiveQuestions() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const ease = CustomEase.get("spring") ? "spring" : "power3.out";

      if (headingRef.current) {
        const split = new SplitText(headingRef.current, { type: "words" });
        gsap.set(split.words, { clipPath: "inset(0 0 100% 0)", display: "inline-block" });
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(split.words, {
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.06,
              duration: 0.6,
              ease,
            });
          },
          once: true,
        });
      }

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          onEnter: () => {
            gsap.to(card, {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.6,
              delay: i * 0.08,
              ease,
            });
          },
          once: true,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="what-you-can-do" className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split layout: problem statement left, questions right */}
        <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
          {/* Left — problem statement (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
              The problem
            </p>
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight"
            >
              Something breaks. You have five questions and zero answers.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              You spend hours googling, watching random YouTube videos, calling
              contractors who never call back, and still don&apos;t know if it&apos;s
              urgent, what it should cost, or whether you even need a professional.
            </p>
          </div>

          {/* Right — five question cards */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`flex items-start gap-4 p-5 rounded-2xl ${q.bg} border ${q.border} hover:shadow-sm transition-shadow duration-200 cursor-default`}
              >
                <q.icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${q.iconColor}`} />
                <div>
                  <h3
                    className={`text-lg font-bold ${q.color} mb-1`}
                  >
                    {q.question}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {q.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
