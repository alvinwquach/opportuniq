import { getCachedUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getGroupDetails } from "../actions";
import { GroupDashboard } from "./GroupDashboard";

interface GroupPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { groupId } = await params;

  const result = await getGroupDetails(groupId);

  if (!result.success || !result.group) {
    notFound();
  }

  return (
    <GroupDashboard
      group={result.group}
      membership={result.membership!}
      members={result.members!}
      pendingInvitations={result.pendingInvitations ?? []}
      constraints={result.constraints ?? null}
      currentUserId={result.currentUserId!}
      isCoordinator={result.isCoordinator!}
      isCollaborator={result.isCollaborator!}
      sharedBalance={result.sharedBalance!}
    />
  );
}
