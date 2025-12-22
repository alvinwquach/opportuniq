"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes. The core product is free forever — no premium tiers, no feature gates. We may add optional paid integrations later, but you'll never pay for what you're using today.",
  },
  {
    q: "How does it identify what's wrong?",
    a: "Upload a photo, video, or voice note describing the issue. Our AI analyzes it, identifies the problem, estimates costs based on your location, and factors in your skill level to make a recommendation. We also consider current tariffs and pricing trends to help you time your purchase.",
  },
  {
    q: "Is my data private?",
    a: "Yes. We use industry-standard encryption for all data in transit and at rest. You control what information gets shared with contractors, and you can delete your data at any time from your account settings.",
  },
  {
    q: "How do you find contractors?",
    a: "We search public data from Yelp, Google, Angi, and other sources. We show you ratings, pricing, and reviews. Then we draft a personalized email and send it through your Gmail or Outlook — you approve before it goes out.",
  },
  {
    q: "Can my whole household use it?",
    a: "Yes. Invite family members with different permission levels: owners can approve expenses, co-owners can vote, and viewers can see recommendations. Everyone sees the same information.",
  },
  {
    q: "What if the recommendation is wrong?",
    a: "We show confidence levels and explain our reasoning. When we're uncertain, we ask follow-up questions. After you complete a repair, you can log the actual outcome to help improve future recommendations.",
  },
];

export function FAQSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/50" />
      <div className="relative mx-auto max-w-3xl px-6">
        <div
          ref={ref}
          className={cn(
            "text-center mb-16 opacity-0",
            inView && "animate-fade-up"
          )}
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Common questions
          </h2>
        </div>
        <div
          className={cn(
            "opacity-0",
            inView && "animate-fade-up"
          )}
          style={{ animationDelay: "100ms" }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border py-6 first:border-t transition-all"
              >
                <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
