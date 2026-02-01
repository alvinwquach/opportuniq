import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Safety & Risk",
  description:
    "Safety hazard identification and risk escalation modeling. Know when to DIY and when to call a pro.",
  path: "/product/safety-risk",
});

export default function SafetyRiskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
