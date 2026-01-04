import {
  Hero,
  Problem,
  TrustCluster,
  StaticDemoIllustration,
  LiveRiskAnalysisDemo,
  Testimonials,
  FinalCTA,
} from "@/components/landing";
import { OpportunityCostCalculator } from "@/components/landing/charts/OpportunityCostCalculator";
import { structuredData, organizationSchema, breadcrumbSchema } from "./page-metadata";


export default function LandingPage() {
  // Safely stringify structured data to prevent runtime errors
  // Validate that all schemas have @context before stringifying
  // This prevents browser extensions from throwing errors when parsing JSON-LD
  let structuredDataJson = "[]";
  
  try {
    const schemas = [structuredData, organizationSchema, breadcrumbSchema]
      .filter((schema) => {
        // Strict validation: must be object, have @context, and @context must be a string
        return (
          schema &&
          typeof schema === "object" &&
          schema !== null &&
          "@context" in schema &&
          typeof schema["@context"] === "string" &&
          schema["@context"].length > 0
        );
      })
      .map((schema) => {
        // Ensure @context is always a valid string (defensive programming)
        if (schema && typeof schema === "object" && "@context" in schema) {
          return {
            ...schema,
            "@context": String(schema["@context"] || "https://schema.org"),
          };
        }
        return schema;
      });
    
    // Only stringify if we have valid schemas
    if (schemas.length > 0) {
      structuredDataJson = JSON.stringify(schemas);
    }
  } catch (error) {
    // If anything goes wrong, use empty array to prevent errors
    console.warn("Error preparing structured data:", error);
    structuredDataJson = "[]";
  }
  
  return (
    <>
      {structuredDataJson !== "[]" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredDataJson,
          }}
          suppressHydrationWarning
        />
      )}
      <main className="relative min-h-screen overflow-x-hidden antialiased">
        {/* Zone 1: Hero (Dark #111) - "What is this?" */}
        <Hero />

        {/* Zone 2: Problem / How It Works (Light) - "Do I have this problem?" */}
        <Problem />

        {/* Zone 3: Opportunity Cost Calculator (Dark) - "How does it work for ME?" */}
        <OpportunityCostCalculator />

        {/* Zone 4: Static Demo Illustration (Dark) - "See it in action" */}
        <StaticDemoIllustration />

        {/* Zone 5: Live Risk Analysis Demo with Mapbox & Charts (Dark #111) - Live risk analysis */}
        <LiveRiskAnalysisDemo />

        {/* Zone 6: Trust Cluster / Features (Dark) - "Can I trust this?" */}
        <TrustCluster />

        {/* Zone 7: Testimonials (Light) - "Do others use this?" */}
        <Testimonials />

        {/* Zone 8: Final CTA (Light with gradient) - "How do I get it?" */}
        <FinalCTA />
      </main>
    </>
  );
}
