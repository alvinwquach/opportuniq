import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoHome, IoSearch } from "react-icons/io5";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-blue-600">404</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Link href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
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
