import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Smart Diagnostics",
  description:
    "AI-powered diagnosis with confidence scores, potential causes, and severity. Get expert-level guidance in seconds.",
  path: "/product/smart-diagnostics",
});

export default function SmartDiagnosticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
