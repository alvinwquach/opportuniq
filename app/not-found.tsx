import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        <h1 className="font-display text-8xl md:text-9xl font-bold text-primary mb-6">404</h1>
        <div className="mx-auto max-w-xs mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="w-full h-auto"
          >
            <circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <line x1="100" y1="100" x2="140" y2="140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
            <text x="70" y="85" fontSize="40" textAnchor="middle" className="fill-muted-foreground font-bold">?</text>
          </svg>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Page not found
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/#faq">
              <Search className="h-4 w-4" />
              View FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
