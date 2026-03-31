// Pull in useMutation and useQueryClient from TanStack Query.
// - useMutation    : used when we want to send a change to the server
//                    (create, update, or delete something), not just read data.
// - useQueryClient : gives us a handle to the shared cache manager so we can
//                    tell it to discard (invalidate) stale entries after a mutation.
// Note: useQuery is NOT imported here because this file only mutates data,
// it never fetches it for display.
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Pull in the queryKeys helper that generates consistent, stable cache key arrays.
// Central key definitions prevent typos that would cause the wrong cache slot
// to be invalidated after a mutation.
import { queryKeys } from "./keys";

// Pull in the two vendor-related server actions.
// Server actions run on the server (not in the browser) so they can safely
// write to the database.
// - markVendorContacted : records that the user has reached out to a specific vendor
// - addVendorQuote      : saves a price quote received from a vendor
import {
  markVendorContacted,
  addVendorQuote,
} from "@/app/actions/vendors/vendorActions";

// Define and export a custom hook called useMarkVendorContacted.
// UI components call this when the user taps/clicks a "Mark as Contacted" button
// next to a vendor. The hook returns { mutate, isPending, error } so the button
// can show a spinner while the save is in progress and display an error if it fails.
export function useMarkVendorContacted() {
  // Grab a reference to the global cache manager.
  // We need it so we can tell specific cache entries to refresh after
  // successfully recording that the vendor was contacted.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn is the function that actually runs when mutate() is called.
    // It receives an object with:
    // - vendorId : the unique ID of the vendor being marked as contacted
    // - issueId  : (optional) the issue this vendor is associated with;
    //              used after the mutation to refresh the right issue's cache,
    //              but NOT passed to the server action (which only needs vendorId).
    mutationFn: ({ vendorId, issueId }: { vendorId: string; issueId?: string }) =>
      markVendorContacted(vendorId),

    // onSuccess runs automatically after the server confirms the contact was recorded.
    // The second argument (the underscore _) is the return value of the mutation,
    // which we don't need here. The named { issueId } comes from the variables
    // the caller originally passed to mutate().
    onSuccess: (_, { issueId }) => {
      // Only invalidate issue-specific cache entries if we know which issue this is for.
      // Invalidating makes TanStack Query treat those cache slots as stale so the next
      // render of any component reading that issue will trigger a fresh server fetch.
      if (issueId) {
        // Throw away the cached detail view for this specific issue so it reloads
        // with the updated "contacted" status on the vendor.
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });

        // Also throw away the "withOptions" variant of this issue's cache,
        // which bundles the issue together with its vendor options and other extras.
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.withOptions(issueId) });
      }

      // Invalidate the entire decisions cache as well, because the contacted status
      // of a vendor can affect which decision options are presented to the user.
      // queryKeys.decisions.all covers every decisions-related cache entry.
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
    },
  });
}

// Define and export a custom hook called useAddVendorQuote.
// UI components call this when the user submits a quote they received from a vendor
// (e.g. after a vendor emails them a price estimate).
// Returns { mutate, isPending, error } for the calling component to use.
export function useAddVendorQuote() {
  // Get the cache manager reference so we can invalidate stale entries after saving.
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn runs when mutate(variables) is called.
    // The variables object carries:
    // - vendorId : ID of the vendor who provided the quote
    // - amount   : the quoted price as a string (e.g. "150.00")
    // - details  : (optional) free-text notes about what the quote covers
    // - issueId  : (optional) the issue this quote belongs to, used only for
    //              cache invalidation below — NOT forwarded to the server action
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
    }) => addVendorQuote(vendorId, amount, details),

    // onSuccess fires after the quote is successfully saved on the server.
    // We discard stale cache entries so the UI re-fetches and shows the new quote.
    onSuccess: (_, { issueId }) => {
      // If we know which issue the quote belongs to, refresh both of its cache entries
      // so the issue detail page and its options view show the newly saved quote.
      if (issueId) {
        // Invalidate the plain detail cache for this issue.
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });

        // Invalidate the "withOptions" cache variant (includes vendor options/quotes).
        queryClient.invalidateQueries({ queryKey: queryKeys.issues.withOptions(issueId) });
      }

      // Invalidate the decisions cache because a new quote can change which
      // decision option looks most cost-effective to the user.
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all });
    },
  });
}
