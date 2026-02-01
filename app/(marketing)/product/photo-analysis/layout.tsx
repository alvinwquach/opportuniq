import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Photo Analysis",
  description:
    "Upload a photo for instant diagnosis. AI-powered analysis for home and auto issues in 100+ languages.",
  path: "/product/photo-analysis",
});

export default function PhotoAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
