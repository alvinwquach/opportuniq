import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Product",
  description:
    "Smart diagnostics, photo analysis, risk assessment, budget planning, and collaboration. See how OpportunIQ helps you make better home and auto decisions.",
  path: "/product",
});

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
