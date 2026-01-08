import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBudgetSettings } from "./actions";
import { BudgetSettingsForm } from "./BudgetSettingsForm";

export default async function BudgetSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const settings = await getBudgetSettings(user.id);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">
            Budget Settings
          </h1>
          <p className="text-sm text-[#666]">
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
