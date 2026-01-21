import {
  Hero,
  Problem,
  TrustCluster,
  LiveRiskAnalysisDemoLazy,
  FinalCTA,
} from "@/components/landing";
import { OpportunityCostCalculatorLazy } from "@/components/landing/charts/OpportunityCostCalculatorLazy";

export default function Page() {
  return (
    <>
      <main className="relative min-h-screen overflow-x-hidden antialiased">
        <Hero />
        <Problem />
        <OpportunityCostCalculatorLazy />
        <LiveRiskAnalysisDemoLazy />
        <TrustCluster />
        <FinalCTA />
      </main>
    </>
  );
}
