import {
  HeroSection,
  ProblemSolutionSection,
  ProductShowcaseSection,
  TariffSection,
  SocialProofSection,
  ComparisonSection,
  FAQSection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <ProblemSolutionSection />
      <ProductShowcaseSection />
      <TariffSection />
      <SocialProofSection />
      <ComparisonSection />
      <FAQSection />
    </div>
  );
}
