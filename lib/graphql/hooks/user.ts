/**
 * User GraphQL Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as queries from "../queries";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type {
  MeResponse,
  MeWithGroupsResponse,
  UserResponse,
  UpdateProfileInput,
  UpdatePreferencesInput,
} from "../types";

/**
 * Get current authenticated user
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => gqlRequest<{ me: MeResponse }>(queries.USER_ME_QUERY),
    select: (data) => data.me,
  });
}

/**
 * Get current user with groups
 */
export function useMeWithGroups() {
  return useQuery({
    queryKey: queryKeys.user.meWithGroups(),
    queryFn: () => gqlRequest<{ me: MeWithGroupsResponse }>(queries.USER_WITH_GROUPS_QUERY),
    select: (data) => data.me,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateProfileInput) =>
      gqlRequest<{ updateProfile: UserResponse }>(
        mutations.USER_UPDATE_PROFILE_MUTATION,
        variables
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdatePreferencesInput) =>
      gqlRequest<{ updatePreferences: UserResponse }>(
        mutations.USER_UPDATE_PREFERENCES_MUTATION,
        variables
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
