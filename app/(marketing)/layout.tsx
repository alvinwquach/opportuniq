import { Navbar, Footer } from "@/components/landing";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ colorScheme: "light" }}>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
