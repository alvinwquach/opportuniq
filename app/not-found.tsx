import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoHome, IoSearch } from "react-icons/io5";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-[#5eead4]">404</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Page not found
        </h2>
        <p className="text-[#888888] mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="gap-2 bg-[#5eead4] hover:bg-[#5eead4]/90 text-black font-medium"
          >
            <Link href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
                    <Button
            asChild
            variant="outline"
            className="gap-2 border-[#2a2a2a] bg-transparent hover:bg-[#1a1a1a] text-white"
          >
            <Link href="/#faq">
              <IoSearch className="h-4 w-4" />
              View FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
