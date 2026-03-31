// Tell React and Next.js to run this component in the browser (client-side).
// Without this, none of the hooks (useState, useMemo, useEffect) would work.
"use client";

// useState   = track pieces of UI state (selected group, which modal is open, etc.)
//              that cause the component to re-render when changed.
// useMemo    = cache derived/computed values so they are only recalculated when
//              their inputs actually change, not on every render.
// useEffect  = run a side-effect AFTER the component renders — here used to
//              automatically select the first group once data loads.
import { useState, useMemo, useEffect } from "react";

// Icon components from the react-icons library (Ionicons 5 set).
// IoPeople       = people silhouette icon (used for the "no group selected" empty state).
// IoAddOutline   = "+" icon (used on the "Create New Group" button).
// IoCheckmarkCircle = checkmark icon (imported but not directly used in this file;
//                    may be used by child components via shared imports).
import { IoPeople, IoAddOutline, IoCheckmarkCircle } from "react-icons/io5";

// Custom TanStack Query hooks for the Groups page.
// useGroupsPageData    = fetches all groups with their stats; returns { data, isLoading, error }.
// useCreateGroup       = mutation to create a new group.
// useUpdateGroup       = mutation to edit a group's settings (name, postal code, etc.).
// useInviteMember      = mutation to send an invitation email to a new member.
// useUpdateMemberRole  = mutation to change an existing member's role.
// useRemoveMember      = mutation to remove a member from a group.
import {
  useGroupsPageData,
  useCreateGroup,
  useUpdateGroup,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/lib/hooks";

// useQueryClient lets us manually invalidate (expire) cached query results so
// TanStack Query will re-fetch fresh data from the server after a mutation succeeds.
import { useQueryClient } from "@tanstack/react-query";

// queryKeys is a centralized registry of cache keys so invalidation calls are
// consistent and don't accidentally invalidate the wrong queries.
import { queryKeys } from "@/lib/hooks/keys";

// GroupRole = TypeScript union type for the possible roles a member can have
// ("coordinator" | "collaborator" | "participant" | "contributor" | "observer").
import type { GroupRole } from "./types";

// GroupDetails = TypeScript type describing the full detail shape of a group
// (members, budget, charts, activity feed, etc.) as returned by the server.
import type { GroupDetails as GroupDetailsType } from "@/lib/hooks/types";

// Import every modal and sub-component used on this page.
// GroupsSkeleton           = loading placeholder for the whole groups layout.
// GroupsEmptyState         = message shown when the user has no groups yet.
// GroupsSidebar            = left sidebar list of group cards + "New Group" button.
// GroupDetails             = main content panel showing a selected group's details.
// NewGroupModal            = dialog to create a new group.
// InviteModal              = dialog to invite a new member by email.
// SettingsModal            = dialog to edit group name, postal code, budget.
// RoleModal                = dialog to change a member's role.
// ContributionHistoryModal = dialog showing all contribution transactions.
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

// GroupsClient is the page-level shell for the Groups section.
// It fetches data, manages modal visibility, and passes data/callbacks
// down to the sidebar and detail panel.
export function GroupsClient() {
  // Fetch all groups and their aggregated stats from the server.
  // isLoading = true while the request is in flight.
  // error     = set if the request fails.
  // data      = { groups: GroupWithStats[], selectedGroup: GroupDetails, totalSavings: number }
  const { data, isLoading, error } = useGroupsPageData();

  // TanStack Query client — used below to invalidate/refetch data after mutations.
  const queryClient = useQueryClient();

  // Set up every mutation hook. Each returns a { mutate, mutateAsync, isPending }
  // object. isPending is used to show loading spinners inside modals.
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const inviteMemberMutation = useInviteMember();
  const updateMemberRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  // The ID of the group the user has clicked on in the sidebar.
  // null = no group selected (shows the "No Group Selected" empty state).
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Whether the "Create New Group" modal is open.
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // Whether the "Invite Member" modal is open.
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Whether the "Group Settings" modal is open.
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Whether the "Contribution History" modal is open.
  const [showContributionHistory, setShowContributionHistory] = useState(false);

  // The "Change Role" modal stores both the target member's ID and their current role.
  // null = the modal is closed; an object = the modal is open for that member.
  const [showRoleModal, setShowRoleModal] = useState<{
    memberId: string;
    currentRole: GroupRole;
  } | null>(null);

  // Side-effect: once the data finishes loading, automatically select the first group
  // in the list so the detail panel isn't blank on initial load.
  // This only runs when data.groups changes AND no group has been manually selected yet.
  useEffect(() => {
    if (data?.groups && data.groups.length > 0 && !selectedGroupId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedGroupId(data.groups[0].id);
    }
  }, [data?.groups, selectedGroupId]);

  // Derive the full GroupDetails object for whichever group is currently selected.
  // useMemo caches this so the lookup only reruns when data or selectedGroupId changes.
  const selectedGroup = useMemo(() => {
    // If there's no data yet or no selection, there's nothing to show.
    if (!data || !selectedGroupId) return null;

    // The server pre-loads full details for the FIRST group. If the user picked
    // that same group, use the pre-loaded details to avoid redundant computation.
    if (data.selectedGroup && data.selectedGroup.id === selectedGroupId) {
      return data.selectedGroup;
    }

    // For any other group, build a minimal GroupDetails from the lighter
    // GroupWithStats object that exists in the sidebar list. Some fields won't
    // be available (balance, pending invitations, chart data) — they default to
    // empty/zero values so the detail panel can still render without crashing.
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
      // Map the lightweight member summaries to the fuller GroupDetails member shape.
      members: groupStats.members.map((m) => ({
        id: m.id,
        userId: m.id,
        name: m.name,
        email: "",       // Email not in the sidebar list data
        avatar: m.avatar,
        role: m.role,
        joinedAt: null,
        contributions: 0,
        issuesCreated: 0,
        issuesResolved: 0,
      })),
      pendingInvitations: [],  // Not in the sidebar list data
      budgetUsedPercent: 0,
      diyRate: 0,
      contributionData: [],    // Not in the sidebar list data
      monthlySavingsData: [],  // Not in the sidebar list data
      resolutionData: [],      // Not in the sidebar list data
      recentIssues: [],        // Not in the sidebar list data
      recentActivity: [],      // Not in the sidebar list data
    } as GroupDetailsType;
  }, [data, selectedGroupId]);

  // Pre-populate the Settings modal form with the currently selected group's values.
  // useMemo recalculates only when selectedGroup changes so the form isn't reset
  // on every unrelated re-render.
  const settingsFormData = useMemo(() => {
    // If no group is selected, return blank defaults so the modal can still render.
    if (!selectedGroup) {
      return { name: "", postalCode: "", searchRadius: "25", monthlyBudget: "0" };
    }
    return {
      name: selectedGroup.name,
      postalCode: selectedGroup.postalCode || "",
      // searchRadius is not stored on the group yet; default to 25 miles.
      searchRadius: "25",
      // Convert the numeric budget to a string so the text input can display it.
      monthlyBudget: selectedGroup.monthlyBudget?.toString() || "0",
    };
  }, [selectedGroup]);

  // Placeholder for contribution history data.
  // Currently always returns an empty array because the schema doesn't store
  // per-member contribution records yet.
  const contributionHistory = useMemo(() => {
    if (!selectedGroup) return [];
    return []; // No contribution data in current schema
  }, [selectedGroup]);

  // Handle submission of the "Create New Group" form.
  // Calls the createGroup mutation, closes the modal, and refetches group data.
  const handleCreateGroup = async (formData: {
    name: string;
    postalCode: string;
    searchRadius: string;
  }) => {
    try {
      await createGroupMutation.mutateAsync({
        name: formData.name,
        // Only send postalCode if the user filled it in.
        postalCode: formData.postalCode || undefined,
        // Convert the string input to a number; fall back to 25 if unparseable.
        defaultSearchRadius: parseInt(formData.searchRadius) || 25,
      });
      // Close the modal after a successful creation.
      setShowNewGroupModal(false);
      // Invalidate the groups cache so TanStack Query re-fetches the updated list.
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  // Handle submission of the "Invite Member" form.
  // Sends the invitation email, closes the modal, and refetches group data.
  const handleInviteMember = async (formData: {
    email: string;
    role: GroupRole;
    message: string;
  }) => {
    // Guard: can't invite if no group is selected.
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

  // Handle submission of the "Group Settings" form.
  // Updates the group's metadata, closes the modal, and refetches group data.
  const handleSaveSettings = async (formData: {
    name: string;
    postalCode: string;
    searchRadius: string;
    monthlyBudget: string;
  }) => {
    // Guard: can't update if no group is selected.
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

  // Handle clicking "Delete Group" inside the Settings modal.
  // A real deleteGroup mutation would be called here; for now it just logs and closes.
  const handleDeleteGroup = () => {
    // Would need a deleteGroup mutation
    console.log("Delete group:", selectedGroupId);
    setShowSettingsModal(false);
  };

  // Open the "Change Role" modal for a specific member.
  // Stores the member ID and their current role so the modal can show the right UI.
  const handleChangeRole = (memberId: string, currentRole: string) => {
    setShowRoleModal({ memberId, currentRole: currentRole as GroupRole });
  };

  // Handle the user confirming a new role for a member inside the Role modal.
  // Calls the mutation, closes the modal, and refetches group data.
  const handleUpdateRole = async (newRole: GroupRole) => {
    // Guard: both a selected group and an open role modal are required.
    if (!selectedGroupId || !showRoleModal) return;
    try {
      await updateMemberRoleMutation.mutateAsync({
        groupId: selectedGroupId,
        memberId: showRoleModal.memberId,
        role: newRole,
      });
      // Close the modal by resetting state to null.
      setShowRoleModal(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.pageData() });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  // Handle clicking "Remove Member" in the member dropdown menu.
  // Calls the mutation and refetches group data (no modal needed for removal).
  const handleRemoveMember = async (memberId: string) => {
    // Guard: can't remove if no group is selected.
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

  // Guard: while the server request is in flight, show the skeleton placeholder layout.
  if (isLoading) {
    return <GroupsSkeleton />;
  }

  // Guard: if the request failed, show a centered error message.
  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading groups</p>
          {/* Show the specific server error message so the user (or developer) knows why. */}
          <p className="text-sm text-[#666]">{error.message}</p>
        </div>
      </div>
    );
  }

  // Guard: if the user has no groups yet, show the empty state with a "Create Group" CTA.
  // Also render the NewGroupModal here so the CTA button can open it.
  if (!data || data.groups.length === 0) {
    return (
      <>
        {/* Empty state passes a callback so the "Create your first group" button
            can open the modal without this component needing to manage the click directly. */}
        <GroupsEmptyState onCreateGroup={() => setShowNewGroupModal(true)} />
        {/* Modal is rendered here (outside the empty state) so it can be opened
            regardless of which empty-state button the user clicked. */}
        <NewGroupModal
          isOpen={showNewGroupModal}
          onClose={() => setShowNewGroupModal(false)}
          onSubmit={handleCreateGroup}
          // Pass mutation pending state so the modal can disable the button while submitting.
          isLoading={createGroupMutation.isPending}
        />
      </>
    );
  }

  // Happy path: data loaded and at least one group exists — render the full layout.
  return (
    <>
      {/* Full-height flex layout: sidebar on the left, detail panel on the right. */}
      <div className="flex min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Left sidebar: scrollable list of group cards and the "New" button.
            Passes totalSavings so the sidebar can show an aggregate savings badge. */}
        <GroupsSidebar
          groups={data.groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={() => setShowNewGroupModal(true)}
          totalSavings={data.totalSavings}
        />

        {/* Right panel: shows either the selected group's details or the "no selection" state. */}
        {selectedGroup ? (
          // Full group detail view with charts, member list, activity feed, etc.
          // Receives callbacks so the child can trigger modals without owning that state.
          <GroupDetails
            group={selectedGroup}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenInvite={() => setShowInviteModal(true)}
            onOpenContributionHistory={() => setShowContributionHistory(true)}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        ) : (
          // Empty state shown when the user hasn't clicked a group yet (e.g. sidebar collapsed).
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              {/* Large icon to visually represent the empty state. */}
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <IoPeople className="w-8 h-8 text-[#444]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Group Selected</h3>
              <p className="text-sm text-[#666] mb-4">
                Select a group from the sidebar to view members, budget, and activity, or create a new
                group to get started.
              </p>
              {/* CTA button opens the same "Create New Group" modal as the sidebar button. */}
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

      {/* All modals are rendered outside the main layout div so they layer on top
          of everything via the browser's stacking context. */}

      {/* Modal for creating a new group. */}
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onSubmit={handleCreateGroup}
        isLoading={createGroupMutation.isPending}
      />

      {/* Modal for inviting a new member to the currently selected group. */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteMember}
        isLoading={inviteMemberMutation.isPending}
      />

      {/* Modal for editing the currently selected group's settings.
          initialData pre-populates the form inputs with the current values. */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSubmit={handleSaveSettings}
        onDelete={handleDeleteGroup}
        initialData={settingsFormData}
        isLoading={updateGroupMutation.isPending}
      />

      {/* Role change modal: only rendered when showRoleModal is non-null,
          meaning the user has clicked "Change Role" for a specific member. */}
      {showRoleModal && (
        <RoleModal
          isOpen={true}
          onClose={() => setShowRoleModal(null)}
          onSubmit={handleUpdateRole}
          currentRole={showRoleModal.currentRole}
          isLoading={updateMemberRoleMutation.isPending}
        />
      )}

      {/* Contribution history modal for viewing past budget contributions. */}
      <ContributionHistoryModal
        isOpen={showContributionHistory}
        onClose={() => setShowContributionHistory(false)}
        contributions={contributionHistory}
        totalContributions={0}
      />
    </>
  );
}
