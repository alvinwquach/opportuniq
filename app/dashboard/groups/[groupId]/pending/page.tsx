import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { groupMembers, groups, users } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { IoTime, IoHome, IoMail } from "react-icons/io5";
import Link from "next/link";

interface PendingPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function PendingApprovalPage({ params }: PendingPageProps) {
  const { groupId } = await params;
  
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch group info, membership status, and inviter info
  const [membership] = await db
    .select({
      member: groupMembers,
      group: groups,
      inviter: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(groupMembers)
    .leftJoin(groups, eq(groupMembers.groupId, groups.id))
    .leftJoin(users, eq(groupMembers.invitedBy, users.id))
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id)
      )
    );

  if (!membership) {
    redirect("/dashboard");
  }

  // If approved, redirect to group
  if (membership.member.status === "active") {
    redirect(`/dashboard/groups/${groupId}`);
  }

  // Get inviter's display name (name or email fallback)
  const inviterName = membership.inviter?.name || membership.inviter?.email || "the organizer";

  // If rejected/inactive, show rejection message
  if (membership.member.status === "inactive") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
        <div className="max-w-2xl w-full text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mb-6">
            <IoMail className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-foreground">
            Access Denied
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            <span className="font-semibold text-foreground">{inviterName}</span> has declined your request to join{" "}
            <span className="font-semibold text-foreground">{membership.group?.name}</span>.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">
              <IoHome className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Pending state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-6 animate-pulse">
          <IoTime className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-4 text-foreground">
          Waiting for Approval
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          You&apos;ve been invited to join{" "}
          <span className="font-semibold text-foreground">{membership.group?.name}</span> by{" "}
          <span className="font-semibold text-foreground">{inviterName}</span>
        </p>
        <p className="text-base text-muted-foreground mb-8">
          <span className="font-semibold text-foreground">{inviterName}</span> needs to approve your access.
        </p>
        <div className="bg-muted/50 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li>✓ <span className="font-medium">{inviterName}</span> will be notified of your request</li>
            <li>✓ They&apos;ll verify it&apos;s really you</li>
            <li>✓ Once approved, you&apos;ll get full access</li>
            <li>✓ You&apos;ll receive an email notification</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <IoHome className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href={`/dashboard/groups/${groupId}/pending`}>Check Status</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          If you&apos;re not approved within 24 hours, contact <span className="font-medium">{inviterName}</span> directly.
        </p>
      </div>
    </div>
  );
}
