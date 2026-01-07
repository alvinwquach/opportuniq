import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users, userIncomeStreams, groupMembers } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { DashboardSidebar, DashboardContent, SidebarProvider, ThemeSync } from "@/app/dashboard/components";

export const dynamic = "force-dynamic";

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

export default async function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login?redirect=/issues");
  }

  const [userData] = await db.select().from(users).where(eq(users.id, user.id));

  if (!userData) {
    redirect("/onboarding");
  }

  const [incomeStreams] = await Promise.all([
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

  let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const hourlyRate = (monthlyIncome * 12) / 2080;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  const isAdmin = userData.role === "admin";
  const savedTheme = userData.preferences?.theme ?? null;

  return (
    <SidebarProvider>
      <ThemeSync savedTheme={savedTheme} />
      <div className="min-h-screen bg-[#0c0c0c] flex">
        <DashboardSidebar
          user={{
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatarUrl,
          }}
          isAdmin={isAdmin}
          accessTier={userData.accessTier as "johatsu" | "alpha" | "beta" | "public" | undefined}
        />
        <DashboardContent
          user={{
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatarUrl,
            postalCode: userData.postalCode,
            accessTier: userData.accessTier || "alpha",
            role: userData.role,
          }}
          isAdmin={isAdmin}
          financials={
            monthlyIncome > 0
              ? {
                  monthlyIncome,
                  hourlyRate,
                }
              : null
          }
          notifications={[]}
          calendarEvents={[]}
        >
          {children}
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
