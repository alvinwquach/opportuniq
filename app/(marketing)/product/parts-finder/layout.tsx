import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Parts Finder",
  description:
    "Find the right parts for your repair. Match by model, get recommendations, and compare prices.",
  path: "/product/parts-finder",
});

export default function PartsFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
