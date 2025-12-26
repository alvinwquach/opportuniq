"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Does OpportuniQ cost money?",
    a: "No. OpportuniQ is completely free. We don't sell parts, we don't take commissions from contractors, and we don't make purchases for you. We just do the research and help you make better decisions. If we save you time, money, or a future headache—that's what we're here for.",
  },
  {
    q: "What can OpportuniQ help me with?",
    a: "Anything physical that needs fixing, cleaning, setting up, or configuring—broken appliances, car repairs, stubborn stains, mold removal, home projects, even complex technical setups. Show us with a photo/video or just describe the symptoms in your own words (in any language), and we'll research everything: what's wrong, what cleaning method or parts you need, what could go wrong if you DIY, and whether to hire help. We save you 2-3 hours of research per issue. We don't make purchases for you—we just do the research so you can make informed decisions.",
  },
  {
    q: "How does it work?",
    a: "Show us the problem with a photo, video, voice recording, or just type out the symptoms. OpportuniQ diagnoses the issue, assesses risk (what could go wrong if you DIY), checks your budget, finds parts at local stores (with real stock availability), and recommends DIY or hire. If you choose DIY, we compile a complete guide with step-by-step instructions, tools needed, and safety warnings. If you hire, we draft emails to contractors for you.",
  },
  {
    q: "What if I choose to DIY?",
    a: "We generate a comprehensive DIY guide with: step-by-step instructions, exact parts list with local stores that have it in stock, tools needed (with rent vs. buy comparison), safety warnings, community tips, and estimated time. You get a downloadable PDF you can reference while doing the repair.",
  },
  {
    q: "How do you check if parts are in stock?",
    a: "We research local availability at nearby stores. Enter your zip code and we'll show you stock status with store distances and prices. No more wasted trips.",
  },
  {
    q: "Is my data private?",
    a: "Yes. End-to-end encryption for all photos and budget data. Your financial information never leaves your device—we research for you without seeing your personal details. Photos are only shared with contractors you explicitly approve. You can delete everything at any time.",
  },
  {
    q: "Can it help with complex technical setups?",
    a: "Absolutely. From server racks to home theater systems to vintage electronics. We research manufacturer documentation, find compatible parts, check local stock, surface community knowledge, and compile everything into a guide. Perfect for projects where you can't ask anyone for help.",
  },
  {
    q: "How does budget checking work?",
    a: "Track your income and expenses privately. OpportuniQ checks repair costs against your available budget and tells you if you can afford it now or should defer (if not urgent). We also show rent vs. buy comparisons for tools—e.g., 'Rent pressure washer for $45 vs. buy for $199 (one-time use).' No more financial stress.",
  },
  {
    q: "What about risk assessment?",
    a: "We tell you what could go wrong if you DIY—water damage, electrical hazards, warranty voiding, ceiling collapse. Example: 'DO NOT DIY ceiling fan install—electrical box not rated for fan weight, hire electrician.' We help you avoid expensive mistakes that could cost thousands.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden bg-linear-to-b from-background via-muted/30 to-background">
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Common questions
          </h2>
        </div>
        <div>
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
