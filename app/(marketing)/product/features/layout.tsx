import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Features",
  description:
    "Risk assessment, decision ledger, learning curve tracking, and smart diagnostics. Explore OpportunIQ product features.",
  path: "/product/features",
});

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
