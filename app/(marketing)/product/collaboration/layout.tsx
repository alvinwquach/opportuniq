import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Collaboration",
  description:
    "Share decisions with family and household members. Invite, assign, and track projects together.",
  path: "/product/collaboration",
});

export default function CollaborationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
