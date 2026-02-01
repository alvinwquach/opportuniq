import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Guides",
  description:
    "Step-by-step DIY guides from iFixit, YouTube, Reddit, and more. One place to find repair instructions.",
  path: "/product/guides",
});

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
