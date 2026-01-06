"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserGroups, createGroup, updateGroup, deleteGroup } from "@/app/dashboard/groups/actions";

interface CreateGroupInput {
  name: string;
  postalCode?: string;
  defaultSearchRadius: number;
}

interface UpdateGroupInput {
  groupId: string;
  name: string;
  postalCode?: string;
  defaultSearchRadius: number;
}

export interface GroupMembership {
  group: {
    id: string;
    name: string;
    postalCode: string | null;
    defaultSearchRadius: number;
    createdAt: Date;
  };
  membership: {
    role: string;
    status: string;
    joinedAt: Date;
  };
}

interface GroupsResponse {
  groups: GroupMembership[];
}

export function useGroups() {
  return useQuery<GroupsResponse>({
    queryKey: ["groups"],
    queryFn: async () => {
      const result = await getUserGroups();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch groups");
      }
      return { groups: result.groups as GroupMembership[] };
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const result = await createGroup(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to create group");
      }
      return result;
    },
    onMutate: async (newGroup: CreateGroupInput) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });

      const previousGroups = queryClient.getQueryData<GroupsResponse>(["groups"]);

      // Optimistically add the new group
      queryClient.setQueryData<GroupsResponse>(["groups"], (old) => {
        const optimisticGroup: GroupMembership = {
          group: {
            id: `temp-${Date.now()}`,
            name: newGroup.name,
            postalCode: newGroup.postalCode || null,
            defaultSearchRadius: newGroup.defaultSearchRadius,
            createdAt: new Date(),
          },
          membership: {
            role: "coordinator",
            status: "active",
            joinedAt: new Date(),
          },
        };

        if (!old) return { groups: [optimisticGroup] };
        return { groups: [optimisticGroup, ...old.groups] };
      });

      return { previousGroups };
    },
    onError: (_err, _newGroup, context) => {
      // Rollback on error
      if (context?.previousGroups) {
        queryClient.setQueryData(["groups"], context.previousGroups);
      }
    },
    onSettled: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, ...data }: UpdateGroupInput) => {
      const result = await updateGroup(groupId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update group");
      }
      return result;
    },
    onMutate: async (updatedGroup: UpdateGroupInput) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });

      const previousGroups = queryClient.getQueryData<GroupsResponse>(["groups"]);

      // Optimistically update the group
      queryClient.setQueryData<GroupsResponse>(["groups"], (old) => {
        if (!old) return old;
        return {
          groups: old.groups.map((g) =>
            g.group.id === updatedGroup.groupId
              ? {
                  ...g,
                  group: {
                    ...g.group,
                    name: updatedGroup.name,
                    postalCode: updatedGroup.postalCode || null,
                    defaultSearchRadius: updatedGroup.defaultSearchRadius,
                  },
                }
              : g
          ),
        };
      });

      return { previousGroups };
    },
    onError: (_err, _updatedGroup, context) => {
      // Rollback on error
      if (context?.previousGroups) {
        queryClient.setQueryData(["groups"], context.previousGroups);
      }
    },
    onSettled: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const result = await deleteGroup(groupId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete group");
      }
      return result;
    },
    onMutate: async (groupId: string) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });

      const previousGroups = queryClient.getQueryData<GroupsResponse>(["groups"]);

      // Optimistically remove the group
      queryClient.setQueryData<GroupsResponse>(["groups"], (old) => {
        if (!old) return old;
        return {
          groups: old.groups.filter((g) => g.group.id !== groupId),
        };
      });

      return { previousGroups };
    },
    onError: (_err, _groupId, context) => {
      // Rollback on error
      if (context?.previousGroups) {
        queryClient.setQueryData(["groups"], context.previousGroups);
      }
    },
    onSettled: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
