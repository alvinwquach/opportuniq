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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard/settings"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Settings
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-gray-900">Location</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Location</h1>
          <p className="text-sm text-gray-500">
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
