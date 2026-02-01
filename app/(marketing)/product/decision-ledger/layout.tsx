import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Decision Ledger",
  description:
    "Track every repair decision, cost, and outcome. Learn from past choices and improve over time.",
  path: "/product/decision-ledger",
});

export default function DecisionLedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
