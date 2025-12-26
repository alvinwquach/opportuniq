import {
  Hero,
  ProblemSolution,
  HowItWorks,
  Flexible,
  RepairDemo,
  StereoDemo,
  InteractiveDemo,
  UseCases,
  Testimonials,
  FAQ,
  CTA,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Flexible />
      <RepairDemo />
      <StereoDemo />
      <InteractiveDemo />
      <UseCases />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
