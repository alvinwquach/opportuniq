"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlRequest } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { IoCheckmark, IoClose, IoTime, IoPeople, IoAlertCircle } from "react-icons/io5";

// GraphQL Queries and Mutations
const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: ID!) {
    group(groupId: $groupId) {
      id
      name
      members {
        id
        userId
        role
        status
        invitedAt
        joinedAt
        approvedAt
        user {
          name
          email
        }
      }
    }
  }
`;

const APPROVE_MEMBER = gql`
  mutation ApproveMember($memberId: ID!) {
    approveGroupMember(memberId: $memberId) {
      id
      status
      approvedAt
    }
  }
`;

const REJECT_MEMBER = gql`
  mutation RejectMember($memberId: ID!) {
    rejectGroupMember(memberId: $memberId) {
      id
      status
      approvedAt
    }
  }
`;

interface Member {
  id: string;
  userId: string;
  role: string;
  status: string;
  invitedAt: string;
  joinedAt: string | null;
  approvedAt: string | null;
  user: {
    name: string | null;
    email: string;
  };
}

interface GroupData {
  group: {
    id: string;
    name: string;
    members: Member[];
  };
}

export function MemberList({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();

  // Fetch group members with TanStack Query
  const { data, isLoading, error } = useQuery<GroupData>({
    queryKey: ["group-members", groupId],
    queryFn: () => graphqlRequest<GroupData>(GET_GROUP_MEMBERS, { groupId }),
  });

  // Approve member mutation
  const approveMutation = useMutation({
    mutationFn: (memberId: string) =>
      graphqlRequest(APPROVE_MEMBER, { memberId }),
    onSuccess: () => {
      // Invalidate and refetch members list
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
    },
    onError: (error: Error) => {
      alert(`Error approving member: ${error.message}`);
    },
  });

  // Reject member mutation
  const rejectMutation = useMutation({
    mutationFn: (memberId: string) =>
      graphqlRequest(REJECT_MEMBER, { memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
    },
    onError: (error: Error) => {
      alert(`Error rejecting member: ${error.message}`);
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
        <div className="text-center">
          <IoAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const members = data?.group?.members ?? [];
  const pendingMembers = members.filter((m) => m.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");
  const rejectedMembers = members.filter((m) => m.status === "rejected");

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <IoPeople className="h-8 w-8 text-primary" />
          <h1 className="font-display text-3xl font-bold">
            {data?.group?.name} - Members
          </h1>
        </div>
        {pendingMembers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <IoTime className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">
                Pending Approval ({pendingMembers.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {member.user.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(member.joinedAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(member.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <IoCheckmark className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(member.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <IoClose className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Active Members ({activeMembers.length})
          </h2>
          <div className="space-y-2">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {member.user.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role: {member.role}
                  </p>
                </div>
                <div className="text-green-600 flex items-center gap-1">
                  <IoCheckmark className="h-4 w-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {rejectedMembers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
              Rejected ({rejectedMembers.length})
            </h2>
            <div className="space-y-2">
              {rejectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between opacity-60"
                >
                  <div>
                    <p className="font-semibold">
                      {member.user.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="text-red-600 flex items-center gap-1">
                    <IoClose className="h-4 w-4" />
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
