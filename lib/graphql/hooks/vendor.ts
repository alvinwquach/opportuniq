/**
 * Vendor GraphQL Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import * as mutations from "../mutations";
import { queryKeys } from "../keys";
import type { VendorContactResponse } from "../types";

/**
 * Mark a vendor as contacted
 */
export function useMarkVendorContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, issueId }: { vendorId: string; issueId?: string }) =>
      gqlRequest<{ markVendorContacted: VendorContactResponse }>(
        mutations.VENDOR_MARK_CONTACTED_MUTATION,
        { vendorId }
      ),
    onSuccess: (_, { issueId }) => {
      // Invalidate issue to refresh vendor list
      if (issueId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.withOptions(issueId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
    },
  });
}

/**
 * Add or update a vendor quote
 */
export function useAddVendorQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      amount,
      details,
      issueId,
    }: {
      vendorId: string;
      amount: string;
      details?: string;
      issueId?: string;
    }) =>
      gqlRequest<{ addVendorQuote: VendorContactResponse }>(
        mutations.VENDOR_ADD_QUOTE_MUTATION,
        { vendorId, amount, details }
      ),
    onSuccess: (_, { issueId }) => {
      // Invalidate issue to refresh vendor list
      if (issueId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.withOptions(issueId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
    },
  });
}
