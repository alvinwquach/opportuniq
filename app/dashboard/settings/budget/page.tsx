import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBudgetSettings } from "./actions";
import { BudgetSettingsForm } from "./BudgetSettingsForm";

export default async function BudgetSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const settings = await getBudgetSettings(user.id);

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
          <span className="text-gray-900">Budget & Risk</span>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Budget & Risk
          </h1>
          <p className="text-sm text-gray-500">
            Set your budget limits and risk tolerance to get personalized DIY vs
            hire recommendations.
          </p>
        </div>

        <BudgetSettingsForm
          userId={user.id}
          initialValues={{
            monthlyBudget: settings?.monthlyBudget ?? null,
            emergencyBuffer: settings?.emergencyBuffer ?? null,
            riskTolerance: settings?.riskTolerance ?? null,
          }}
        />
      </div>
    </div>
  );
}
