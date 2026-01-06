import { MemberList } from "./MemberList";

interface GroupMembersPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function GroupMembersPage({ params }: GroupMembersPageProps) {
  const { groupId } = await params;

  return <MemberList groupId={groupId} />;
}
