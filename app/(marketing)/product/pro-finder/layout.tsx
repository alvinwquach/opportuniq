import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pro Finder",
  description:
    "Find vetted professionals for home and auto repairs. Get quotes and book with confidence.",
  path: "/product/pro-finder",
});

export default function ProFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
