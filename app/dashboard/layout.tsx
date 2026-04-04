import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users, userIncomeStreams, groups, groupMembers } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { DashboardSidebar, DashboardContent, SidebarProvider, ThemeSync } from "./components";

// Force dynamic rendering - dashboard requires auth and database access
export const dynamic = "force-dynamic";

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use cached getUser() - dedupes calls within the same request
  // Middleware already validated, but we cache to prevent duplicate API calls
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Get ONLY essential user data for layout - minimize queries for fast load
  const [userData] = await db.select().from(users).where(eq(users.id, user.id));

  if (!userData) {
    redirect("/onboarding");
  }

  // Fetch income and groups in parallel (needed for sidebar/header)
  const [incomeStreams, userGroups] = await Promise.all([
    db
      .select()
      .from(userIncomeStreams)
      .where(
        and(
          eq(userIncomeStreams.userId, user.id),
          eq(userIncomeStreams.isActive, true)
        )
      ),
    db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, user.id),
          eq(groupMembers.status, "active")
        )
      ),
  ]);

  // Calculate monthly income and hourly rate
  let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const hourlyRate = (monthlyIncome * 12) / 2080;

  // Get avatar from OAuth
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  // Check if user is admin
  const isAdmin = userData.role === "admin";

  // Get user's saved theme preference
  const savedTheme = userData.preferences?.theme ?? null;

  // NOTE: Notifications and calendar events are loaded lazily to speed up initial page load
  // They will be empty initially and can be fetched client-side if needed

  return (
    <SidebarProvider>
      <ThemeSync savedTheme={savedTheme} />
      <div className="min-h-screen bg-gray-50 flex">
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
