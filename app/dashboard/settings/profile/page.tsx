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
          <span className="text-white">Profile</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Profile</h1>
          <p className="text-sm text-[#666]">
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
