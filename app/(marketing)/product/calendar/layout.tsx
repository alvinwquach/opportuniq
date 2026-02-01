import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Calendar",
  description:
    "Schedule maintenance and track repair timelines. Never miss an oil change or filter replacement.",
  path: "/product/calendar",
});

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
