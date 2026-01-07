import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getUserSchedules,
  getUserIssuesForScheduling,
  getUserIncomeForCalendar,
  getUserExpensesForCalendar,
  getGroupExpensesForCalendar,
} from "./actions";
import { DIYCalendar } from "./DIYCalendar";
import { IoCalendar } from "react-icons/io5";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/calendar");
  }

  // Fetch all calendar data in parallel
  const [
    schedulesResult,
    issuesResult,
    incomeResult,
    userExpensesResult,
    groupExpensesResult,
  ] = await Promise.all([
    getUserSchedules(),
    getUserIssuesForScheduling(),
    getUserIncomeForCalendar(),
    getUserExpensesForCalendar(),
    getGroupExpensesForCalendar(),
  ]);

  const schedules = schedulesResult.success ? schedulesResult.schedules || [] : [];
  const issues = issuesResult.success ? issuesResult.issues || [] : [];
  const incomeEvents = incomeResult.success ? incomeResult.incomeEvents || [] : [];
  const userExpenses = userExpensesResult.success ? userExpensesResult.expenseEvents || [] : [];
  const groupExpenses = groupExpensesResult.success ? groupExpensesResult.expenseEvents || [] : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center">
            <IoCalendar className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Calendar</h1>
            <p className="text-sm text-[#666]">DIY tasks, income & expenses at a glance</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-[#0c0c0c] rounded-xl border border-[#1f1f1f] p-4 min-h-0">
        <DIYCalendar
          initialSchedules={schedules}
          userIssues={issues}
          incomeEvents={incomeEvents}
          userExpenses={userExpenses}
          groupExpenses={groupExpenses}
        />
      </div>
    </div>
  );
}
