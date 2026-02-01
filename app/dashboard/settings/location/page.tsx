import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LocationForm } from "./LocationForm";

export default async function LocationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard/settings"
            className="text-[#666] hover:text-white transition-colors"
          >
            Settings
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-white">Location</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Location</h1>
          <p className="text-sm text-[#666]">
            Set your location to find contractors and stores near you.
          </p>
        </div>

        <LocationForm
          initialValues={{
            zipCode: "",
            address: "",
            searchRadius: 25,
            distanceUnit: "miles",
          }}
        />
      </div>
    </div>
  );
}
