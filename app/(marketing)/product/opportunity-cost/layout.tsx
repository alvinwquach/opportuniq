import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Opportunity Cost",
  description:
    "Compare DIY vs professional costs and see how mistakes compound. Make informed home and auto repair decisions.",
  path: "/product/opportunity-cost",
});

export default function OpportunityCostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
