import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getExpenseData } from "./actions/getExpenseData";
import { ExpensePageClient } from "./ExpensePageClient";


export default async function ExpensesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { expenses } = await getExpenseData(user.id);

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
          <span className="text-white">Expenses</span>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Expenses</h1>
          <p className="text-sm text-[#666]">
            Track your expenses to understand your spending patterns and stay on
            budget.
          </p>
        </div>
        <ExpensePageClient userId={user.id} initialExpenses={expenses} />
      </div>
    </div>
  );
}
