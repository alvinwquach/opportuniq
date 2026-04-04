import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
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
          <span className="text-gray-900">Profile</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Profile</h1>
          <p className="text-sm text-gray-500">
            Your personal information and account details.
          </p>
        </div>

        <ProfileForm
          initialValues={{
            name: user.user_metadata?.name || user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: "",
            avatarUrl: user.user_metadata?.avatar_url || "",
          }}
        />
      </div>
    </div>
  );
}
