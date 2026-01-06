"use client";

import { useState } from "react";
import {
  IoCheckmark,
  IoClose,
  IoTime,
  IoPeople,
  IoAlertCircle,
  IoEllipsisVertical,
  IoPersonRemove,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGroupMembers,
  useApproveMember,
  useRejectMember,
  useRemoveMember,
} from "@/hooks/useGroupMembers";

interface MemberListProps {
  groupId: string;
}

export function MemberList({ groupId }: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch group members
  const { data, isLoading, error } = useGroupMembers(groupId);

  // Mutations
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();
  const removeMutation = useRemoveMember();

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMutation.mutateAsync({
        groupId,
        memberId: memberToRemove.id,
      });
      setMemberToRemove(null);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to remove member:", error);
    }
  };

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

  const members = data?.members ?? [];
  const isCoordinator = data?.isCoordinator ?? false;
  const currentUserId = data?.currentUserId;

  const pendingMembers = members.filter((m) => m.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <IoPeople className="h-8 w-8 text-primary" />
          <h1 className="font-display text-3xl font-bold">Members</h1>
        </div>

        {/* Pending Members */}
        {pendingMembers.length > 0 && isCoordinator && (
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
                      Role: {formatRole(member.role)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        approveMutation.mutate({ groupId, memberId: member.id })
                      }
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <IoCheckmark className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        rejectMutation.mutate({ groupId, memberId: member.id })
                      }
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

        {/* Active Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Active Members ({activeMembers.length})
          </h2>
          <div className="space-y-2">
            {activeMembers.map((member) => {
              const isCurrentUser = member.user.id === currentUserId;
              const isCoordinatorMember = member.role === "coordinator";
              const canRemove =
                isCoordinator && !isCurrentUser && !isCoordinatorMember;

              return (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {member.user.name || "Unknown User"}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Role: {formatRole(member.role)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-green-600 flex items-center gap-1">
                      <IoCheckmark className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    {canRemove && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IoEllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                            onClick={() =>
                              setMemberToRemove({
                                id: member.id,
                                name: member.user.name || member.user.email,
                              })
                            }
                          >
                            <IoPersonRemove className="h-4 w-4 mr-2" />
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revoke Access Confirmation Dialog */}
        <AlertDialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberToRemove?.name}</span>{" "}
                from this group? They will lose access immediately and will be
                notified via email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removeMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                disabled={removeMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {removeMutation.isPending ? "Removing..." : "Yes, Revoke Access"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
