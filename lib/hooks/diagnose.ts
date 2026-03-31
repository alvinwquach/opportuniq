// Pull in the useQuery function from TanStack Query.
// useQuery is how we fetch and cache data from the server — it handles loading states,
// error states, and automatic background refreshes so we don't have to do that manually.
import { useQuery } from "@tanstack/react-query";

// Pull in the queryKeys helper object from the local keys file.
// queryKeys generates stable, consistent cache key arrays so every part of the app
// refers to the same cache slot when talking about the same data.
import { queryKeys } from "./keys";

// Pull in the server action that fetches everything needed for the Diagnose page.
// Server actions run on the server (not in the browser), so they can safely query
// the database. This one bundles up all the data a single diagnose page needs in
// one round-trip instead of making many separate requests.
import { getDiagnosePageData } from "@/app/actions/dashboard/getDiagnosePageData";

// Define and export a custom React hook called useDiagnosePageData.
// A hook is a reusable function that any component can call to get data.
// The optional issueId parameter lets the caller say which specific issue to load;
// if omitted, the page data is fetched without filtering to a particular issue.
export function useDiagnosePageData(issueId?: string) {
  // Call useQuery, which will automatically fetch and cache the page data.
  // Whatever useQuery returns (data, loading state, error, etc.) is passed
  // straight back to the calling component so it can render accordingly.
  return useQuery({
    // queryKey is the unique identifier for this piece of cached data.
    // TanStack Query uses this array like an address in its internal cache store.
    // Including issueId means each different issue gets its own separate cache slot,
    // so switching between issues never shows stale data from a different issue.
    queryKey: queryKeys.diagnose.pageData(issueId),

    // queryFn is the function that actually goes and fetches the data.
    // It is only called when TanStack Query decides a fresh fetch is needed
    // (e.g. first load, cache expired, manual invalidation).
    // We pass issueId through so the server action knows which issue to look up.
    queryFn: () => getDiagnosePageData(issueId),

    // staleTime tells TanStack Query how long (in milliseconds) to treat the
    // cached data as "fresh" before it considers it stale and schedules a
    // background refetch. 1000 * 60 * 2 = 120,000 ms = 2 minutes.
    // This prevents unnecessary refetches if the user navigates away and back
    // within two minutes, reducing server load and improving perceived performance.
    staleTime: 1000 * 60 * 2,
  });
}
