import { Button } from "@/components/ui/button";
import { IoCloseCircle, IoHome } from "react-icons/io5";
import Link from "next/link";

export default function InviteInvalidPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto max-w-xs mb-8">
          <IoCloseCircle className="h-24 w-24 text-red-500 mx-auto" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Invalid Invitation
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          This invitation link is invalid or has already been used. Please check your email for the correct link or request a new invitation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <IoHome className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
