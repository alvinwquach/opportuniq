import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users, userIncomeStreams } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { SettingsPageClient } from "./SettingsPageClient";

// Frequency multipliers to convert to monthly
const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user data and income streams
  const [userData, incomeStreams] = await Promise.all([
    db.select().from(users).where(eq(users.id, user.id)).then(rows => rows[0]),
    db
      .select()
      .from(userIncomeStreams)
      .where(
        and(
          eq(userIncomeStreams.userId, user.id),
          eq(userIncomeStreams.isActive, true)
        )
      ),
  ]);

  if (!userData) {
    redirect("/onboarding");
  }

  // Calculate monthly income and hourly rate
  let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / 2080; // 40 hrs/week * 52 weeks

  return (
    <SettingsPageClient
      monthlyIncome={monthlyIncome}
      annualIncome={annualIncome}
      hourlyRate={hourlyRate}
      postalCode={userData.postalCode}
    />
  );
}
