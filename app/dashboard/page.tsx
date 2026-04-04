/**
 * Dashboard page (app segment).
 *
 * Server-rendered; fetches user and minimal dashboard data (profile, pending
 * invitations) to decide between new-user onboarding and main dashboard.
 * Main dashboard data is then loaded client-side via GraphQL (DashboardClient).
 *
 * Caching: force-dynamic + revalidate 0 so user-specific data is never cached.
 * Loading: app/dashboard/loading.tsx shows DashboardSkeleton until this resolves.
 */
import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import type { SafetyAlert, PendingDecision, OpenIssue } from "./types";
import { NewUserDashboard, PendingInvitationsAlert } from "./components";
import { DashboardClient } from "./v2/DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  // Use cached getUser() - dedupes calls within the same request
  // Layout already validated, but we cache to prevent duplicate API calls
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Fetch minimal data to check for new user state and pending invitations
  let data;
  try {
    data = await getDashboardData(user.id);
  } catch (error) {
    // Return minimal data structure to prevent crash
    data = {
      userProfile: null,
      pendingGroups: [],
    };
  }

  const { userProfile, pendingGroups } = data;

  // Users are considered "new" only if they haven't completed basic onboarding
  const isNewUser = !userProfile?.postalCode;

  // Show new user onboarding flow
  if (isNewUser) {
    return (
      <div className="min-h-[calc(100vh-48px)] lg:min-h-screen overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 overflow-hidden">
          <PendingInvitationsAlert pendingGroups={pendingGroups || []} />
          <NewUserDashboard userProfile={userProfile} />
        </div>
      </div>
    );
  }

  // Main dashboard - uses GraphQL for data fetching
  return (
    <>
      <PendingInvitationsAlert pendingGroups={pendingGroups || []} />
      <DashboardClient />
    </>
  );
}
