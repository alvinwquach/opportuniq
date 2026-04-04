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
          <span className="text-gray-900">Expenses</span>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Expenses</h1>
          <p className="text-sm text-gray-500">
            Track your expenses to understand your spending patterns and stay on
            budget.
          </p>
        </div>
        <ExpensePageClient userId={user.id} initialExpenses={expenses} />
      </div>
    </div>
  );
}
