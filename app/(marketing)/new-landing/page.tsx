import { Metadata } from "next";
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  FeaturesSection,
  DashboardPreviewSection,
  SavingsCalculatorSection,
  PricingSection,
  FAQSection,
  FinalCTASection,
} from "./sections";

export const metadata: Metadata = {
  title: "OpportunIQ - Stop Losing Money on Home Repairs",
  description:
    "AI-powered home repair decisions. Know when to DIY, when to hire, and never overpay again. Join thousands saving $2,800+ per year.",
  openGraph: {
    title: "OpportunIQ - Stop Losing Money on Home Repairs",
    description:
      "AI-powered home repair decisions. Know when to DIY, when to hire, and never overpay again.",
    type: "website",
  },
};

export default function NewLandingPage() {
  return (
    <main className="bg-[#0a0a0a] overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DashboardPreviewSection />
      <SavingsCalculatorSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}
