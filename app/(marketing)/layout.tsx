import { Navbar, Footer } from "@/components/landing";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
