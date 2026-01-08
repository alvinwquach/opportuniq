import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { groupInvitations, groups, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { InviteDecisionClient } from "./InviteDecisionClient";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Use cached getUser() to prevent duplicate API calls
  const user = await getCurrentUser();

  // Fetch invitation details with inviter info
  const [invitation] = await db
    .select({
      invitation: groupInvitations,
      group: groups,
      inviter: {
        name: users.name,
      },
    })
    .from(groupInvitations)
    .leftJoin(groups, eq(groupInvitations.groupId, groups.id))
    .leftJoin(users, eq(groupInvitations.invitedBy, users.id))
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

  // Determine the accept URL based on login state
  let acceptUrl: string;

  if (user && user.email === invitation.invitation.inviteeEmail) {
    // User is logged in with matching email - go straight to callback
    acceptUrl = `/auth/callback?token=${token}`;
  } else {
    // Not logged in or email doesn't match - show sign-up page
    acceptUrl = `/auth/signup?email=${encodeURIComponent(invitation.invitation.inviteeEmail)}&token=${token}&group=${encodeURIComponent(invitation.group?.name || "")}`;
  }

  // Show the invitation decision UI
  return (
    <InviteDecisionClient
      token={token}
      groupName={invitation.group?.name || "Unknown Group"}
      inviterName={invitation.inviter?.name || "A group member"}
      inviteeEmail={invitation.invitation.inviteeEmail}
      role={invitation.invitation.role}
      message={invitation.invitation.message}
      expiresAt={invitation.invitation.expiresAt.toISOString()}
      acceptUrl={acceptUrl}
    />
  );
}
