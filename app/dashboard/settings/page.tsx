import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsNav } from "./components/SettingsNav";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>
          <p className="text-sm text-[#666]">
            Manage your account, preferences, and integrations.
          </p>
        </div>

        <SettingsNav />
      </div>
    </div>
  );
}
