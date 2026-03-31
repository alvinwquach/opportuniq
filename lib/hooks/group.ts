// ─── Imports ────────────────────────────────────────────────────────────────
// useQuery    → fetch data from the server and cache it in memory
// useMutation → send data changes (create / update / delete) to the server
// useQueryClient → gives access to the cache so we can invalidate stale data
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// queryKeys → a central object that generates stable cache key arrays.
// TanStack Query uses these keys to identify which cached data belongs
// to which request, so it never mixes up different queries.
import { queryKeys } from "./keys";

// getGroupsPageData → server action that loads everything needed for the
// Groups dashboard page in a single round-trip (groups, members, stats, etc.)
import { getGroupsPageData } from "@/app/actions/dashboard/getGroupsPageData";

// All the individual group-related server actions (each one talks to the DB):
// getMyGroups             → list of groups the current user belongs to
// getGroup                → single group by its ID
// getGroupWithMembers     → single group + its full member list
// getGroupInvitations     → pending invitations for a specific group
// getMyPendingInvitations → invitations waiting for the current user to respond
// createGroup             → create a new group (current user becomes coordinator)
// updateGroup             → change the group's name, postal code, or search radius
// leaveGroup              → remove the current user from a group
// inviteMember            → send an invitation email to a new member
// removeMember            → kick an existing member out of a group
// updateMemberRole        → change what role (e.g. coordinator → collaborator) a member has
// updateGroupConstraints  → save the group's budget / risk settings
// acceptInvitation        → join a group the user was invited to
// declineInvitation       → reject a group invitation
import {
  getMyGroups,
  getGroup,
  getGroupWithMembers,
  getGroupInvitations,
  getMyPendingInvitations,
  createGroup,
  updateGroup,
  leaveGroup,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateGroupConstraints,
  acceptInvitation,
  declineInvitation,
} from "@/app/actions/groups/groupActions";

// ─── Read Hooks (useQuery) ───────────────────────────────────────────────────
// Each hook below wraps a server action in a useQuery call.
// React components call these hooks to get data. The library handles:
//   • showing a loading state while the request is in flight
//   • caching the result so the same data isn't fetched twice
//   • background refetching to keep the UI fresh
//   • deduplicating requests when multiple components ask for the same data

// useMyGroups
// Returns all groups the current user is an active member of.
// Components use: const { data, isLoading } = useMyGroups()
export function useMyGroups() {
  return useQuery({
    // Cache key — TanStack Query stores the response under this key.
    // Any other useMyGroups() call anywhere in the app will reuse the same cache entry.
    queryKey: queryKeys.groups.myGroups(),
    // The actual fetch — calls the server action which queries the database.
    queryFn: () => getMyGroups(),
  });
}

// useGroup
// Returns the details of ONE group by its database ID.
// `id` is passed in by the component that needs a specific group.
export function useGroup(id: string) {
  return useQuery({
    // Unique cache key per group ID so group "abc" and group "xyz" are stored separately.
    queryKey: queryKeys.groups.detail(id),
    queryFn: () => getGroup(id),
    // enabled: !!id → only run the query when `id` is a non-empty string.
    // Without this guard, we'd fire a request with id="" on the first render.
    enabled: !!id,
  });
}

// useGroupWithMembers
// Like useGroup but also fetches the full member list in one shot.
// Use this when you need to display or manage members on the screen.
export function useGroupWithMembers(id: string) {
  return useQuery({
    // Separate cache key from useGroup so they can be invalidated independently.
    queryKey: queryKeys.groups.withMembers(id),
    queryFn: () => getGroupWithMembers(id),
    // Same guard — don't run until we have a real ID.
    enabled: !!id,
  });
}

// useGroupInvitations
// Returns all PENDING (not yet accepted/declined) invitations for a specific group.
// Used by coordinators to see who has been invited but hasn't joined yet.
export function useGroupInvitations(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groups.invitations(groupId),
    queryFn: () => getGroupInvitations(groupId),
    // Only fetch when groupId is truthy — same guard pattern as above.
    enabled: !!groupId,
  });
}

// useMyPendingInvitations
// Returns all invitations that have been sent TO the current user (across all groups).
// Used for the "You've been invited" notification / inbox.
export function useMyPendingInvitations() {
  return useQuery({
    // Uses the invitations namespace in the key hierarchy.
    queryKey: queryKeys.invitations.pending(),
    queryFn: () => getMyPendingInvitations(),
  });
}

// ─── Mutation Hooks (useMutation) ────────────────────────────────────────────
// Each hook below wraps a server action in a useMutation call.
// React components call the returned `.mutate()` function to trigger the change.
// After the server responds successfully, `onSuccess` invalidates the relevant
// cache entries so that any queries watching that data will automatically refetch.

// useCreateGroup
// Creates a brand-new group and marks the current user as its coordinator.
export function useCreateGroup() {
  // Get access to the shared query cache so we can clear stale entries after success.
  const queryClient = useQueryClient();

  return useMutation({
    // The function that runs when the component calls mutate({ name, postalCode, ... })
    // input → the new group's name and optional postal code / search radius
    mutationFn: (input: { name: string; postalCode?: string; defaultSearchRadius?: number }) =>
      createGroup(input),
    // After the group is created, tell the cache that all groups-related data
    // and all user-related data are stale and should be refetched.
    // groups.all → clears every cached query under the "groups" namespace
    // user.all   → clears user data that includes group memberships
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

// useUpdateGroup
// Updates a group's name, postal code, or default search radius.
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts an object with:
    //   id    → the group to update
    //   input → the fields to change (all optional — you can change just the name, for example)
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { name?: string; postalCode?: string; defaultSearchRadius?: number };
    }) => updateGroup(id, input),
    // `_` is the server's return value (we don't need it here).
    // `{ id }` is destructured from the variables we passed to mutate() so we know
    // which group's cache entry to invalidate.
    onSuccess: (_, { id }) => {
      // Only clear the cache for the specific group that changed, not all groups.
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(id) });
    },
  });
}

// useLeaveGroup
// Removes the current user from the specified group.
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    // Takes just a groupId string — no other data needed to leave.
    mutationFn: (groupId: string) => leaveGroup(groupId),
    // After leaving, clear ALL group and user caches because the user's
    // group list and membership counts have both changed.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

// useAcceptInvitation
// Accepts a pending invitation, adding the current user to that group.
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    // Takes the invitation's database ID (a UUID string).
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    // Three caches become stale simultaneously after accepting:
    //   groups.all      → user now has a new group in their list
    //   invitations.all → the accepted invitation should no longer appear as "pending"
    //   user.all        → user profile / membership data has changed
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

// useDeclineInvitation
// Declines (permanently dismisses) a pending group invitation.
export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    // Takes the invitation's database ID.
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    // Only invitations cache needs clearing — declining doesn't change group membership.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
  });
}

// useUpdateMemberRole
// Changes the role of an existing group member (e.g. from "participant" to "coordinator").
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts an object with:
    //   groupId  → which group the member belongs to
    //   memberId → the membership record ID (NOT the user's ID)
    //   role     → the new role string (e.g. "coordinator", "collaborator")
    mutationFn: ({
      groupId,
      memberId,
      role,
    }: {
      groupId: string;
      memberId: string;
      role: string;
    }) => updateMemberRole(groupId, memberId, role),
    // Only invalidate the member list for the affected group, not all groups.
    // `_` = return value (unused), `{ groupId }` = destructured from the variables.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
    },
  });
}

// useUpdateGroupConstraints
// Saves the group's financial / behavioral settings:
//   monthlyBudget    → total dollars the group can spend each month
//   emergencyBuffer  → how much to keep in reserve for emergencies
//   riskTolerance    → how risk-averse the group is ("low" | "medium" | "high")
//   diyPreference    → whether the group prefers DIY repairs or hiring pros
//   neverDIY         → list of issue categories that must always be hired out
export function useUpdateGroupConstraints() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts an object with:
    //   groupId → which group to update settings for
    //   input   → the settings fields to change (all optional)
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input: {
        monthlyBudget?: string;
        emergencyBuffer?: string;
        riskTolerance?: string;
        diyPreference?: string;
        neverDIY?: string[];
      };
    }) => updateGroupConstraints(groupId, input),
    // The group detail page shows these settings, so invalidate just that one group's cache.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
}

// useInviteMember
// Sends a group invitation email to a new person and records it in the database.
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts an object with:
    //   groupId → which group to invite the person to
    //   email   → the invitee's email address
    //   role    → what role they'll have when they accept (e.g. "collaborator")
    mutationFn: ({
      groupId,
      email,
      role,
    }: {
      groupId: string;
      email: string;
      role: string;
    }) => inviteMember(groupId, email, role),
    // After inviting, two caches become stale:
    //   withMembers(groupId)  → member list now has a "pending" invitation entry
    //   invitations(groupId)  → invitation list for this group has a new item
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invitations(groupId) });
    },
  });
}

// useRemoveMember
// Kicks an existing member out of a group (coordinator-only action in the UI).
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts an object with:
    //   groupId  → which group to remove the member from
    //   memberId → the membership record ID (NOT the user's ID — one user can
    //              belong to multiple groups, so the membership record is unique)
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      removeMember(groupId, memberId),
    // Only the member list for that specific group needs to be cleared.
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.withMembers(groupId) });
    },
  });
}

// useGroupsPageData
// Fetches ALL data needed to render the full Groups dashboard page in one call.
// This is more efficient than calling useMyGroups + useGroupWithMembers separately
// because it combines everything into a single database round-trip on the server.
export function useGroupsPageData() {
  return useQuery({
    queryKey: queryKeys.groups.pageData(),
    queryFn: () => getGroupsPageData(),
    // staleTime: 2 minutes — treat the cached data as "fresh" for 2 minutes
    // before allowing a background refetch. This prevents hammering the server
    // every time the component re-renders.
    staleTime: 1000 * 60 * 2,
    // refetchOnWindowFocus: true — when the user switches back to this browser tab,
    // trigger a background refetch so the data doesn't go stale while they were away.
    refetchOnWindowFocus: true,
  });
}
