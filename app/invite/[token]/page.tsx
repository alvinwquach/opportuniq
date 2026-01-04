import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { groupInvitations, groups } from "@/app/db/schema";
import { eq } from "drizzle-orm";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  // Fetch invitation details
  const [invitation] = await db
    .select({
      invitation: groupInvitations,
      group: groups,
    })
    .from(groupInvitations)
    .leftJoin(groups, eq(groupInvitations.groupId, groups.id))
    .where(eq(groupInvitations.token, token));

  if (!invitation) {
    redirect("/invite/invalid");
  }

  // Check if invitation expired
  if (new Date() > invitation.invitation.expiresAt) {
    redirect(`/invite/expired?email=${encodeURIComponent(invitation.invitation.inviteeEmail)}`);
  }

  // Check if already accepted
  if (invitation.invitation.acceptedAt) {
    redirect("/dashboard");
  }

  // If user logged in and email matches, redirect to callback with token
  if (user && user.email === invitation.invitation.inviteeEmail) {
    redirect(`/auth/callback?token=${token}`);
  }

  // If not logged in or email doesn't match, show sign-up page
  redirect(
    `/auth/signup?email=${encodeURIComponent(invitation.invitation.inviteeEmail)}&token=${token}&group=${encodeURIComponent(invitation.group?.name || "")}`
  );
}
