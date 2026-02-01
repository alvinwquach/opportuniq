"use client";

import { useState, useMemo, useEffect } from "react";
import { IoPeople, IoAddOutline, IoCheckmarkCircle } from "react-icons/io5";
import {
  useGroupsPageData,
  useCreateGroup,
  useUpdateGroup,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import type { GroupRole } from "./types";
import type { GroupDetails as GroupDetailsType } from "@/lib/graphql/types";
import {
  GroupsSkeleton,
  GroupsEmptyState,
  GroupsSidebar,
  GroupDetails,
  NewGroupModal,
  InviteModal,
  SettingsModal,
  RoleModal,
  ContributionHistoryModal,
} from "./components";

export function GroupsClient() {
  const { data, isLoading, error } = useGroupsPageData();
  const queryClient = useQueryClient();

  // Mutations
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const inviteMemberMutation = useInviteMember();
  const updateMemberRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  // State
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showContributionHistory, setShowContributionHistory] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<{
    memberId: string;
    currentRole: GroupRole;
  } | null>(null);

  // Set initial selected group when data loads
  useEffect(() => {
    if (data?.groups && data.groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(data.groups[0].id);
    }
  }, [data?.groups, selectedGroupId]);

  // Find the selected group details
  const selectedGroup = useMemo(() => {
    if (!data || !selectedGroupId) return null;

    // If it's the first group, use the pre-loaded selectedGroup
    if (data.selectedGroup && data.selectedGroup.id === selectedGroupId) {
      return data.selectedGroup;
    }

    // Otherwise, we need to create a minimal GroupDetails from GroupWithStats
    const groupStats = data.groups.find((g) => g.id === selectedGroupId);
    if (!groupStats) return null;

    // Build a minimal GroupDetails (some data will be missing)
    return {
      id: groupStats.id,
      name: groupStats.name,
      postalCode: groupStats.postalCode,
      role: groupStats.role,
      createdAt: groupStats.createdAt,
      openIssueCount: groupStats.activeIssueCount,
      resolvedCount: groupStats.resolvedCount,
      balance: 0, // Not available in GroupWithStats
      savings: groupStats.savings,
      monthlyBudget: null,
      monthlySpent: 0,
      emergencyFund: null,
      members: groupStats.members.map((m) => ({
        id: m.id,
        userId: m.id,
        name: m.name,
        email: "",
        avatar: m.avatar,
        role: m.role,
        joinedAt: null,
        contributions: 0,
        issuesCreated: 0,
        issuesResolved: 0,
      })),
      pendingInvitations: [],
      budgetUsedPercent: 0,
      diyRate: 0,
      contributionData: [],
      monthlySavingsData: [],
      resolutionData: [],
      recentIssues: [],
      recentActivity: [],
    } as GroupDetailsType;
  }, [data, selectedGroupId]);

  // Settings form data
  const settingsFormData = useMemo(() => {
    if (!selectedGroup) {
      return { name: "", postalCode: "", searchRadius: "25", monthlyBudget: "0" };
    }
    return {
      name: selectedGroup.name,
      postalCode: selectedGroup.postalCode || "",
      searchRadius: "25",
      monthlyBudget: selectedGroup.monthlyBudget?.toString() || "0",
    };
  }, [selectedGroup]);

  // Mock contribution history (would come from a separate query)
  const contributionHistory = useMemo(() => {
    if (!selectedGroup) return [];
    return []; // No contribution data in current schema
  }, [selectedGroup]);

  const handleCreateGroup = async (formData: {
    name: string;
    postalCode: string;
    searchRadius: string;
  }) => {
    try {
      await createGroupMutation.mutateAsync({
        name: formData.name,
        postalCode: formData.postalCode || undefined,
        defaultSearchRadius: parseInt(formData.searchRadius) || 25,
      });
      setShowNewGroupModal(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleInviteMember = async (formData: {
    email: string;
    role: GroupRole;
    message: string;
  }) => {
    if (!selectedGroupId) return;
    try {
      await inviteMemberMutation.mutateAsync({
        groupId: selectedGroupId,
        email: formData.email,
        role: formData.role,
      });
      setShowInviteModal(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  const handleSaveSettings = async (formData: {
    name: string;
    postalCode: string;
    searchRadius: string;
    monthlyBudget: string;
  }) => {
    if (!selectedGroupId) return;
    try {
      await updateGroupMutation.mutateAsync({
        id: selectedGroupId,
        input: {
          name: formData.name,
          postalCode: formData.postalCode || undefined,
          defaultSearchRadius: parseInt(formData.searchRadius) || 25,
        },
      });
      setShowSettingsModal(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleDeleteGroup = () => {
    // Would need a deleteGroup mutation
    console.log("Delete group:", selectedGroupId);
    setShowSettingsModal(false);
  };

  const handleChangeRole = (memberId: string, currentRole: string) => {
    setShowRoleModal({ memberId, currentRole: currentRole as GroupRole });
  };

  const handleUpdateRole = async (newRole: GroupRole) => {
    if (!selectedGroupId || !showRoleModal) return;
    try {
      await updateMemberRoleMutation.mutateAsync({
        groupId: selectedGroupId,
        memberId: showRoleModal.memberId,
        role: newRole,
      });
      setShowRoleModal(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    try {
      await removeMemberMutation.mutateAsync({
        groupId: selectedGroupId,
        memberId,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (isLoading) {
    return <GroupsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading groups</p>
          <p className="text-sm text-[#666]">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.groups.length === 0) {
    return (
      <>
        <GroupsEmptyState onCreateGroup={() => setShowNewGroupModal(true)} />
        <NewGroupModal
          isOpen={showNewGroupModal}
          onClose={() => setShowNewGroupModal(false)}
          onSubmit={handleCreateGroup}
          isLoading={createGroupMutation.isPending}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        <GroupsSidebar
          groups={data.groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={() => setShowNewGroupModal(true)}
          totalSavings={data.totalSavings}
        />

        {selectedGroup ? (
          <GroupDetails
            group={selectedGroup}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenInvite={() => setShowInviteModal(true)}
            onOpenContributionHistory={() => setShowContributionHistory(true)}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <IoPeople className="w-8 h-8 text-[#444]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Group Selected</h3>
              <p className="text-sm text-[#666] mb-4">
                Select a group from the sidebar to view members, budget, and activity, or create a new
                group to get started.
              </p>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              >
                <IoAddOutline className="w-4 h-4" />
                Create New Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onSubmit={handleCreateGroup}
        isLoading={createGroupMutation.isPending}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteMember}
        isLoading={inviteMemberMutation.isPending}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSubmit={handleSaveSettings}
        onDelete={handleDeleteGroup}
        initialData={settingsFormData}
        isLoading={updateGroupMutation.isPending}
      />

      {showRoleModal && (
        <RoleModal
          isOpen={true}
          onClose={() => setShowRoleModal(null)}
          onSubmit={handleUpdateRole}
          currentRole={showRoleModal.currentRole}
          isLoading={updateMemberRoleMutation.isPending}
        />
      )}

      <ContributionHistoryModal
        isOpen={showContributionHistory}
        onClose={() => setShowContributionHistory(false)}
        contributions={contributionHistory}
        totalContributions={0}
      />
    </>
  );
}
