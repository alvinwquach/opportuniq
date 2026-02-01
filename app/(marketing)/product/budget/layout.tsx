import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Budget",
  description:
    "Plan and track repair budgets. Set limits, track spending, and avoid surprises.",
  path: "/product/budget",
});

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
